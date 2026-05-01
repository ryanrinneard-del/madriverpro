// =====================================================================
// POST /api/compute-sg
// =====================================================================
// Compute the four-category Strokes Gained breakdown for a round and
// return it as JSON. The scorecard calls this endpoint right before
// inserting the round into Supabase, then includes the SG payload as
// the `strokes_gained` field on the round.
//
// Centralizing the math here means:
//   - Baselines live in ONE place (api/_lib/sg-baselines.js).
//   - All 4 scorecard variants stay lean — they just POST the round.
//   - We can backfill old rounds via the same endpoint later.
//   - β → γ baseline transition happens server-side, transparent to clients.
//
// Request body:
//   {
//     round:   <round payload — same shape as what RRG.subs.create receives>,
//     profile: { handicap?: <number|string|null> }   // optional; falls back to 10-handicap tier
//   }
//
// Response:
//   200 { strokes_gained: { tier, total, categories, top_leak, prescription, computed_at } }
//   400 if request is malformed
//   500 if compute throws

import { computeStrokesGained } from './_lib/sg-compute.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  // Vercel sometimes hands us a string body — be defensive.
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
  }

  const round = body && body.round;
  if (!round || typeof round !== 'object') {
    return res.status(400).json({ error: 'Missing round payload' });
  }

  const profile = (body && body.profile) || {};

  try {
    const sg = computeStrokesGained(round, profile);
    return res.status(200).json({ strokes_gained: sg });
  } catch (err) {
    console.error('compute-sg error:', err);
    return res.status(500).json({ error: 'SG compute failed', detail: err.message });
  }
};
