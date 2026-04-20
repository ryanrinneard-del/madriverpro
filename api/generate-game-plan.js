// POST /api/generate-game-plan
//
// Triggered after a player submits their Know Your Game profile. Calls
// Anthropic's Claude with the Golfer Profile Interpreter system prompt bound
// to a slim 6-week-arc schema, then writes the result to that player's
// profile_json.game_plan in Supabase.
//
// SCOPE NOTE: this endpoint produces ONLY the 6-Week Arc (sessions, themes,
// intro, closing). The full Coach Summary + Dossier still exist in
// _lib/schema.js for the admin-side PDF generator, but are deliberately NOT
// requested here so the call fits inside Vercel's 60-second Hobby-plan limit.
//
// Required env vars (production):
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// If any env var is missing, the endpoint returns 200 silently so the player
// signup flow isn't blocked. The dashboard will simply not show a game plan
// until the integration is fully configured.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { GOLFER_PROFILE_SYSTEM_PROMPT } from './_lib/systemPrompt.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

// Slim schema: only the fields the dashboard's 6-Week Plan view consumes.
// Keeping this small is what lets the call return inside 60s on Hobby plan.
const SIX_WEEK_SCHEMA = {
  type: 'object',
  required: ['student', 'arc_intro', 'arc_themes', 'sessions', 'arc_closing'],
  properties: {
    student: {
      type: 'object',
      required: ['first_name', 'goal'],
      properties: {
        first_name: { type: 'string' },
        goal:       { type: 'string', description: 'One-line restatement of the player\'s goal in their words.' },
      },
    },
    arc_intro: {
      type: 'string',
      description: '2–3 sentence intro framing the next 6 weeks for this player.',
    },
    arc_themes: {
      type: 'array', minItems: 3, maxItems: 3,
      description: 'Three season-long themes that thread through all six weeks.',
      items: {
        type: 'object',
        required: ['label', 'title', 'body'],
        properties: {
          label: { type: 'string', description: 'Short tag, e.g. "FOUNDATION" or "STRATEGY".' },
          title: { type: 'string' },
          body:  { type: 'string', description: '1–2 sentences on what the theme means for this player.' },
        },
      },
    },
    sessions: {
      type: 'array', minItems: 6, maxItems: 6,
      description: 'The six weekly sessions in order, week 1 through week 6.',
      items: {
        type: 'object',
        required: ['week', 'theme', 'subtitle', 'primary', 'secondary', 'practice', 'ready_when', 'measure'],
        properties: {
          week:       { type: 'string', description: 'e.g. "1"' },
          theme:      { type: 'string', description: 'Short theme title for the week.' },
          subtitle:   { type: 'string', description: 'One-line framing.' },
          primary:    { type: 'string', description: 'Primary focus for the lesson — what we work on first.' },
          secondary: { type: 'string', description: 'Secondary focus — second half of the lesson.' },
          practice:   { type: 'array', items: { type: 'string' }, description: '2–4 bullet practice assignments for the week between lessons.' },
          ready_when: { type: 'string', description: 'How the player knows they\'ve nailed this week.' },
          measure:    { type: 'string', description: 'A measurable check (e.g. "10/10 putts inside 4 ft").' },
        },
      },
    },
    arc_closing: {
      type: 'string',
      description: '2–3 sentence closing note from the coach to the player.',
    },
  },
};

function renderMarkdown(data) {
  const s = data.student || {};
  const L = [];
  L.push(`# ${s.first_name || 'Player'} — 6-Week Plan`);
  if (s.goal) L.push(`**Goal:** ${s.goal}`);
  L.push('');
  if (data.arc_intro) { L.push(data.arc_intro); L.push(''); }
  if (data.arc_themes?.length) {
    L.push('## Season Themes');
    data.arc_themes.forEach(t => L.push(`- **${t.label} — ${t.title}:** ${t.body}`));
    L.push('');
  }
  if (data.sessions?.length) {
    L.push('## Six-Week Build');
    data.sessions.forEach(sess => {
      L.push(`### Week ${sess.week} — ${sess.theme}`);
      if (sess.subtitle) L.push(`_${sess.subtitle}_`);
      L.push(`- **Primary:** ${sess.primary}`);
      L.push(`- **Secondary:** ${sess.secondary}`);
      if (sess.practice?.length) L.push(`- **Practice:** ${sess.practice.join('; ')}`);
      L.push(`- **Ready when:** ${sess.ready_when}`);
      L.push(`- **Measure:** ${sess.measure}`);
      L.push('');
    });
  }
  if (data.arc_closing) { L.push('## Closing'); L.push(data.arc_closing); }
  return L.join('\n');
}

