// GET /api/list-submissions
// Admin-only. Returns the index + asset URLs for each submission.

import { isAdminRequest, readIndex, fetchBlob } from './_lib/storage.js';
import { list } from '@vercel/blob';

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

        // Enrich each with the three PDF URLs + analysis URL if they exist.
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const enriched = await Promise.all(submissions.map(async (s) => {
            try {
                const blobs = await list({ prefix: `profiles/${s.id}/`, token });
                const byName = {};
                for (const b of blobs.blobs) {
                    const name = b.pathname.split('/').pop();
                    byName[name] = b.url;
                }
                // Merge pdf status if present
                let pdfStatus = null;
                if (byName['pdfs.json']) {
                    try {
                        const r = await fetch(byName['pdfs.json'], { cache: 'no-store' });
                        if (r.ok) pdfStatus = await r.json();
                    } catch {}
                }
                return {
                    ...s,
                    assets: {
                        analysis: byName['analysis.md'] || null,
                        submission: byName['submission.json'] || null,
                        session1_plan: byName['session1_plan.pdf'] || null,
                        arc: byName['arc.pdf'] || null,
                        dossier: byName['dossier.pdf'] || null,
                    },
                    pdfStatus,
                };
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
