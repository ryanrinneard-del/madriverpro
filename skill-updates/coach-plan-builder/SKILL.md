---
name: coach-plan-builder
description: Build the coach-side plan for a Junior Elite Academy player at Mad River Pro. Takes the existing Player Profile interpretation output plus a small set of coach-only intake additions (ecosystem map, three-horizon goals, the "why" answer, early observation notes) and produces an eight-section diagnostic dossier that Ryan Rinneard operates from. Always pair this output with — but never substitute it for — the player-facing Game Plan produced by the golfer-profile-interpreter skill. This skill is for Ryan's eyes only. Triggers when Ryan needs to build, refresh, or quarterly-update the coach-side plan for a junior in his program. Also triggers on phrases like "build a coach plan," "update [name]'s dossier," "quarterly review for [name]," "what's my plan for [name] this season."
---

# coach-plan-builder

## What this skill is

This skill builds the **coach-side plan** for a Junior Elite Academy player. It is distinct from the existing `golfer-profile-interpreter` skill, which produces the *player-facing* Player Profile read and Game Plan in Ryan's coaching voice.

This skill produces a different artifact: the **diagnostic dossier Ryan operates from** — analytical, structural, decision-oriented, never delivered to the player verbatim.

The two skills work as a pair:

| | **golfer-profile-interpreter (existing)** | **coach-plan-builder (this skill)** |
|---|---|---|
| **Audience** | Player + parents | Ryan only |
| **Voice** | Warm, first-person Ryan | Diagnostic, structural |
| **Input** | Filled Know Your Game questionnaire | The output of the existing skill + four coach-only intake additions |
| **Output** | Player-facing Game Plan | Eight-section coach-side dossier |
| **Distribution** | Shared with player + sometimes parents | Ryan's coaching notes only |

## When to invoke this skill

- **At intake** for a new junior — build the v1 dossier after Ryan has run the existing golfer-profile-interpreter skill and completed the first session.
- **Quarterly** for any junior already in the program — refresh the dossier with new observation data, life-cycle assessment changes, season-context shifts.
- **After a major event** for any Elite kid — capture what changed and update the relevant sections.
- **When Ryan is preparing for a session** with a junior — pull the dossier as the operational reference for what to do this session.
- **Before a parent meeting** — pull the dossier as the source of truth for what Ryan will say and what he won't.

## How this skill works (mechanics)

The skill follows a five-step process every time it runs:

### Step 1 — Read the inputs

Look for these inputs in this order:

1. **The existing Player Profile interpretation output** for this player (from the `golfer-profile-interpreter` skill). Required.
2. **The coach-only intake additions** — these aren't on the questionnaire and need to be captured during Ryan's intake conversation:
   - **Ecosystem map** — who else is in the kid's golf life (parents / HS coach / club pro / regular playing partners / strength coach / sports psych / siblings who play / extended family).
   - **Three-horizon goals** — short-term (next 4–6 weeks), intermediate (this season / next 6–12 months), long-term (2+ years).
   - **The "why" answer** — why does the kid want to do this work? *(Prove something to himself / play in college / be the best on his HS team / reach a milestone / love of the game.)*
   - **Early observation notes** — what Ryan has personally observed in the first 1–3 sessions.

If any of the four coach-only additions are missing, **prompt Ryan for them before generating the dossier.** Don't fabricate them.

### Step 2 — Cross-reference the operating frameworks

Pull from the references in `references/` to apply the eleven frameworks from Ryan's operating playbook (derived from but not verbatim from *The Coaching Code*):

- The intervention archetype taxonomy (`references/intervention-archetypes.md`)
- The learner-style taxonomy (`references/learner-styles.md`)
- The stock-shot read prompts (`references/stock-shot-read.md`) *(stub — to be filled out as Ryan iterates)*
- The three-stage life-cycle indicators (`references/life-cycle-indicators.md`)
- The four-input post-round alignment (`references/post-round-alignment.md`) *(stub)*
- The three-restraint card template (`references/three-restraint-card.md`) *(stub)*
- The narrative templates library (`references/narrative-templates.md`) *(stub)*
- The five-tier communication cadence (`references/communication-cadence.md`) *(stub)*
- The four intake-contract clauses (`references/intake-clauses.md`)

