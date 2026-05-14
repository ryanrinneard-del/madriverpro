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
import { GOLFER_PROFILE_SYSTEM_PROMPT } from './_lib/systemPrompt.js';
import { isAdminRequest } from './_lib/storage.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 3072;

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
          note:  { type: 'string', description: 'One-line plain-language read of this area.' },
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
          note:  { type: 'string', description: 'One-line plain-language read.' },
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
    const profileData = pj.kyg || pj.profile || pj.profile_data || {};
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
      body: JSON.stringify({ id: user_id, data: merged }),
    });
    pdfResults = await r.json();
    if (!r.ok || !pdfResults.success) {
      throw new Error(pdfResults?.error || `generate-pdfs responded ${r.status}`);
    }
  } catch (err) {
    console.error('generate-pdfs call failed:', err);
    return res.status(502).json({ error: 'PDF rendering failed. Try again in a moment.' });
  }

  // Store coach-openable proxy URLs (the blob store is private, so the coach
  // dashboard opens these through /api/get-asset, which checks the admin cookie).
  const builtAt = new Date().toISOString();
  const pdfs = {
    game_plan: `/api/get-asset?id=${encodeURIComponent(user_id)}&kind=game_plan`,
    arc:       `/api/get-asset?id=${encodeURIComponent(user_id)}&kind=arc`,
    built_at:  builtAt,
  };
  await patchProfile(supabase, user_id, {
    game_plan: { ...plan, structured: merged, pdfs },
  });

  return res.status(200).json({
    success: true,
    pdfs,
    results: pdfResults.results || {},
    generated_snapshot_fields: !hasSnapshotFields,
  });
}
