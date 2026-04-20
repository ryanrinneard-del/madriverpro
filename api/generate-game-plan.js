// POST /api/generate-game-plan
//
// Triggered after a player submits their Know Your Game profile. Calls
// Anthropic's Claude (claude-sonnet-4-20250514) with the Golfer Profile
// Interpreter system prompt bound to a structured-output tool, then writes the
// resulting roadmap to that player's profile_json.game_plan in Supabase.
//
// The dashboard renders three views from the structured payload:
//   1. Coach Summary  — markdown + key flags (insight_paragraphs, tiger5)
//   2. 6-Week Arc     — sessions[] + arc_phases + arc_themes
//   3. Full Dossier   — diagnostic_sections + skill_radar + prescriptions + goals
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
import { PDF_DATA_SCHEMA, renderMarkdown } from './_lib/schema.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;

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
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: GOLFER_PROFILE_SYSTEM_PROMPT,
      tools: [{
        name: 'write_coaching_roadmap',
        description: 'Write the complete structured coaching roadmap. Call exactly once.',
        input_schema: PDF_DATA_SCHEMA,
      }],
      tool_choice: { type: 'tool', name: 'write_coaching_roadmap' },
      messages: [{ role: 'user', content: formatProfileForClaude(profile_data) }],
    });
    const toolUse = resp.content.find((b) => b.type === 'tool_use' && b.name === 'write_coaching_roadmap');
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
