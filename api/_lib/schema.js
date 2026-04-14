// JSON schema that Claude emits for every profile. All three PDF templates +
// the markdown analysis are rendered from this single object.
//
// IMPORTANT: every field listed here is referenced by one or more templates.
// Adding fields is safe; removing fields will break rendering unless you also
// update the template that consumes them.

export const PDF_DATA_SCHEMA = {
    type: 'object',
    required: ['student', 'snapshot', 'priorities', 'focuses', 'sessions', 'prescriptions'],
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

        date_label: { type: 'string', description: 'e.g. "April 2026"' },
        arc_date_label: { type: 'string', description: 'e.g. "April – May 2026"' },

        snapshot: {
            type: 'string',
            description: '4–6 sentence player summary for the Session 1 Plan cover section.',
        },
        identity_paragraphs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Two paragraphs for the Dossier "PLAYER IDENTITY" section.',
        },

        stat_strip: {
            type: 'array',
            minItems: 5, maxItems: 5,
            items: {
                type: 'object',
                required: ['value', 'label'],
                properties: { value: { type: 'string' }, label: { type: 'string' } },
            },
        },

        priorities: {
            type: 'array', minItems: 3, maxItems: 6,
            items: {
                type: 'object',
                required: ['title', 'desc'],
                properties: { title: { type: 'string' }, desc: { type: 'string' } },
            },
        },

        focuses: {
            type: 'array', minItems: 3, maxItems: 5,
            items: {
                type: 'object',
                required: ['title', 'why', 'drill', 'cue', 'tag'],
                properties: {
                    title: { type: 'string' },
                    why: { type: 'string' },
                    drill: { type: 'string' },
                    cue: { type: 'string' },
                    tag: { type: 'string', description: 'e.g. LONG GAME, BALL STRIKING, PUTTING' },
                },
            },
        },

        tiger5_session1: {
            type: 'array', minItems: 5, maxItems: 5,
            items: {
                type: 'object',
                required: ['num', 'title', 'desc', 'risk'],
                properties: {
                    num: { type: 'string' },
                    title: { type: 'string' },
                    desc: { type: 'string' },
                    risk: { enum: ['HIGH RISK', 'MANAGEABLE'] },
                },
            },
        },

        probes: {
            type: 'array', minItems: 4, maxItems: 8,
            items: {
                type: 'object',
                required: ['label', 'text'],
                properties: { label: { type: 'string' }, text: { type: 'string' } },
            },
        },

        session1_closing: { type: 'string' },

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
        },
        tiger5_dossier: {
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

// Render the JSON payload as a human-readable markdown analysis for the
// admin preview. Derived from the JSON so there's one source of truth.
export function renderMarkdown(data) {
    const s = data.student || {};
    const L = [];
    L.push(`# ${s.name || 'Player'} — Coaching Roadmap`);
    L.push('');
    L.push(`**Handicap:** ${s.handicap || '—'}  `);
    L.push(`**Goal:** ${s.goal || '—'}  `);
    L.push(`**Experience:** ${s.experience || '—'}`);
    L.push('');

    L.push('## Player Summary');
    L.push(data.snapshot || '(no summary provided)');
    L.push('');

    if (data.priorities?.length) {
        L.push('## Priority Order');
        data.priorities.forEach((p, i) => {
            L.push(`**${i + 1}. ${p.title}** — ${p.desc}`);
            L.push('');
        });
    }

    if (data.focuses?.length) {
        L.push('## Session 1 — Focus Areas');
        data.focuses.forEach((f, i) => {
            L.push(`### ${String(i + 1).padStart(2, '0')}. ${f.title} _(${f.tag})_`);
            L.push(`**Why it matters:** ${f.why}`);
            L.push(`**Drill:** ${f.drill}`);
            L.push(`**Cue:** _${f.cue}_`);
            L.push('');
        });
    }

    if (data.sessions?.length) {
        L.push('## 6-Week Arc');
        data.sessions.forEach((sess) => {
            L.push(`### Week ${sess.week} — ${sess.theme}`);
            L.push(`_${sess.subtitle}_`);
            L.push(`- **Primary:** ${sess.primary}`);
            L.push(`- **Secondary:** ${sess.secondary}`);
            L.push(`- **Ready when:** ${sess.ready_when}`);
            L.push(`- **Measure:** ${sess.measure}`);
            L.push('');
        });
    }

    if (data.prescriptions?.length) {
        L.push('## Priority Prescription (Ranked)');
        data.prescriptions.forEach((p) => {
            L.push(`**${p.num}. ${p.title}** — _${p.goal_link}_`);
            L.push(p.body);
            L.push('');
        });
    }

    if (data.probes?.length) {
        L.push('## Questions to Probe On-Lesson');
        data.probes.forEach((p) => {
            L.push(`- **${p.label}:** ${p.text}`);
        });
        L.push('');
    }

    if (data.session1_closing) {
        L.push('## Closing Note');
        L.push(`_${data.session1_closing}_`);
    }

    return L.join('\n');
}
