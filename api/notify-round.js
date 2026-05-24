// =====================================================================
// POST /api/notify-round
// =====================================================================
// Send Ryan an email summary of a round any time a player submits one.
// Called fire-and-forget from the scorecard / submit-round pages right
// after RRG.subs.create resolves. Failures here NEVER affect the player's
// submit — the page already inserted the round into Supabase before
// this endpoint is called.
//
// Reuses the Resend integration already wired up in /api/approve-profile.js.
// Requires RESEND_API_KEY (already set on Vercel) and optionally
// RESEND_FROM_EMAIL.
//
// Request body shape (anything not present is gracefully skipped):
//   {
//     id:        <round uuid in Supabase>            // optional, for deep-link
//     player:    <display name>                      // required
//     email:     <player email>                      // optional
//     cohort:    'junior_elite_2026' | 'adult_coaching_2026'
//     course:    'Mad River Golf Club' | <course name>
//     tees:      'Green/White' | <tee label>
//     date:      '2026-05-10'                        // round date
//     score:     78                                  // total strokes
//     holes:     18                                  // 9 or 18
//     top_leak:  'Putting'                           // SG category, optional
//     top_leak_strokes: -3.2                         // SG total, optional
//     summary:   { fir: '8/14', gir: '9/18', putts: 32, t5: 3 }  // optional rollups
//   }
//
// Response: 200 {ok:true, id:<resend message id>} on success, 500 on
// failure. Clients should ignore failures.

import { Resend } from 'resend';

const RYAN_EMAIL = 'ryan@rrgolfperformance.com';
const ESC = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  if (!body || !body.player) return res.status(400).json({ error: 'player required' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('[notify-round] RESEND_API_KEY not set — skipping notification');
    return res.status(200).json({ ok: false, skipped: 'no-resend-key' });
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL
    || 'Ryan Rinneard <ryan@rrgolfperformance.com>';

  // Derive subject + readable cohort label
  const cohortLabel = body.cohort === 'junior_elite_2026' ? 'Junior Elite'
                   : body.cohort === 'adult_coaching_2026' ? 'Adult'
                   : '';
  const courseShort = (body.course || '').replace(/Golf Club$/i, 'GC').trim();
  const subject = `New round — ${body.player}${cohortLabel ? ' (' + cohortLabel + ')' : ''} shot ${body.score || '?'} at ${courseShort || 'a course'}`;

  // Plain-text fallback for clients that don't render HTML
  const lines = [
    `${body.player} just logged a round.`,
    '',
    `Score:     ${body.score ?? '—'}  (${body.holes || 18} holes)`,
    `Course:    ${body.course || '—'}${body.tees ? ' — ' + body.tees + ' tees' : ''}`,
    `Date:      ${body.date || '—'}`,
    cohortLabel ? `Cohort:    ${cohortLabel}` : '',
    body.summary && body.summary.fir   ? `FIR:       ${body.summary.fir}`   : '',
    body.summary && body.summary.gir   ? `GIR:       ${body.summary.gir}`   : '',
    body.summary && body.summary.putts ? `Putts:     ${body.summary.putts}` : '',
    body.summary && body.summary.t5 != null ? `5 Errors:  ${body.summary.t5}` : '',
    '',
    body.top_leak ? `Top leak:  ${body.top_leak}${body.top_leak_strokes ? ' (' + body.top_leak_strokes + ' strokes)' : ''}` : '',
    '',
    'View in coach portal:',
    // Both cohorts now route to the consolidated coach view (2026-05-24).
    'https://rrgolfperformance.com/adult/coach.html',
  ].filter(Boolean);

  const coachUrl = 'https://rrgolfperformance.com/adult/coach.html';

  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif; color:#1B2A41; max-width:560px; margin:0 auto; padding:24px;">
    <div style="border-left:4px solid #C9A84C; padding-left:14px; margin-bottom:18px;">
      <div style="font-size:11px; letter-spacing:0.18em; color:#C9A84C; font-weight:700; text-transform:uppercase;">New Round Submitted</div>
      <h1 style="margin:6px 0 0; font-family:Georgia,serif; font-size:22px; color:#0E2A47;">${ESC(body.player)}${cohortLabel ? ' <span style="font-weight:400; color:#8A8A8A; font-size:14px;">· ' + ESC(cohortLabel) + '</span>' : ''}</h1>
    </div>
    <table cellpadding="6" cellspacing="0" style="width:100%; font-size:14px; border-collapse:collapse;">
      <tr><td style="color:#8A8A8A; width:120px;">Score</td><td style="font-weight:700; font-size:18px; color:#0E2A47;">${ESC(body.score)}${body.holes && body.holes !== 18 ? ' <span style="font-weight:400; color:#8A8A8A; font-size:13px;">(' + ESC(body.holes) + ' holes)</span>' : ''}</td></tr>
      <tr><td style="color:#8A8A8A;">Course</td><td>${ESC(body.course || '—')}${body.tees ? ' · <span style="color:#8A8A8A;">' + ESC(body.tees) + ' tees</span>' : ''}</td></tr>
      <tr><td style="color:#8A8A8A;">Date</td><td>${ESC(body.date || '—')}</td></tr>
      ${body.summary && body.summary.fir ? `<tr><td style="color:#8A8A8A;">FIR</td><td>${ESC(body.summary.fir)}</td></tr>` : ''}
      ${body.summary && body.summary.gir ? `<tr><td style="color:#8A8A8A;">GIR</td><td>${ESC(body.summary.gir)}</td></tr>` : ''}
      ${body.summary && body.summary.putts ? `<tr><td style="color:#8A8A8A;">Putts</td><td>${ESC(body.summary.putts)}</td></tr>` : ''}
      ${body.summary && body.summary.t5 != null ? `<tr><td style="color:#8A8A8A;">5 Errors</td><td>${ESC(body.summary.t5)}</td></tr>` : ''}
    </table>
    ${body.top_leak ? `<div style="margin:18px 0 0; padding:12px 14px; background:#FDF6E3; border-left:3px solid #C9A84C; border-radius:4px; font-size:14px;">
      <div style="font-size:10px; letter-spacing:0.15em; color:#C9A84C; font-weight:700; text-transform:uppercase;">Top Leak</div>
      <div style="margin-top:4px;"><b>${ESC(body.top_leak)}</b>${body.top_leak_strokes ? ' · <span style="color:#B22222;">' + ESC(body.top_leak_strokes) + ' strokes</span>' : ''}</div>
    </div>` : ''}
    <div style="margin-top:24px; padding-top:18px; border-top:1px solid #E5E5E5;">
      <a href="${coachUrl}" style="display:inline-block; background:#0E2A47; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px;">Open coach view →</a>
    </div>
    <p style="margin-top:24px; font-size:12px; color:#8A8A8A;">Sent automatically when a player submits a round through the RR Golf Performance portal.</p>
  </body></html>`;

  try {
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [RYAN_EMAIL],
      subject,
      html,
      text: lines.join('\n'),
    });
    if (error) {
      console.error('[notify-round] Resend error', error);
      return res.status(500).json({ ok: false, error: error.message });
    }
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('[notify-round] exception', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
