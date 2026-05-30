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
//   game_plan  → profiles/{id}/game_plan.pdf
//   arc        → profiles/{id}/arc.pdf
//   dossier    → profiles/{id}/dossier.pdf
//   pdfs       → profiles/{id}/pdfs.json

import { head } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest, requireEnv } from './_lib/storage.js';

const KIND_MAP = {
    analysis:   { file: 'analysis.md',        type: 'text/markdown; charset=utf-8',      inline: true  },
    submission: { file: 'submission.json',    type: 'application/json; charset=utf-8',   inline: true  },
    game_plan:  { file: 'game_plan.pdf',      type: 'application/pdf',                   inline: true  },
    arc:        { file: 'arc.pdf',            type: 'application/pdf',                   inline: true  },
    dossier:    { file: 'dossier.pdf',        type: 'application/pdf',                   inline: true  },
    pdfs:       { file: 'pdfs.json',          type: 'application/json; charset=utf-8',   inline: true  },
};

// Guard the id to simple URL-safe characters so callers can't inject `../`.
const ID_RE = /^[A-Za-z0-9_-]+$/;

// Kinds a player may download for THEIR OWN id (coach-only kinds — dossier,
// analysis, submission, pdfs — stay admin-only).
const PLAYER_KINDS = new Set(['game_plan', 'arc']);

// Branded download filenames (used when ?download=1).
const DOWNLOAD_NAMES = {
    game_plan: 'RR-Golf-Game-Plan.pdf',
    arc:       'RR-Golf-6-Week-Arc.pdf',
    dossier:   'RR-Golf-Coach-Dossier.pdf',
};

// Verify a Supabase access token (Authorization: Bearer) and confirm it belongs
// to the player whose id is being requested — so a signed-in player can pull
// only their own assets.
async function isOwner(req, id) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return false;
    const authz = req.headers.authorization || '';
    const tok = authz.startsWith('Bearer ') ? authz.slice(7).trim() : '';
    if (!tok) return false;
    try {
        const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
        const { data, error } = await sb.auth.getUser(tok);
        if (error || !data?.user) return false;
        return data.user.id === id;
    } catch {
        return false;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, kind } = req.query || {};
    if (!id || !ID_RE.test(String(id))) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    const spec = KIND_MAP[String(kind)];
    if (!spec) {
        return res.status(400).json({ error: 'Invalid kind' });
    }

    // Authorize: the coach (admin cookie) can read anything; a signed-in player
    // can read only their OWN game_plan / arc.
    let authed = isAdminRequest(req);
    if (!authed && PLAYER_KINDS.has(String(kind))) {
        authed = await isOwner(req, String(id));
    }
    if (!authed) {
        return res.status(401).json({ error: 'Not authenticated.' });
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
        // Private Blob store: the object URL isn't publicly readable — it must
        // be fetched with the read-write token (Authorization: Bearer <token>).
        upstream = await fetch(signedUrl, {
            cache: 'no-store',
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error('get-asset fetch error:', err);
        return res.status(502).json({ error: 'Upstream fetch failed.' });
    }
    if (!upstream.ok) {
        return res.status(upstream.status).json({ error: `Upstream responded ${upstream.status}` });
    }

    // ?download=1 forces a download with a branded filename; otherwise inline.
    const wantDownload = ['1', 'true'].includes(String(req.query.download || ''));
    const dlName = DOWNLOAD_NAMES[String(kind)] || spec.file;
    const disposition = (wantDownload || !spec.inline)
        ? `attachment; filename="${dlName}"`
        : `inline; filename="${spec.file}"`;
    res.setHeader('Content-Type', spec.type);
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'private, no-store');

    const len = upstream.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
}
