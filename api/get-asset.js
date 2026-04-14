// GET /api/get-asset?id={submissionId}&kind={kind}
//
// Admin-only proxy for reading artifacts out of the Private Vercel Blob store.
// Because the store is Private, raw blob URLs aren't browser-fetchable — this
// endpoint verifies the admin cookie, then streams the content back with the
// right Content-Type so the admin dashboard can display / download them.
//
// kind → pathname mapping:
//   analysis   → profiles/{id}/analysis.md
//   submission → profiles/{id}/submission.json
//   session1   → profiles/{id}/session1_plan.pdf
//   arc        → profiles/{id}/arc.pdf
//   dossier    → profiles/{id}/dossier.pdf
//   pdfs       → profiles/{id}/pdfs.json

import { head } from '@vercel/blob';
import { isAdminRequest, requireEnv } from './_lib/storage.js';

const KIND_MAP = {
    analysis:   { file: 'analysis.md',        type: 'text/markdown; charset=utf-8',      inline: true  },
    submission: { file: 'submission.json',    type: 'application/json; charset=utf-8',   inline: true  },
    session1:   { file: 'session1_plan.pdf',  type: 'application/pdf',                   inline: true  },
    arc:        { file: 'arc.pdf',            type: 'application/pdf',                   inline: true  },
    dossier:    { file: 'dossier.pdf',        type: 'application/pdf',                   inline: true  },
    pdfs:       { file: 'pdfs.json',          type: 'application/json; charset=utf-8',   inline: true  },
};

// Guard the id to simple URL-safe characters so callers can't inject `../`.
const ID_RE = /^[A-Za-z0-9_-]+$/;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!isAdminRequest(req)) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    const { id, kind } = req.query || {};
    if (!id || !ID_RE.test(String(id))) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    const spec = KIND_MAP[String(kind)];
    if (!spec) {
        return res.status(400).json({ error: 'Invalid kind' });
    }

    let token;
    try {
        token = requireEnv('BLOB_READ_WRITE_TOKEN');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    const pathname = `profiles/${id}/${spec.file}`;

    let signedUrl;
    try {
        const h = await head(pathname, { token });
        signedUrl = h.url;
    } catch (err) {
        // @vercel/blob throws BlobNotFoundError with status 404 on missing keys.
        const status = err?.status || (err?.name === 'BlobNotFoundError' ? 404 : 500);
        return res.status(status).json({ error: `Asset not found: ${spec.file}` });
    }

    let upstream;
    try {
        upstream = await fetch(signedUrl, { cache: 'no-store' });
    } catch (err) {
        console.error('get-asset fetch error:', err);
        return res.status(502).json({ error: 'Upstream fetch failed.' });
    }
    if (!upstream.ok) {
        return res.status(upstream.status).json({ error: `Upstream responded ${upstream.status}` });
    }

    const disposition = spec.inline
        ? `inline; filename="${spec.file}"`
        : `attachment; filename="${spec.file}"`;
    res.setHeader('Content-Type', spec.type);
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'private, no-store');

    const len = upstream.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
}
