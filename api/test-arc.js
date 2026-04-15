// POST /api/test-arc
//
// Standalone timing test: calls Anthropic with ONLY the 6-Week Arc schema
// fields to see if it fits within the 60-second Hobby plan limit.

import Anthropic from '@anthropic-ai/sdk';

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
- Use the student's first name throughout. Direct, specific, coach-to-coach tone.
- Ryan's cues are short, physical, non-mechanical when possible.
- Never invent a metric the student did not provide.

Content requirements:
- sessions: exactly 6 weeks, each building on the last. Week 5 is typically a playing lesson; week 6 is reassess/re-baseline.
- arc_themes: exactly 3 themes (Technical Precision / Routine & Mental / Course Management is a good default but adjust to the player).
- progress_markers: 6 measurable markers with current and target values.
- practice_principles: exactly 4 guiding principles for the student's practice.
- arc_intro: 2-3 sentence overview of the 6-week plan.
- arc_closing: motivational closing paragraph.
- date_label: "April 2026". arc_date_label: "April \u2013 May 2026".

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
                name: 'write_arc_plan',
                description: 'Write the 6-Week Coaching Arc structured data. Call exactly once.',
                input_schema: ARC_SCHEMA,
            }],
            tool_choice: { type: 'tool', name: 'write_arc_plan' },
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
            sessions_count: toolUse?.input?.sessions?.length || 0,
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
