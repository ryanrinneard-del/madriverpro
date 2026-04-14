"""
POST /api/generate-pdfs

Internal endpoint invoked by /api/process-profile after a profile has been
analyzed. Runs the three ReportLab templates in /scripts/pdf/ and uploads the
resulting PDFs to Vercel Blob under profiles/{id}/.

Each template's build_pdf(output_path, data) accepts the structured payload
produced by /api/process-profile and persisted as profiles/{id}/analysis.json.
"""

import io
import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler
from urllib import request as urllib_request
from urllib.error import HTTPError

# Make /scripts/pdf importable regardless of Vercel's cwd.
HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(HERE)
SCRIPTS_PDF = os.path.join(REPO_ROOT, 'scripts', 'pdf')
if SCRIPTS_PDF not in sys.path:
    sys.path.insert(0, SCRIPTS_PDF)

BLOB_API = 'https://blob.vercel-storage.com'


def _blob_put(pathname: str, data: bytes, content_type: str) -> str:
    """Upload bytes to Vercel Blob. Returns the public URL."""
    token = os.environ.get('BLOB_READ_WRITE_TOKEN')
    if not token:
        raise RuntimeError('BLOB_READ_WRITE_TOKEN is not set')
    url = f'{BLOB_API}/{pathname}'
    req = urllib_request.Request(
        url,
        data=data,
        method='PUT',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': content_type,
            'x-api-version': '7',
            'x-add-random-suffix': '0',
            'x-allow-overwrite': '1',
        },
    )
    with urllib_request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode('utf-8')
    parsed = json.loads(body)
    return parsed.get('url', '')


def _blob_get_json(pathname: str):
    """Fetch a JSON blob by pathname via list+GET."""
    token = os.environ.get('BLOB_READ_WRITE_TOKEN')
    if not token:
        raise RuntimeError('BLOB_READ_WRITE_TOKEN is not set')
    # Use the list API to resolve the pathname to a URL.
    list_url = f'{BLOB_API}?prefix={pathname}'
    req = urllib_request.Request(
        list_url,
        headers={'Authorization': f'Bearer {token}', 'x-api-version': '7'},
    )
    with urllib_request.urlopen(req, timeout=15) as resp:
        listing = json.loads(resp.read().decode('utf-8'))
    match = next((b for b in listing.get('blobs', []) if b.get('pathname') == pathname), None)
    if not match:
        return None
    with urllib_request.urlopen(match['url'], timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _build_pdf_to_bytes(template_module_name: str, data: dict) -> bytes:
    """Invoke a template's build_pdf(path, data) and return the rendered bytes."""
    import importlib
    module = importlib.import_module(template_module_name)
    tmp_path = f'/tmp/{template_module_name}.pdf'
    module.build_pdf(tmp_path, data)
    with open(tmp_path, 'rb') as fh:
        return fh.read()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0) or 0)
            raw = self.rfile.read(length) if length else b'{}'
            try:
                body = json.loads(raw.decode('utf-8'))
            except Exception:
                body = {}

            submission_id = body.get('id')
            if not submission_id:
                return self._json(400, {'error': 'id is required'})

            # Optional internal-token check; soft gate since this is fire-and-forget
            expected = os.environ.get('INTERNAL_PIPELINE_TOKEN', '')
            supplied = self.headers.get('x-internal-token', '')
            if expected and expected != supplied:
                return self._json(401, {'error': 'unauthorized'})

            # Load the structured analysis produced by /api/process-profile.
            analysis_path = f'profiles/{submission_id}/analysis.json'
            try:
                data = _blob_get_json(analysis_path)
            except Exception as e:
                traceback.print_exc()
                return self._json(500, {'error': f'Failed to load analysis.json: {e}'})
            if not data:
                return self._json(404, {'error': f'{analysis_path} not found'})

            results = {}
            for module_name, out_name in (
                ('session1_plan_template', 'session1_plan.pdf'),
                ('arc_template', 'arc.pdf'),
                ('dossier_template', 'dossier.pdf'),
            ):
                try:
                    pdf_bytes = _build_pdf_to_bytes(module_name, data)
                    url = _blob_put(
                        f'profiles/{submission_id}/{out_name}',
                        pdf_bytes,
                        'application/pdf',
                    )
                    results[out_name] = {'ok': True, 'url': url, 'bytes': len(pdf_bytes)}
                except Exception as e:
                    results[out_name] = {'ok': False, 'error': f'{type(e).__name__}: {e}'}
                    traceback.print_exc()

            # Best-effort index update — invoke the Node helper by writing a
            # "status marker" blob the admin endpoint can read.
            marker = {
                'id': submission_id,
                'pdfs': results,
                'completedAt': None,
            }
            from datetime import datetime, timezone
            marker['completedAt'] = datetime.now(timezone.utc).isoformat()
            try:
                _blob_put(
                    f'profiles/{submission_id}/pdfs.json',
                    json.dumps(marker, indent=2).encode('utf-8'),
                    'application/json',
                )
            except Exception as e:
                traceback.print_exc()

            all_ok = all(r.get('ok') for r in results.values())
            return self._json(200 if all_ok else 500, {
                'success': all_ok,
                'id': submission_id,
                'results': results,
            })
        except Exception as e:
            traceback.print_exc()
            return self._json(500, {'error': f'{type(e).__name__}: {e}'})

    def _json(self, status, obj):
        data = json.dumps(obj).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)
