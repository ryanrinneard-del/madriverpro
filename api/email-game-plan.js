// =====================================================================
// POST /api/email-game-plan   { user_id }
// =====================================================================
// Coach-triggered. Rebuilds the player's Game Plan + 6-Week Arc PDFs
// (always fresh — reflects any Plan Updates since the last send) and
// emails them to the player on-brand.
//
// If there's a recent lesson_update on profile_json, the email body
// surfaces "what we worked on" + "focus this week" so the player sees
// the post-lesson context, not just a re-send of the same PDFs.
//
// Required env vars:
//   RESEND_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   BLOB_READ_WRITE_TOKEN
//   (optional) RESEND_FROM_EMAIL
//
// Response:
//   200 { ok: true, id: <resend message id>, pdf_built: bool }
//   4xx/5xx { error: string }
// =====================================================================

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { list } from '@vercel/blob';
import { isAdminRequest, fetchBlob } from './_lib/storage.js';

export const config = { maxDuration: 60 };

const RYAN_EMAIL = 'ryan@rrgolfperformance.com';

// Brand tokens (match notify-round.js — single source of truth for the
// transactional-email visual identity).
const BRAND = {
  navy:        '#0E2A47',
  navyText:    '#1B2A41',
  gold:        '#C9A84C',
  goldTintBg:  '#FDF6E3',
  midGrey:     '#8A8A8A',
  rule:        '#E5E5E5',
  white:       '#FFFFFF',
};

const ESC = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lazy Supabase admin client (service-role; bypasses RLS).
let _sb = null;
function sb() {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin env not set');
  _sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return _sb;
}

async function fetchPdfAttachment(pathname, filename) {
  const r = await fetchBlob(pathname);
  if (!r.ok) throw new Error(`Could not fetch ${filename} (${r.status})`);
  const ab = await r.arrayBuffer();
  return { filename, content: Buffer.from(ab) };
}

// Internal call to /api/build-game-plan-pdf so the PDFs always reflect the
// CURRENT plan (including any lesson updates since the last send). Returns
// true if the build succeeded, throws otherwise.
async function rebuildPdfs(req, user_id) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const base = `${proto}://${req.headers.host}`;
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.INTERNAL_PIPELINE_TOKEN) {
    headers['x-internal-token'] = process.env.INTERNAL_PIPELINE_TOKEN;
  }
  // Forward the admin cookie so build-game-plan-pdf's isAdminRequest passes.
  if (req.headers.cookie) headers['cookie'] = req.headers.cookie;
  const r = await fetch(`${base}/api/build-game-plan-pdf`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id }),
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok || !out.success) {
    throw new Error(out?.error || `build-game-plan-pdf returned ${r.status}`);
  }
  return true;
}

// On-brand HTML email. Matches notify-round.js (navy + gold, Georgia
// headlines, gold-accented callouts). Two variants based on whether a
// recent lesson update is present.
function buildEmailHtml({ firstName, latestUpdate }) {
  const updateBlock = latestUpdate ? `
    <div style="margin:22px 0 0; padding:14px 16px; background:${BRAND.goldTintBg}; border-left:3px solid ${BRAND.gold}; border-radius:4px; font-size:14px; line-height:1.55;">
      <div style="font-size:10px; letter-spacing:0.16em; color:${BRAND.gold}; font-weight:700; text-transform:uppercase;">From our last session</div>
      ${latestUpdate.what_we_worked_on ? `<div style="margin-top:8px;"><b style="color:${BRAND.navy};">What we worked on:</b> ${ESC(latestUpdate.what_we_worked_on)}</div>` : ''}
      ${latestUpdate.focus_this_week ? `<div style="margin-top:8px;"><b style="color:${BRAND.navy};">Focus this week:</b> ${ESC(latestUpdate.focus_this_week)}</div>` : ''}
    </div>` : '';

  const greeting = firstName ? `Hi ${ESC(firstName)},` : 'Hi,';

  return `<!doctype html><html><body style="margin:0; padding:0; background:${BRAND.white};">
  <div style="font-family:Georgia,serif; color:${BRAND.navyText}; max-width:560px; margin:0 auto; padding:28px 24px;">

    <!-- Brand kicker -->
    <div style="border-left:4px solid ${BRAND.gold}; padding-left:14px; margin-bottom:22px;">
      <div style="font-family:system-ui,sans-serif; font-size:11px; letter-spacing:0.18em; color:${BRAND.gold}; font-weight:700; text-transform:uppercase;">Ryan Rinneard Golf Performance</div>
      <h1 style="margin:6px 0 0; font-family:Georgia,serif; font-size:24px; color:${BRAND.navy}; font-weight:600; line-height:1.2;">Your refreshed Game Plan</h1>
    </div>

    <p style="font-family:system-ui,sans-serif; font-size:15px; line-height:1.6; color:${BRAND.navyText}; margin:0 0 14px;">
      ${greeting}
    </p>
    <p style="font-family:system-ui,sans-serif; font-size:15px; line-height:1.6; color:${BRAND.navyText}; margin:0 0 14px;">
      Two documents are attached:
    </p>

    <ul style="font-family:system-ui,sans-serif; font-size:15px; line-height:1.7; color:${BRAND.navyText}; padding-left:22px; margin:0 0 18px;">
      <li><b style="color:${BRAND.navy};">Game Plan</b> &mdash; a snapshot of your game and what we&rsquo;re working on</li>
      <li><b style="color:${BRAND.navy};">6-Week Arc</b> &mdash; how the next six sessions build on each other</li>
    </ul>

    ${updateBlock}

    <p style="font-family:system-ui,sans-serif; font-size:14px; line-height:1.6; color:${BRAND.navyText}; margin:24px 0 14px;">
      Have a read through before our next session. Any questions, just reply to this email.
    </p>

    <p style="font-family:Georgia,serif; font-size:16px; color:${BRAND.navy}; margin:24px 0 0;">
      &mdash; Ryan
    </p>
    <p style="font-family:system-ui,sans-serif; font-size:12px; color:${BRAND.midGrey}; margin:4px 0 0;">
      CPGA Class A &middot; Director of Instruction, Mad River Golf Club
    </p>

    <!-- Footer -->
    <div style="margin-top:32px; padding-top:18px; border-top:1px solid ${BRAND.rule}; font-family:system-ui,sans-serif; font-size:11px; color:${BRAND.midGrey}; line-height:1.6;">
      You&rsquo;re receiving this because you&rsquo;re a player in the RR Golf Performance portal.
      Reply directly to this email to reach Ryan.
    </div>
  </div>
</body></html>`;
}

