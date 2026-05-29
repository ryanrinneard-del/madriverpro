// POST /api/build-game-plan-pdf  { user_id }
//
// Coach-triggered. Renders the player's Game Plan (Snapshot) + 6-Week Arc PDFs
// from their LIVING plan in Supabase (profile_json.game_plan.structured) — so
// the PDF always reflects the current plan, including after a Plan Update.
//
// The slim plan produced by /api/generate-game-plan only carries the 6-week
// arc. The Snapshot pages also need skill_notes / priorities / focuses /
// setup_read / snapshot_callouts / probes / a fuller student block. If those
// aren't already on the stored plan, this endpoint generates them once (one
// small Claude call) from the player's Know Your Game answers and persists
// them back — so the next build is instant and a Plan Update only has to
// touch the six weekly sessions.
//
// Required env vars (production):
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   (optional) INTERNAL_PIPELINE_TOKEN — forwarded to /api/generate-pdfs

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { list } from '@vercel/blob';
import { GOLFER_PROFILE_SYSTEM_PROMPT } from './_lib/systemPrompt.js';
import { isAdminRequest, fetchBlob, putBinary } from './_lib/storage.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 3072;

// ---------------------------------------------------------------------------
// Email support (merged in from the former /api/email-game-plan endpoint, so
// the post-lesson "email the Game Plan" feature lives here behind { email:true }
// instead of being a separate serverless function). Triggered only when the
// coach dashboard posts email:true; the plain build path is untouched.
// ---------------------------------------------------------------------------
const RYAN_EMAIL = 'ryan@rrgolfperformance.com';

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

async function fetchPdfAttachment(pathname, filename) {
  const r = await fetchBlob(pathname);
  if (!r.ok) throw new Error(`Could not fetch ${filename} (${r.status})`);
  const ab = await r.arrayBuffer();
  return { filename, content: Buffer.from(ab) };
}

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

