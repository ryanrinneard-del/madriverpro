// POST /api/process-arc
//
// Accepts raw form data via POST, calls Anthropic with arc-only schema,
// returns the structured arc JSON.

import Anthropic from '@anthropic-ai/sdk';
import { putJson, requireEnv } from './_lib/storage.js';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

const ARC_SCHEMA = {
    type: 'object',
    required: ['student', 'arc_intro', 'arc_themes', 'sessions', 'progress_markers', 'practice_principles', 'arc_closing'],
    properties: {
        student: {
            type: 'object',
            required: ['name', 'first_name', 'handicap', 'goal', 'experience'],
            properties: {
                name: { type: 'string' },
                first_name: { type: 'string' },
                handicap: { type: 'string' },
                goal: { type: 'string' },
                experience: { type: 'string' },
                drive_distance: { type: 'string' },
            },
        },
        date_label: { type: 'string' },
        arc_date_label: { type: 'string' },
        arc_intro: { type: 'string' },
        arc_themes: {
            type: 'array', minItems: 3, maxItems: 3,
            items: {
                type: 'object',
                required: ['label', 'title', 'body'],
                properties: {
                    label: { type: 'string' },
                    title: { type: 'string' },
                    body: { type: 'string' },
                },
            },
        },
        sessions: {
            type: 'array', minItems: 6, maxItems: 6,
            items: {
                type: 'object',
                required: ['week', 'theme', 'subtitle', 'primary', 'secondary', 'practice', 'tiger5', 'ready_when', 'measure'],
                properties: {
                    week: { type: 'string' },
                    theme: { type: 'string' },
                    subtitle: { type: 'string' },
                    primary: { type: 'string' },
                    secondary: { type: 'string' },
                    practice: { type: 'array', items: { type: 'string' } },
                    tiger5: { type: 'string' },
                    ready_when: { type: 'string' },
                    measure: { type: 'string' },
                },
            },
        },
        progress_markers: {
            type: 'array',
            items: {
                type: 'object',
                required: ['metric', 'now', 'target', 'why'],
                properties: {
                    metric: { type: 'string' },
                    now: { type: 'string' },
                    target: { type: 'string' },
                    why: { type: 'string' },
                },
            },
        },
        practice_principles: {
            type: 'array', minItems: 4, maxItems: 4,
            items: {
                type: 'object',
                required: ['title', 'body'],
                properties: { title: { type: 'string' }, body: { type: 'string' } },
            },
        },
        arc_closing: { type: 'string' },
    },
};
const SYSTEM_PROMPT = `You are Ryan Rinneard's Golfer Profile Interpreter.
You are generating ONLY the 6-Week Coaching Arc data for a student.

Principles:
- Ground everything in TPI, TrackMan, and Vision54 best practices.
- Skill tiers by handicap: Beginner (30+ avg) / High Hdcp 20-29 / Mid Hdcp 10-19 / Low Hdcp 0-9 / Scratch+.
- Use the student's first name throughout. Direct, specific, coach-to-coach tone.
- Ryan's cues are short, physical, non-mechanical when possible ("finish tall", "cover the ball").
- Never invent a metric the student did not provide. If data is missing, say so.

Content requirements:
- sessions: exactly 6 weeks, each building on the last. Week 5 is typically a playing lesson; week 6 is reassess/re-baseline.
- arc_themes: exactly 3 themes. For a beginner focus on Foundation Building / Confidence & Routine / Course Navigation rather than advanced concepts.
- progress_markers: 6 measurable markers with current and target values.
- practice_principles: exactly 4 guiding principles for the student's practice.
- arc_intro: 2-3 sentence overview of the 6-week plan.
- arc_closing: motivational closing paragraph.
- date_label: "April 2026". arc_date_label: "April \u2013 May 2026".

Call the tool exactly once. Do not output any text outside the tool call.`;

function formatProfileForClaude(data) {
    const lines = ['=== GOLFER PROFILE SUBMISSION ===', ''];
    for (const [key, value] of Object.entries(data)) {
        if (key === 'website' || key === 'id') continue;
        const pretty = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const val = Array.isArray(value) ? value.join(', ') : (value || '\u2014');
        lines.push(`${pretty}: ${val}`);
    }
    return lines.join('\n');
}
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body || {};
    if (!data.full_name) {
        return res.status(400).json({ error: 'full_name is required.' });
    }

    let anthropicKey;
    try {
        anthropicKey = requireEnv('ANTHROPIC_API_KEY');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    const start = Date.now();
    const profileText = formatProfileForClaude(data);

    try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const resp = await anthropic.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: SYSTEM_PROMPT,
            tools: [{
                name: 'write_arc_plan',
                description: 'Write the 6-Week Coaching Arc structured data. Call exactly once.',
                input_schema: ARC_SCHEMA,
            }],
            tool_choice: { type: 'tool', name: 'write_arc_plan' },
            messages: [{ role: 'user', content: profileText }],
        });

        const elapsed = Date.now() - start;
        const toolUse = resp.content.find((b) => b.type === 'tool_use');
        if (!toolUse || !toolUse.input) {
            throw new Error('Anthropic did not return a tool_use block.');
        }

        const arcData = toolUse.input;

        // If a submission ID was provided, save to Blob
        if (data.id) {
            try {
                await putJson(`profiles/${data.id}/arc_analysis.json`, arcData);
            } catch (e) {
                console.error('Save arc analysis error:', e);
            }
        }

        return res.status(200).json({
            success: true,
            elapsed_ms: elapsed,
            elapsed_s: (elapsed / 1000).toFixed(1),
            usage: resp.usage,
            arc: arcData,
        });
    } catch (err) {
        const elapsed = Date.now() - start;
        return res.status(502).json({
            error: err.message,
            elapsed_ms: elapsed,
            elapsed_s: (elapsed / 1000).toFixed(1),
        });
    }
}
