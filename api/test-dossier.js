// POST /api/test-dossier
//
// Standalone timing test: calls Anthropic with ONLY the Player Dossier schema
// fields to see if it fits within the 60-second Hobby plan limit.

import Anthropic from '@anthropic-ai/sdk';

export const config = { maxDuration: 60 };

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

const DOSSIER_SCHEMA = {
    type: 'object',
    required: ['student', 'identity_paragraphs', 'skill_radar', 'skill_notes', 'diagnostic_sections', 'prescriptions', 'tiger5_dossier', 'arc_phases', 'goals', 'dossier_closing'],
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
        identity_paragraphs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Two paragraphs for the "PLAYER IDENTITY" section.',
        },
        skill_radar: {
            type: 'object',
            required: ['labels', 'scores'],
            properties: {
                labels: { type: 'array', items: { type: 'string' } },
                scores: { type: 'array', items: { type: 'number' } },
            },
        },
        skill_notes: {
            type: 'array', minItems: 6, maxItems: 6,
            items: {
                type: 'object',
                required: ['area', 'score', 'note', 'level'],
                properties: {
                    area: { type: 'string' },
                    score: { type: 'number' },
                    note: { type: 'string' },
                    level: { enum: ['GREEN', 'BLUE', 'AMBER', 'RED'] },
                },
            },
        },
        diagnostic_sections: {
            type: 'array', minItems: 6, maxItems: 6,
            items: {
                type: 'object',
                required: ['title', 'flag_label', 'flag_level', 'body', 'flags'],
                properties: {
                    title: { type: 'string' },
                    flag_label: { type: 'string' },
                    flag_level: { enum: ['GREEN', 'BLUE', 'AMBER', 'RED'] },
                    body: { type: 'string' },
                    flags: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['prefix', 'text', 'level'],
                            properties: {
                                prefix: { type: 'string' },
                                text: { type: 'string' },
                                level: { enum: ['GREEN', 'BLUE', 'AMBER', 'RED'] },
                            },
                        },
                    },
                },
            },
        },
        prescriptions: {
            type: 'array', minItems: 5, maxItems: 7,
            items: {
                type: 'object',
                required: ['num', 'title', 'goal_link', 'body', 'level'],
                properties: {
                    num: { type: 'string' },
                    title: { type: 'string' },
                    goal_link: { type: 'string' },
                    body: { type: 'string' },
                    level: { enum: ['GREEN', 'BLUE', 'AMBER', 'RED'] },
                },
            },
        },        tiger5_dossier: {
            type: 'array', minItems: 5, maxItems: 5,
            items: {
                type: 'object',
                required: ['num', 'title', 'diag', 'risk_label', 'risk_level', 'rx'],
                properties: {
                    num: { type: 'string' },
                    title: { type: 'string' },
                    diag: { type: 'string' },
                    risk_label: { type: 'string' },
                    risk_level: { enum: ['GREEN', 'BLUE', 'AMBER', 'RED'] },
                    rx: { type: 'string' },
                },
            },
        },
        arc_phases: {
            type: 'array', minItems: 4, maxItems: 4,
            items: {
                type: 'object',
                required: ['title', 'name', 'items', 'checkpoint'],
                properties: {
                    title: { type: 'string' },
                    name: { type: 'string' },
                    items: { type: 'array', items: { type: 'string' } },
                    checkpoint: { type: 'string' },
                },
            },
        },
        goals: {
            type: 'array', minItems: 2, maxItems: 4,
            items: {
                type: 'object',
                required: ['num', 'title', 'context', 'metrics'],
                properties: {
                    num: { type: 'string' },
                    title: { type: 'string' },
                    context: { type: 'string' },
                    metrics: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['label', 'value'],
                            properties: {
                                label: { type: 'string' },
                                value: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        dossier_closing: { type: 'string' },
    },
};

const SYSTEM_PROMPT = `You are Ryan Rinneard's Golfer Profile Interpreter.
You are generating ONLY the Player Dossier data for a student.

Principles:
- Ground everything in TPI, TrackMan, and Vision54 best practices.
- Use the student's first name throughout. Direct, specific, coach-to-coach tone.
- Ryan's cues are short, physical, non-mechanical when possible.
- Never invent a metric the student did not provide.

Content requirements:
- identity_paragraphs: Two honest paragraphs about who this player is.
- skill_radar: 6 labels (Long Game, Approach, Short Game, Putting, Course Mgmt, Mental Game) with scores 0-10.
- skill_notes: Same six areas in same order, with level (GREEN \u22658 / BLUE 6-7.9 / AMBER 4-5.9 / RED <4).
- diagnostic_sections: exactly 6 sections (Long Game, Approach, Short Game, Putting, Course Mgmt, Mental Game). Each has 2-3 flags with prefix (WARNING / GOOD / NOTE).
- prescriptions: 5-7 ranked recommendations, each with goal_link tying back to student's stated goal.
- tiger5_dossier: exactly 5 items using Scott Fawcett / DECADE Tiger 5 framework. risk_label (HIGH RISK / MODERATE / LOW RISK) with matching risk_level (RED / AMBER / GREEN / BLUE).
- arc_phases: exactly 4 phases summarizing 6 sessions (1-2, 3-4, 5, 6).
- goals: 2-4 commitments, each with 3-4 metrics.
- date_label: "April 2026".
- dossier_closing: motivational closing paragraph.

Call the tool exactly once. Do not output any text outside the tool call.`;
const TEST_PROFILE = `=== GOLFER PROFILE SUBMISSION ===

Full Name: Claude Testington
Email: test@example.com
Age Range: 35-44
Years Playing: 8
Handicap Index: 15.2
Typical Score: 87
Rounds Per Month: 4
Goals: Break 80 consistently, better course management
Driver Distance: 240 yards
Driver Miss: Slice/fade that gets worse under pressure
Iron Dispersion: 15-20 yards offline
GIR Percentage: 35%
Approach Strength: Mid irons are reliable, long irons are weak
Short Game Self Rating: 6/10
Chipping Tendency: Sometimes chunk, sometimes blade
Bunker Comfort: Not comfortable, avoid bunkers
Scrambling: About 30%
Putting Self Rating: 5/10
Putts Per Round: 34
Three Putt Frequency: 4-5 per round
Putting Weakness: Speed control on long putts, read breaking putts poorly
Mental Game Rating: 5/10
Biggest Mental Challenge: Getting frustrated after bad shots, compound errors
On Course Management: Tend to go for hero shots instead of playing safe
Pre Shot Routine: Inconsistent, sometimes rush
Practice Frequency: 2x per week, mostly range
Practice Focus: Usually just hitting driver
Short Game Practice: Rarely
Putting Practice: Sometimes before a round
Access To Facilities: Full practice facility with range, short game area, putting green
Lesson History: A few lessons years ago, nothing recent
What Would Success Look Like: Shooting in the 70s, enjoying the game more, having a plan`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let anthropicKey;
    try {
        anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not set');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    const start = Date.now();

    try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const resp = await anthropic.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: SYSTEM_PROMPT,
            tools: [{
                name: 'write_player_dossier',
                description: 'Write the Player Dossier structured data. Call exactly once.',
                input_schema: DOSSIER_SCHEMA,
            }],
            tool_choice: { type: 'tool', name: 'write_player_dossier' },
            messages: [{ role: 'user', content: TEST_PROFILE }],
        });

        const elapsed = Date.now() - start;
        const toolUse = resp.content.find((b) => b.type === 'tool_use');

        return res.status(200).json({
            success: true,
            elapsed_ms: elapsed,
            elapsed_s: (elapsed / 1000).toFixed(1),
            has_data: !!toolUse?.input,
            usage: resp.usage,
            diagnostic_count: toolUse?.input?.diagnostic_sections?.length || 0,
            prescriptions_count: toolUse?.input?.prescriptions?.length || 0,
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