function buildPlainText({ firstName, latestUpdate }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return [
    greeting,
    '',
    'Two documents are attached:',
    '  • Game Plan — a snapshot of your game and what we\'re working on',
    '  • 6-Week Arc — how the next six sessions build on each other',
    '',
    latestUpdate?.what_we_worked_on ? `From our last session — what we worked on: ${latestUpdate.what_we_worked_on}` : '',
    latestUpdate?.focus_this_week   ? `Focus this week: ${latestUpdate.focus_this_week}` : '',
    '',
    'Have a read through before our next session. Any questions, just reply to this email.',
    '',
    '— Ryan',
    'CPGA Class A · Director of Instruction, Mad River Golf Club',
  ].filter(Boolean).join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  const { user_id } = body || {};
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  const fromEmail = process.env.RESEND_FROM_EMAIL
    || 'Ryan Rinneard <ryan@rrgolfperformance.com>';

  // 1. Pull player + latest lesson update from profile_json.
  let player;
  try {
    const { data, error } = await sb()
      .from('profiles')
      .select('name, email, profile_json')
      .eq('id', user_id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Player not found' });
    if (!data.email) return res.status(400).json({ error: 'Player has no email on file' });
    player = data;
  } catch (err) {
    console.error('[email-game-plan] db lookup failed', err);
    return res.status(500).json({ error: 'Database lookup failed' });
  }

  const firstName = (player.name || '').split(' ')[0] || '';
  const updates = (player.profile_json && Array.isArray(player.profile_json.lesson_updates))
    ? player.profile_json.lesson_updates : [];
  // Latest update = highest 'date' OR most-recently-created entry. We sort by
  // updated_at if present, otherwise by date.
  const latestUpdate = updates.length
    ? updates.slice().sort((a, b) =>
        (b.updated_at || b.date || '').localeCompare(a.updated_at || a.date || '')
      )[0]
    : null;

  // 2. Always rebuild the PDFs so they reflect the current plan (post-update).
  let pdfBuilt = false;
  try {
    await rebuildPdfs(req, user_id);
    pdfBuilt = true;
  } catch (err) {
    console.error('[email-game-plan] rebuild failed', err);
    return res.status(502).json({ error: 'Could not rebuild PDFs: ' + err.message });
  }

  // 3. Confirm both PDFs exist in blob before sending.
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  let attachments;
  try {
    const blobs = await list({ prefix: `profiles/${user_id}/`, token });
    const present = new Set(blobs.blobs.map(b => b.pathname.split('/').pop()));
    const required = ['game_plan.pdf', 'arc.pdf'];
    const missing = required.filter(n => !present.has(n));
    if (missing.length) {
      return res.status(409).json({ error: `PDF missing after build: ${missing.join(', ')}` });
    }
    attachments = await Promise.all(required.map(n =>
      fetchPdfAttachment(`profiles/${user_id}/${n}`, n)
    ));
  } catch (err) {
    console.error('[email-game-plan] attachment fetch failed', err);
    return res.status(500).json({ error: 'Failed to load PDFs for email' });
  }

  // 4. Send.
  const html = buildEmailHtml({ firstName, latestUpdate });
  const text = buildPlainText({ firstName, latestUpdate });
  const subject = latestUpdate
    ? `Your refreshed Game Plan — Ryan Rinneard Golf Performance`
    : `Your Game Plan — Ryan Rinneard Golf Performance`;

  try {
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [player.email],
      replyTo: RYAN_EMAIL,
      subject,
      html,
      text,
      attachments,
    });
    if (error) {
      console.error('[email-game-plan] Resend error', error);
      return res.status(502).json({ error: error.message || 'Resend failed' });
    }

    // 5. Stamp profile_json with last-emailed metadata (audit trail; never
    //    exposed in the player-facing UI).
    try {
      const nextPj = {
        ...(player.profile_json || {}),
        game_plan: {
          ...((player.profile_json || {}).game_plan || {}),
          last_emailed_at:  new Date().toISOString(),
          last_emailed_id:  data?.id || null,
          last_emailed_to:  player.email,
        },
      };
      await sb().from('profiles').update({ profile_json: nextPj }).eq('id', user_id);
    } catch (err) {
      // Non-fatal — the email already shipped. Just log it.
      console.warn('[email-game-plan] could not stamp last_emailed_at', err);
    }

    return res.status(200).json({ ok: true, id: data?.id, pdf_built: pdfBuilt });
  } catch (err) {
    console.error('[email-game-plan] unexpected', err);
    return res.status(500).json({ error: err.message || 'Send failed' });
  }
}
