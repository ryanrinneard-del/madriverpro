// GET /api/list-submissions
// Admin-only. Returns the index + proxy asset URLs for each submission.
//
// Because the Vercel Blob store is configured as Private, we don't return the
// raw blob URLs — instead we return paths to /api/get-asset which verifies the
// admin cookie server-side before streaming the content.

import { isAdminRequest, readIndex, fetchBlob } from './_lib/storage.js';
import { list } from '@vercel/blob';

// Map the on-disk filenames to (kind, asset-field) pairs for the proxy URL.
const FILE_TO_ASSET = {
    'analysis.md':       { kind: 'analysis',   field: 'analysis'      },
    'submission.json':   { kind: 'submission', field: 'submission'    },
    'session1_plan.pdf': { kind: 'session1',   field: 'session1_plan' },
    'arc.pdf':           { kind: 'arc',        field: 'arc'           },
    'dossier.pdf':       { kind: 'dossier',    field: 'dossier'       },
};

function proxyUrl(id, kind) {
    return `/api/get-asset?id=${encodeURIComponent(id)}&kind=${kind}`;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!isAdminRequest(req)) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    try {
        const index = await readIndex();
        const submissions = index.submissions || [];

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const enriched = await Promise.all(submissions.map(async (s) => {
            try {
                const blobs = await list({ prefix: `profiles/${s.id}/`, token });
                const present = new Set(
                    blobs.blobs.map((b) => b.pathname.split('/').pop())
                );

                const assets = {
                    analysis:      null,
                    submission:    null,
                    session1_plan: null,
                    arc:           null,
                    dossier:       null,
                };
                for (const [filename, { kind, field }] of Object.entries(FILE_TO_ASSET)) {
                    if (present.has(filename)) {
                        assets[field] = proxyUrl(s.id, kind);
                    }
                }

                // Read the pdfs.json status marker server-side (Private store,
                // so we use fetchBlob with the pathname instead of a raw URL).
                let pdfStatus = null;
                if (present.has('pdfs.json')) {
                    try {
                        const r = await fetchBlob(`profiles/${s.id}/pdfs.json`);
                        if (r.ok) pdfStatus = await r.json();
                    } catch {}
                }

                return { ...s, assets, pdfStatus };
            } catch (err) {
                return { ...s, assets: {}, pdfStatus: null };
            }
        }));

        return res.status(200).json({ submissions: enriched });
    } catch (err) {
        console.error('list-submissions error:', err);
        return res.status(500).json({ error: 'Failed to list submissions.' });
    }
}
