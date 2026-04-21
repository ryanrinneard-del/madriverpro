// POST /api/adjust-game-plan
//
// Called from the Coach View after a lesson when the coach wants Claude to
// regenerate the REMAINING weeks of a player's 6-Week Plan based on what was
// discovered in that lesson (root cause tag + worked-on notes + focus for the
// week). The weeks BEFORE the current week stay unchanged — we only rebuild
// forward from `week_at_update`.
//
// Required env vars (production):
//   ANTHROPIC_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Request body:
//   {
//     user_id: "<uuid of player>",
//     update_id: "<id of the lesson_update that triggered this regen>"  // optional, for marking regenerated:true
//   }
// The endpoint reads the current plan + latest lesson_update from profile_json
// itself — so the caller doesn't have to re-send everything.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { GOLFER_PROFILE_SYSTEM_PROMPT } from './_lib/systemPrompt.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 3072;

const ROOT_CAUSE_LABELS = {
  setup:      'Setup (grip, posture, alignment, ball position)',
  movement:   'Movement (body mechanics, rotation, weight shift)',
  sequencing: 'Sequencing (kinematic order, transition, timing)',
  short_game: 'Short Game (chipping, pitching, bunker, low-point control)',
  putting:    'Putting (stroke, green-reading, speed control)',
  mental:     'Mental (routine, self-talk, pressure, decisions)',
  strategy:   'Strategy (course management, DECADE, shot selection)',
  equipment:  'Equipment (fitting, lofts, distance gaps)',
  other:      'Other',
};

// Schema for the regenerated sessions — same shape as the original generator,
// but returns a variable number of sessions (however many weeks are left).
const ADJUSTED_SESSIONS_SCHEMA = {
  type: 'object',
  required: ['sessions', 'coach_note'],
  properties: {
    sessions: {
      type: 'array',
      minItems: 1,
      maxItems: 6,
      description: 'The regenerated weekly sessions, in order, from the starting week forward.',
      items: {
        type: 'object',
        required: ['week', 'theme', 'subtitle', 'primary', 'secondary', 'practice', 'ready_when', 'measure'],
        properties: {
          week:       { type: 'string', description: 'Week number as a string, e.g. "3".' },
          theme:      { type: 'string', description: 'Short theme title.' },
          subtitle:   { type: 'string', description: 'One-line framing.' },
          primary:    { type: 'string', description: 'Primary focus for the lesson.' },
          secondary:  { type: 'string', description: 'Secondary focus.' },
          practice:   { type: 'array', items: { type: 'string' }, description: '2–4 practice bullets for the week.' },
          ready_when: { type: 'string', description: 'How the player knows they\'ve nailed this week.' },
          measure:    { type: 'string', description: 'Measurable check (e.g. "10/10 putts inside 4 ft").' },
        },
      },
    },
    coach_note: {
      type: 'string',
      description: '2–3 sentence explanation from the coach voice, addressed to the player, on why the remaining weeks were adjusted and what changed.',
    },
  },
};