**Technical-framework integration (Hugh / Altus / Pelz):** the technical coaching frameworks live in the sister `golfer-profile-interpreter` skill, not in this skill's references. When a section of the dossier needs a technical recommendation (Stock-Shot Read in Section 2, Tournament-Site Playbook in Section 7, etc.), pull the framework from `golfer-profile-interpreter` and translate it into Ryan's operator-voice. **Source defaults: Pelz Short Game Bible for any short-game or putting recommendation; Hugh's Frameworks for full-swing and setup; Altus Performance for ball-striking fault diagnosis.** Don't mix sources within a single recommendation. Per the per-dossier discipline rule (below), pick one protocol that fits the player's specific leak.

### Step 3 — Generate the eight-section dossier

Use `references/dossier-template.md` as the structural template. Fill each of the eight sections with player-specific content derived from the inputs and the operating frameworks. The output is always the eight sections, in this order:

1. **Stress-Profile Read** — pressure-response archetype, reset-ritual candidates, stress-trigger patterns, pre-round protocols
2. **Stock-Shot and Strategy Read** — natural stock-shot tendency, default course-management rules, three-restraint-moves card content, practice-mix audit. *Pelz integration: for any junior whose questionnaire surfaces a scoring-zone leak (low wedge confidence, deceleration, single go-to wedge, lag-putting trouble), the practice-mix audit in this section MUST include Pelz's allocation framework (~25–30% wedge-band, ~20–25% putting) and surface the wedge-matrix dial-in as the foundational off-ice work.*
3. **Verification Plan** — what to document per session, single-variable change rule applied here, contrast-practice routine, monthly verification review checklist
4. **Filter Profile** — information-uptake style, minimum-effective-intervention cue library, eyes-closed feel-video pilot decision, shared vernacular sheet
5. **Loss Curriculum** — when After-Action Plan fires for this kid, narrative templates pre-written, stretch-event schedule, parent-facing scripts
6. **Long-Arc Read** — three-horizon goals captured, ecosystem map, communication cadence per channel, life-cycle stage assessment
7. **Tournament-Site Playbook** — pre-round warm-up framework customized, four-input post-round alignment, per-venue reconnaissance checklist, self-correction watchpoint rule. *Pelz integration: the pre-round warm-up should always include a scoring-zone block (10 minutes minimum — wedge-matrix touch-up + 9-ball 30-foot lag putts + 5-foot fork drill) before any range work. Scoring-zone feel is the most rapidly perishable skill and most amateur warmups skip it entirely.*
8. **Engagement and Empathy Protocols** — per-kid metrics (2–3), challenge/competence ratio default, three ownership-transfer questions ready, method-fit notes

### Step 4 — Produce the session-mode tag

After the eight sections, produce a short **operational tag block** for the next 1–4 upcoming sessions:

- **Mode** — primarily *teaching* or primarily *coaching* for each session
- **Challenge/competence ratio** — the planned split for each session (e.g., 70/30, 60/40, 40/60, 50/50)
- **One thing to track** — the single most important data point Ryan should capture from this session
- **One thing to not do** — the failure mode most likely for this kid right now

### Step 5 — Save the dossier

Save the dossier to `/Users/rr/Coaching-Code/dossiers/[player-first-name]-[YYYY-MM-DD].md` so the version history is preserved. Each quarterly update creates a new dated dossier — the prior one stays accessible for reference.

## Hard rules — what this skill MUST NOT do

- **Never deliver any portion of the dossier to the player or parents verbatim.** Selected pieces can be translated into player-facing language and folded into the Game Plan, but the diagnostic frame stays Ryan's.
- **Never reference *The Coaching Code* or Mark Blackburn by name in the output.** The frameworks are restated in Ryan's operating language. Only the eight items from the strategic plan's "absolute gold carveout" list (`references/attribution-rules.md`) carry attribution if used externally — and the dossier is internal, so attribution doesn't apply here.
- **Never fabricate intake data.** If the coach-only additions (ecosystem map, three-horizon goals, "why" answer, early observation notes) are missing, prompt Ryan for them. Don't guess.
- **Never compress the eight sections to fewer than eight.** The structure is the structure. If a section is genuinely empty for a new kid (e.g., no Tournament-Site Playbook before the kid has played any events), say so explicitly with a *"to be populated after first event"* note.
- **Never use the dossier as a substitute for actual observation.** The dossier is a synthesis tool. The observation work — sessions, on-course time, ecosystem conversations — is what produces the inputs the dossier synthesizes.