// Per-instance rate limiter: 3 generations per IP per minute
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function formatProfileForClaude(data) {
  const lines = ['=== GOLFER PROFILE SUBMISSION ===', ''];
  for (const [key, value] of Object.entries(data || {})) {
    if (key === 'website' || key.startsWith('_')) continue;
    const pretty = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const val = Array.isArray(value) ? value.join(', ') : (value || '\u2014');
    lines.push(`${pretty}: ${val}`);
  }
  return lines.join('\n');
}

/* Update profile_json.game_plan_status without clobbering other keys.
   Uses SQL via PostgREST jsonb merge. */
async function updateGamePlanStatus(supabase, userId, patch) {
  // Read current profile_json, merge, write back. Service-role bypasses RLS.
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
  if (error) console.warn('updateGamePlanStatus error', error);
  return merged;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  const { user_id, profile_data } = req.body || {};
  if (!user_id || !profile_data) {
    return res.status(400).json({ error: 'user_id and profile_data are required.' });
  }

  // Graceful degrade: if env vars aren't set, return success silently. The
  // simple email path (/api/process-profile) still runs in parallel.
  const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL          = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('generate-game-plan skipped — missing env vars',
      { ANTHROPIC: !!ANTHROPIC_API_KEY, SUPABASE_URL: !!SUPABASE_URL, SUPABASE_KEY: !!SUPABASE_SERVICE_KEY });
    return res.status(200).json({ success: false, skipped: true, reason: 'env-not-configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Mark generating so the dashboard can show a "Generating..." state
  await updateGamePlanStatus(supabase, user_id, {
    game_plan_status: 'generating',
    game_plan_started_at: new Date().toISOString(),
  });

  let roadmap;
  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const userMsg =
      formatProfileForClaude(profile_data) +
      '\n\n=== OUTPUT SCOPE ===\n' +
      'For THIS request, produce ONLY the 6-Week Arc: student basics, arc_intro, ' +
      'three arc_themes, exactly six sessions (week 1–6), and arc_closing. ' +
      'Do NOT generate Coach Summary fields, Dossier fields, Tiger 5, prescriptions, ' +
      'diagnostics, or skill radar. The schema in the tool enforces this — follow it exactly.';

    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: GOLFER_PROFILE_SYSTEM_PROMPT,
      tools: [{
        name: 'write_six_week_plan',
        description: 'Write the player\'s 6-Week Plan. Call exactly once. Follow the schema exactly — do not add extra top-level keys.',
        input_schema: SIX_WEEK_SCHEMA,
      }],
      tool_choice: { type: 'tool', name: 'write_six_week_plan' },
      messages: [{ role: 'user', content: userMsg }],
    });
    const toolUse = resp.content.find((b) => b.type === 'tool_use' && b.name === 'write_six_week_plan');
    if (!toolUse || !toolUse.input) {
      throw new Error('Anthropic did not return a tool_use block.');
    }
    roadmap = toolUse.input;
  } catch (err) {
    console.error('Anthropic error:', err);
    await updateGamePlanStatus(supabase, user_id, {
      game_plan_status: 'error',
      game_plan_error: String(err.message || err).slice(0, 500),
    });
    return res.status(502).json({ error: 'Analysis failed. Coach has been notified.' });
  }

  // Render the markdown summary alongside the structured payload
  let markdown = '';
  try {
    markdown = renderMarkdown(roadmap);
  } catch (err) {
    console.warn('renderMarkdown failed', err);
    markdown = '';
  }

  // Persist the full game plan to the player's profile
  const gamePlan = {
    structured: roadmap,
    markdown,
    model: MODEL,
    generated_at: new Date().toISOString(),
  };

  await updateGamePlanStatus(supabase, user_id, {
    game_plan: gamePlan,
    game_plan_status: 'ready',
    game_plan_error: null,
  });

  return res.status(200).json({ success: true });
}