// Merge current profile_json with patch (shallow)
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, update_id } = req.body || {};
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL          = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(503).json({ error: 'AI regen not configured on this server.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Load the player's full profile_json so we have: existing plan + the lesson
  // update the coach just logged.
  const { data: row, error: readErr } = await supabase
    .from('profiles')
    .select('profile_json, name, email')
    .eq('id', user_id)
    .maybeSingle();
  if (readErr || !row) {
    return res.status(404).json({ error: 'Player not found.' });
  }
  const pj = row.profile_json || {};
  const plan = pj.game_plan || {};
  const currentSessions = Array.isArray(plan?.structured?.sessions) ? plan.structured.sessions : [];
  if (!currentSessions.length) {
    return res.status(400).json({ error: 'Player has no existing 6-Week Plan to adjust. Generate one first.' });
  }

  // Find the lesson update that triggered this regen — prefer explicit
  // update_id from the body, else fall back to the most recent one.
  const updates = Array.isArray(pj.lesson_updates) ? pj.lesson_updates : [];
  if (!updates.length) {
    return res.status(400).json({ error: 'No lesson update found for this player.' });
  }
  const update = update_id
    ? updates.find(u => u.id === update_id)
    : [...updates].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  if (!update) return res.status(404).json({ error: 'Lesson update not found.' });

  // Decide which weeks we regenerate. If week_at_update is set, rebuild from
  // that week forward. Otherwise default to weeks 2–6 (preserve week 1).
  const startWeek = Math.max(1, Math.min(6, parseInt(update.week_at_update || 2, 10)));
  const keptWeeks = currentSessions.filter(s => parseInt(s.week, 10) < startWeek);
  const weeksToRegen = currentSessions.filter(s => parseInt(s.week, 10) >= startWeek);
  const weekNumbers = weeksToRegen.map(s => s.week);

  // Build the user message for Claude
  const profileSummary = (pj.kyg || pj.profile || pj.profile_data || {});
  const goal = pj.game_plan?.structured?.student?.goal || profileSummary.goal || profileSummary.main_goal || '';
  const firstName = pj.game_plan?.structured?.student?.first_name ||
                    (row.name || '').split(' ')[0] || 'Player';

  const existingPlanBlock = currentSessions.map(s =>
    `Week ${s.week} — ${s.theme || ''}\n` +
    `  Primary: ${s.primary || ''}\n` +
    `  Secondary: ${s.secondary || ''}\n` +
    `  Practice: ${(s.practice || []).join('; ')}\n` +
    `  Measure: ${s.measure || ''}`
  ).join('\n\n');

  const userMsg = `
=== POST-LESSON PLAN ADJUSTMENT ===

PLAYER: ${firstName}
GOAL: ${goal || '(not captured)'}

=== CURRENT 6-WEEK PLAN ===
${existingPlanBlock}

=== LESSON THE COACH JUST TAUGHT ===
Date: ${update.date}
Player was in: Week ${update.week_at_update || '?'}
Root cause identified: ${ROOT_CAUSE_LABELS[update.root_cause] || update.root_cause || 'Unspecified'}
What we worked on: ${update.what_we_worked_on || '(none)'}
Coach's focus for this week: ${update.focus_this_week || '(none)'}

=== YOUR TASK ===
Regenerate weeks ${weekNumbers.join(', ')} ONLY, preserving the structure of the
original plan but adjusting the content so the remaining work addresses the
root cause identified in today's lesson. Keep the same "week" numbers as listed
(${weekNumbers.join(', ')}). Preserve what you can from the original plan that
still makes sense; rewrite what doesn't. The player's goal doesn't change — the
route to it just got sharper.

Voice: coaching — warm, direct, recreational-player-friendly. No jargon.

Also write a 2–3 sentence coach_note the player will read at the top of their
plan that explains what changed and why, in plain language. Address it to them
(${firstName}).

Schema enforces the shape exactly. Do not add extra keys.
`.trim();

  // Call Claude
  let adjusted;
  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: GOLFER_PROFILE_SYSTEM_PROMPT,
      tools: [{
        name: 'write_adjusted_plan',
        description: 'Write the regenerated remaining weeks + a coach note. Call exactly once.',
        input_schema: ADJUSTED_SESSIONS_SCHEMA,
      }],
      tool_choice: { type: 'tool', name: 'write_adjusted_plan' },
      messages: [{ role: 'user', content: userMsg }],
    });
    const toolUse = resp.content.find(b => b.type === 'tool_use' && b.name === 'write_adjusted_plan');
    if (!toolUse || !toolUse.input) throw new Error('Anthropic did not return a tool_use block.');
    adjusted = toolUse.input;
  } catch (err) {
    console.error('Anthropic adjust error:', err);
    return res.status(502).json({ error: 'AI regeneration failed. Try again or edit weeks manually.' });
  }

  // Splice the new sessions in: kept weeks + regenerated weeks
  const newSessions = [...keptWeeks, ...(adjusted.sessions || [])]
    .sort((a, b) => parseInt(a.week, 10) - parseInt(b.week, 10));

  // Write back to profile_json with updated plan + mark the update regenerated
  const newPlan = {
    ...plan,
    structured: { ...(plan.structured || {}), sessions: newSessions },
    last_edited_at: new Date().toISOString(),
    last_adjustment: {
      update_id: update.id,
      coach_note: adjusted.coach_note || '',
      at: new Date().toISOString(),
      model: MODEL,
    },
  };
  const newUpdates = updates.map(u => u.id === update.id ? { ...u, regenerated: true } : u);

  await patchProfile(supabase, user_id, {
    game_plan: newPlan,
    lesson_updates: newUpdates,
  });

  return res.status(200).json({
    success: true,
    sessions: newSessions,
    coach_note: adjusted.coach_note || '',
    regenerated_weeks: weekNumbers,
  });
}