## Voice and tone of the dossier

- **First-person Ryan, but in operational mode.** Not the warm coaching voice of the player-facing Game Plan — the analytical-operator voice of someone making real decisions about what to do next.
- **Direct, decisive, specific.** "This kid responds to narrated warm-ups; default to that for the SCJGT season" — not "this kid might possibly benefit from..."
- **Cross-referenced.** When a section pulls from an earlier framework, say so explicitly. *"Using the intervention archetype taxonomy from references — this kid is a clear technical-validation player."*
- **Honest about gaps.** If something isn't known yet, name it. *"Stock-shot tendency unclear from intake; needs assessment in first three sessions."*

## Format Discipline (READ EVERY TIME — Ryan reads these on the range)

The dossier is Ryan's operational notebook. He's reading it between shots, before a lesson, on the practice green. He cannot afford to wade through paragraphs to find what to do. Every section must pass the **glance test**: can Ryan look at it for 5 seconds and know what to do?

Apply these rules every time:

1. **Tables over paragraphs for structured data.** Drills, metrics, scripts, schedules, scenarios, cues, ratios — anything that's a list of distinct items with attributes goes in a table. Reserve prose for nuance that genuinely requires sentences.
2. **Define every drill, metric, or framework inline on first mention.** When the dossier says "9-ball lag," it must include the one-line definition in the same row/sentence: *"9 balls from 30 ft to a hole; count finishes within 3-ft radius."* Don't make Ryan flip back to a reference. He won't.
3. **Cut all expository "why" prose.** Ryan knows why short game matters, why distance control beats line, why deceleration is fear. The skill's reference content already explains those things. The dossier delivers the **what** and the **when**, not the why. If a "why" line would be cut and the operational meaning survives, cut it.
4. **Short bullets over multi-sentence bullets.** A bullet should be one sentence or one phrase. If a bullet needs 3 sentences, it's actually a sub-section — give it its own table row or heading.
5. **Every section answers "what do I do?" not "what do I think about?"** Pre-shot rituals, scripts, cue libraries, metric thresholds, when-to-fire triggers — these are the meat. Theory belongs in the skill reference, not in the dossier.
6. **Use the same operator voice in scripts.** When a script is delivered to the player, write it in quotes exactly as Ryan would say it — no setup, no preamble, no "you could say something like." Just the line.
7. **Length target:** the full 8-section dossier (plus session-mode tag + open items) should fit in roughly **800–1,200 words** for a v1 intake. Quarterly refreshes typically shorter (~500–800 words). If you're past 1,500, you've drifted into expository writing — cut.
8. **Glance test before delivering.** Re-read each section: could Ryan act on this in 5 seconds of reading? If not, restructure.

The skill produced verbose v1 outputs before this discipline was added (early May 2026 dossiers). Don't replicate that pattern. **The dossier's value is in what it tells Ryan to DO, packaged so he can find it instantly.**

## Updating an existing dossier

Quarterly updates: re-run the skill, pulling the most recent prior dossier as one of the inputs alongside any new observation data. The output is a new dated file — don't overwrite the prior one. Write a short *"what changed since last quarter"* paragraph at the top of the new dossier.

After a major event: re-run the skill in *event-update* mode — only sections 5 (Loss Curriculum), 7 (Tournament-Site Playbook), and 8 (Engagement) get updated. Other sections carry forward unchanged unless the event surfaced something genuinely new.

## What's in v1 vs. what's coming

This is **v1** — the eight-section structure works, the four-clauses-and-intervention-archetype-and-learner-style-and-life-cycle references are filled out properly. The other references in `references/` are **stubs** that need filling in over the first season as Ryan accumulates his per-kid data and per-event templates.

**v2 priorities (next iteration):**
- Per-archetype intervention recommendations fully fleshed out
- Narrative template library populated with the most common event outcomes
- Three-restraint card content per kid
- Stock-shot read prompts integrated with TrackMan data
- Per-venue prep sheet template

**v3 priorities (later):**
- Tighter integration with the existing Player Profile interpretation skill (auto-pull the output)
- Quarterly update protocols semi-automated
- Portal-form generation (After-Action Plan form, ecosystem-map form, etc.)
- Per-cohort patterns surfaced across multiple kids' dossiers