// The Snapshot-page fields the slim 6-week-arc plan doesn't already carry.
const SNAPSHOT_FIELDS_SCHEMA = {
  type: 'object',
  required: ['student', 'snapshot', 'skill_notes', 'priorities', 'focuses', 'setup_read', 'snapshot_callouts', 'probes', 'session1_closing'],
  properties: {
    student: {
      type: 'object',
      required: ['name', 'first_name', 'handicap', 'goal', 'experience'],
      properties: {
        name:           { type: 'string' },
        first_name:     { type: 'string' },
        handicap:       { type: 'string' },
        goal:           { type: 'string', description: 'One-line restatement of the player\'s goal in their words.' },
        experience:     { type: 'string', description: 'e.g. "3-5 years"' },
        drive_distance: { type: 'string' },
      },
    },
    date_label: { type: 'string', description: 'Current month and year, e.g. "May 2026".' },
    snapshot: {
      type: 'string',
      description: '4-6 sentence plain-language read of the player and what they are really after from coaching.',
    },
    skill_notes: {
      type: 'array', minItems: 6, maxItems: 6,
      description: 'Six skill areas in this exact order: Long Game, Approach, Short Game, Putting, Course Mgmt, Mental Game.',
      items: {
        type: 'object',
        required: ['area', 'score', 'note', 'level'],
        properties: {
          area:  { type: 'string' },
          score: { type: 'number', description: '0-10' },
          note:  { type: 'string', description: 'ONE short line — 14 words max. Plain language. This sits in a tight table row.' },
          level: { enum: ['GREEN', 'BLUE', 'AMBER', 'RED'], description: '>=8 GREEN / 6-7.9 BLUE / 4-5.9 AMBER / <4 RED' },
        },
      },
    },
    priorities: {
      type: 'array', minItems: 3, maxItems: 5,
      description: 'Ranked by what costs the most strokes. Name the leak, not the drill.',
      items: {
        type: 'object',
        required: ['title', 'desc'],
        properties: { title: { type: 'string' }, desc: { type: 'string' } },
      },
    },
    focuses: {
      type: 'array', minItems: 3, maxItems: 3,
      description: 'Exactly three Session 1 focus areas.',
      items: {
        type: 'object',
        required: ['title', 'why', 'drill', 'cue', 'tag'],
        properties: {
          title: { type: 'string' },
          why:   { type: 'string', description: 'Why this matters for this player — one or two plain sentences.' },
          drill: { type: 'string', description: 'The drill, described plainly.' },
          cue:   { type: 'string', description: 'A short physical cue.' },
          tag:   { type: 'string', description: 'e.g. SETUP, LONG GAME, SHORT GAME, PUTTING, MENTAL GAME' },
        },
      },
    },
    setup_read: {
      type: 'array', minItems: 3, maxItems: 3,
      description: 'The three setup checkpoints, in order: Grip, Posture & Stance, Aim & Ball Position.',
      items: {
        type: 'object',
        required: ['area', 'level', 'note'],
        properties: {
          area:  { type: 'string', description: 'Grip | Posture & Stance | Aim & Ball Position' },
          level: { enum: ['GREEN', 'AMBER', 'RED'] },
          note:  { type: 'string', description: 'ONE short line — 18 words max. Plain language. Sits in a tight table row.' },
        },
      },
    },
    snapshot_callouts: {
      type: 'object',
      required: ['priority', 'strength', 'goal_line', 'closing_line'],
      properties: {
        priority:     { type: 'string', description: 'The #1 priority this season — one or two crisp sentences. Lead with a short phrase wrapped in <b></b>.' },
        strength:     { type: 'string', description: 'The player\'s biggest strength and why we build around it. Lead with a short phrase wrapped in <b></b>.' },
        goal_line:    { type: 'string', description: 'The honest line connecting the work to the player\'s stated goal.' },
        closing_line: { type: 'string', description: 'One warm closing sentence for the bottom of the plan.' },
      },
    },
    probes: {
      type: 'array', minItems: 4, maxItems: 7,
      description: 'Things Ryan should look at or ask in person — setup checkpoints first (grip V\'s, aim, ball position, where the divot starts), then swing-pattern questions.',
      items: {
        type: 'object',
        required: ['label', 'text'],
        properties: { label: { type: 'string' }, text: { type: 'string' } },
      },
    },
    session1_closing: {
      type: 'string',
      description: 'A warm 2-3 sentence closing note from coach to player.',
    },
  },
};

// Shallow-merge a patch into profile_json. Re-reads current each call so two
// sequential patches are safe.
async function patchProfile(supabase, userId, patch) {
  const { data: row } = await supabase
    .from('profiles')
    .select('profile_json')
    .eq('id', userId)
    .maybeSingle();
  const current = (row && row.profile_json) || {};
  const merged = { ...current, ...patch };
  const { error } = await supabase
    .from('profiles')
    .update({ profile_json: merged })
    .eq('id', userId);
  if (error) console.warn('patchProfile error', error);
  return merged;
}

function formatProfileForClaude(profileData, playerName, structured) {
  const lines = ['=== GOLFER PROFILE — KNOW YOUR GAME SUBMISSION ===', ''];
  if (playerName) lines.push(`Player name: ${playerName}`);
  for (const [key, value] of Object.entries(profileData || {})) {
    if (key === 'website' || key === 'id' || key.startsWith('_')) continue;
    const pretty = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const val = Array.isArray(value) ? value.join(', ') : (value || '—');
    lines.push(`${pretty}: ${val}`);
  }
  // Give Claude the existing 6-week arc so the Snapshot stays consistent with it.
  const sessions = Array.isArray(structured?.sessions) ? structured.sessions : [];
  if (sessions.length) {
    lines.push('', '=== EXISTING 6-WEEK ARC (for consistency) ===');
    sessions.forEach((s) => {
      lines.push(`Week ${s.week} — ${s.theme || ''}: ${s.primary || ''}`);
    });
  }
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not authenticated.' });

  const { user_id } = req.body || {};
  const wantEmail = !!(req.body && req.body.email);
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const ANTHROPIC_API_KEY    = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL         = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(503).json({ error: 'PDF build not configured on this server.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Load the player's living plan.
  const { data: row, error: readErr } = await supabase
    .from('profiles')
    .select('profile_json, name, email')
    .eq('id', user_id)
    .maybeSingle();
  if (readErr || !row) return res.status(404).json({ error: 'Player not found.' });

  // Email-path preconditions — fail fast before doing the (slow) PDF build.
  if (wantEmail) {
    if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not set' });
    if (!row.email) return res.status(400).json({ error: 'Player has no email on file' });
  }

  const pj = row.profile_json || {};
  let plan = pj.game_plan || {};
  const structured = plan.structured || {};
  const sessions = Array.isArray(structured.sessions) ? structured.sessions : [];
  if (!sessions.length) {
    return res.status(400).json({ error: 'This player has no 6-Week Plan yet — generate one first.' });
  }

  // Build the data the PDF templates need. Start from the living arc; add the
  // Snapshot-page fields, generating them once if they aren't there yet.
  let merged = { ...structured };
  const hasSnapshotFields = structured.skill_notes && structured.focuses && structured.priorities;

  if (!hasSnapshotFields) {
    // Know Your Game answers may live under a sub-key OR — as the form
    // actually saves them — as top-level s1_*..s7_* keys on profile_json.
    let profileData = pj.kyg || pj.profile || pj.profile_data;
    if (!profileData || !Object.keys(profileData).length) {
      profileData = {};
      for (const [k, v] of Object.entries(pj)) {
        if (k.startsWith('game_plan') || k.startsWith('_') || k === 'snapshot') continue;
        profileData[k] = v;
      }
    }
    const userMsg =
      formatProfileForClaude(profileData, row.name, structured) +
      '\n\n=== OUTPUT SCOPE ===\n' +
      'Produce ONLY the Snapshot-page fields: student, date_label, snapshot, ' +
      'skill_notes, priorities, focuses, setup_read, snapshot_callouts, probes, ' +
      'session1_closing. Do NOT produce sessions or arc fields — those already ' +
      'exist. The schema in the tool enforces the shape exactly.';

    let fields;
    try {
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      const resp = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: GOLFER_PROFILE_SYSTEM_PROMPT,
        tools: [{
          name: 'write_snapshot_fields',
          description: 'Write the Snapshot-page fields for this player. Call exactly once. Follow the schema exactly.',
          input_schema: SNAPSHOT_FIELDS_SCHEMA,
        }],
        tool_choice: { type: 'tool', name: 'write_snapshot_fields' },
        messages: [{ role: 'user', content: userMsg }],
      });
      const toolUse = resp.content.find((b) => b.type === 'tool_use' && b.name === 'write_snapshot_fields');
      if (!toolUse || !toolUse.input) throw new Error('Anthropic did not return a tool_use block.');
      fields = toolUse.input;
    } catch (err) {
      console.error('Snapshot fields generation error:', err);
      return res.status(502).json({ error: 'Could not build the Snapshot detail. Try again in a moment.' });
    }

    // student: prefer the richer block we just generated, but keep the arc's
    // first_name/goal if they were already there.
    merged = {
      ...structured,
      ...fields,
      student: { ...(structured.student || {}), ...(fields.student || {}) },
    };

    // Persist the snapshot fields so the next build (and Plan Updates) reuse them.
    plan = { ...plan, structured: merged, snapshot_fields_at: new Date().toISOString() };
    await patchProfile(supabase, user_id, { game_plan: plan });
  }

  // Render the PDFs via the Python endpoint, passing the merged plan inline.
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const base = `${proto}://${req.headers.host}`;
  let pdfResults;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.INTERNAL_PIPELINE_TOKEN) {
      headers['x-internal-token'] = process.env.INTERNAL_PIPELINE_TOKEN;
    }
    const r = await fetch(`${base}/api/generate-pdfs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: user_id, data: merged, return_bytes: true }),
    });
    pdfResults = await r.json();
    if (!r.ok || !pdfResults.success) {
      let detail = pdfResults?.error;
      if (!detail && pdfResults?.results) {
        detail = Object.entries(pdfResults.results)
          .filter(([, v]) => v && v.ok === false)
          .map(([k, v]) => `${k} → ${v.error}`)
          .join('; ');
      }
      throw new Error(detail || `generate-pdfs responded ${r.status}`);
    }
  } catch (err) {
    console.error('generate-pdfs call failed:', err);
    return res.status(502).json({ error: 'PDF rendering failed — ' + (err.message || 'unknown') });
  }

  // Python rendered the PDFs and returned the bytes; upload them to Blob here
  // via the current @vercel/blob SDK (Python's raw Blob PUT uses a stale API
  // that 400s). Stored at the same private paths /api/get-asset serves from.
  try {
    for (const [name, info] of Object.entries(pdfResults.results || {})) {
      if (info && info.ok && info.b64) {
        await putBinary(`profiles/${user_id}/${name}`, Buffer.from(info.b64, 'base64'), 'application/pdf');
      }
    }
  } catch (err) {
    console.error('blob upload (node) failed:', err);
    return res.status(502).json({ error: 'PDF upload failed — ' + (err.message || 'unknown') });
  }

  // Store coach-openable proxy URLs (the blob store is private, so the coach
  // dashboard opens these through /api/get-asset, which checks the admin cookie).
  const builtAt = new Date().toISOString();
  const pdfs = {
    game_plan: `/api/get-asset?id=${encodeURIComponent(user_id)}&kind=game_plan`,
    arc:       `/api/get-asset?id=${encodeURIComponent(user_id)}&kind=arc`,
    built_at:  builtAt,
  };
  const finalGamePlan = { ...plan, structured: merged, pdfs };
  await patchProfile(supabase, user_id, { game_plan: finalGamePlan });

  // ---- Email path: send the freshly-built PDFs to the player on-brand. ----
  if (wantEmail) {
    const fromEmail = process.env.RESEND_FROM_EMAIL
      || 'Ryan Rinneard <ryan@rrgolfperformance.com>';
    const firstName = (row.name || '').split(' ')[0] || '';
    const updates = Array.isArray(pj.lesson_updates) ? pj.lesson_updates : [];
    const latestUpdate = updates.length
      ? updates.slice().sort((a, b) =>
          (b.updated_at || b.date || '').localeCompare(a.updated_at || a.date || '')
        )[0]
      : null;

    // Confirm both PDFs exist in blob, then load them as attachments.
    let attachments;
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
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
      console.error('[build-game-plan-pdf:email] attachment fetch failed', err);
      return res.status(500).json({ error: 'Failed to load PDFs for email' });
    }

    const html = buildEmailHtml({ firstName, latestUpdate });
    const text = buildPlainText({ firstName, latestUpdate });
    const subject = latestUpdate
      ? 'Your refreshed Game Plan — Ryan Rinneard Golf Performance'
      : 'Your Game Plan — Ryan Rinneard Golf Performance';

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [row.email],
        replyTo: RYAN_EMAIL,
        subject,
        html,
        text,
        attachments,
      });
      if (error) {
        console.error('[build-game-plan-pdf:email] Resend error', error);
        return res.status(502).json({ error: error.message || 'Resend failed' });
      }

      // Stamp audit metadata (non-fatal — the email already shipped).
      try {
        await patchProfile(supabase, user_id, {
          game_plan: {
            ...finalGamePlan,
            last_emailed_at: new Date().toISOString(),
            last_emailed_id: data?.id || null,
            last_emailed_to: row.email,
          },
        });
      } catch (err) {
        console.warn('[build-game-plan-pdf:email] could not stamp last_emailed_at', err);
      }

      return res.status(200).json({
        success: true,
        ok: true,
        emailed: true,
        id: data?.id,
        pdf_built: true,
        pdfs,
        generated_snapshot_fields: !hasSnapshotFields,
      });
    } catch (err) {
      console.error('[build-game-plan-pdf:email] unexpected', err);
      return res.status(500).json({ error: err.message || 'Send failed' });
    }
  }

  return res.status(200).json({
    success: true,
    pdfs,
    results: pdfResults.results || {},
    generated_snapshot_fields: !hasSnapshotFields,
  });
}
