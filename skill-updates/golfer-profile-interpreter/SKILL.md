---
name: golfer-profile-interpreter
description: >
  Interpret and analyze completed golfer profile questionnaires submitted before a coaching lesson with Ryan Rinneard. Use this skill whenever a student's filled-out profile is shared — whether pasted as text, submitted via form, uploaded as a file, or described in conversation. This skill transforms raw questionnaire data into a structured coaching roadmap grounded in TPI, TrackMan, and Vision54 best practices. Triggers include: "here's my student's profile", "a client just filled out the questionnaire", "can you analyze this golfer's answers", "build a coaching plan for this player", or any time profile data from the Know Your Game questionnaire at madriverpro.com is presented. Always use this skill even if only partial data is available.
---

# Golfer Profile Interpreter

Ryan Rinneard's pre-lesson questionnaire (madriverpro.com/coaching/know-your-game.html) covers 7 sections. When a completed profile is received, this skill produces a structured coaching roadmap that Ryan can use to direct the lesson and communicate clearly with the student.

## Your Job

Transform the submitted profile data into:
1. **Player Summary** — a clear, human snapshot of who this golfer is
2. **Game Diagnostic** — section-by-section interpretation using best practices
3. **Priority Ranking** — highest-leverage areas to address first (strokes-gained logic)
4. **Coaching Plan** — specific focus areas, cues, and drills for the first session(s)
5. **Questions to Probe On-Lesson** — things the profile can't answer that Ryan should observe or ask

Do not skip any of these five outputs. Do not invent data not present in the profile.

---

## Framework Sources (read this before applying any framework)

Ryan is certified in multiple coaching systems. The frameworks in this skill come from clearly attributed teaching corpora. Every framework section names its source so the model knows where each recommendation comes from.

**Current sources:**
- **Hugh's Frameworks** — the primary teaching corpus, covering setup baselines, ball flight, slice, speed, driver, grip, pressure points, short game, bunker, wedges, and practice strategies. Hugh's coaching philosophy ("Baselines and Markers — never default to wrong") sits beneath all of it.
- **Altus Performance Framework** — a structured ball-striking problem-solving system Ryan is certified in. Attribution: Ryan is an Altus Performance Certified coach. Altus uses a "Red Flags → Top Plays" diagnostic-and-intervention model that complements Hugh's work, particularly on path errors and ball-striking faults.
- **Pelz Short Game Bible** — Dave Pelz's empirical research and instructional system for the "scoring zone" (60 yards and in, plus putting). Source for the clock-based swing-length distance system, the 4-wedge yardage-gap matrix, the "dead hands / quiet wrists" philosophy that fixes deceleration, the bunker splash method, and the putting Big Three (distance over line, 17-inch optimal pace, fork drill). Pelz is the short-game complement to Hugh — when the player's leak is in chip, pitch, wedge, bunker, or putting, default to Pelz's frameworks for delivery mechanics and distance-control architecture while keeping Hugh's setup baselines (posture, balance, ball position) underneath. See the "Pelz Short Game Bible" reference cluster later in this document.

**The rule when frameworks overlap:**
1. **Each framework section is labeled with its source.** No mixing in body text. If a recommendation comes from Hugh, say so. If it comes from Altus, say so.
2. **Per-dossier discipline applies (see below):** ONE protocol max per player dossier. Don't run Hugh's Slice Protocol AND Altus Out-to-In framework on the same player. Pick the one that fits the player's specific issue best.
3. **For overlap topics, each section includes a "Framework Selection Rubric"** — when to use this source vs. the alternative. Honor the rubric.
4. **Frameworks coexist as alternative tools, not competing dogmas.** Different angles on the same problem. The right choice depends on which red flag the player's profile surfaces.

The dossier output never says "I picked Hugh over Altus" — it just delivers the recommendation in plain coaching language. Attribution lives in the skill's reference content, not in the player's deliverable.

---

## Section-by-Section Interpretation Guide

### Section 1 — About You (Player Profile)

**What to extract:**
- Age bracket + years playing = likely learning style and ingrained pattern depth
- Handicap/average score = skill tier (see tiers below)
- Goals = the emotional contract of the lesson; always validate and connect coaching to stated goals

**Skill Tiers by Handicap:**
- **Beginner (no hdcp / 30+ avg):** Focus on fundamentals, contact, enjoyment. Process over outcome.
- **High Hdcp (20–29):** Consistent contact, basic trajectory, on-course survival skills.
- **Mid Hdcp (10–19):** Ball flight patterns, shot shaping awareness, short game conversion.
- **Low Hdcp (0–9):** Efficiency, dispersion, scoring zones, pressure performance.
- **Scratch/Plus:** TrackMan optimization, course strategy, mental performance, marginal gains.

**Coaching note:** The longer someone has played, the more ingrained their patterns. Adjust communication accordingly — don't over-prescribe change for a 20-year player who has scored consistently.

---

### Section 2 — Long Game (Driver, FW, Long Irons)

**Miss Pattern Diagnosis (per ball flight laws / TrackMan principles):**
- **Slice/Fade:** Clubface open to path at impact. Face is ~85% responsible for start direction (driver). Path is likely left (OTT). Check grip (often weak), alignment, and shoulder sequencing. **Setup-level fix to try first:** ball position. See "Setup Reference — The Two-Line Template" — moving the ball back toward the sternum line can shift path 3–5° toward neutral without any swing change. **For a full corrective protocol** (face fix → path fix → integration drill), see "Slice Faults and Fixes — Coaching Protocol" below.
- **Hook/Draw:** Closed face to path. Path likely too far in-to-out. Common in mid-hdcp players who over-corrected a slice. Check grip strength and early extension. **Setup-level fix to try first:** moving the ball forward toward the lead-shoulder line can shift path 3–5° back toward neutral. See "Setup Reference — The Two-Line Template."
- **Top/Thin:** Low point issue — usually **vertically too shallow** (club never gets deep enough), but can also be the cruel-misdiagnosis case of **vertically too deep** where the club climbs up the face. Likely contributors: early extension, loss of posture, or weight hanging back. TPI note: often linked to hip mobility restriction or S-posture. **See "Impact Dynamics Reference — Low Point Control (3 Dimensions)" → Dimension 3 (Vertical).**
- **Fat/Heavy:** Low point in the wrong place — but **be careful which kind**. Could be **horizontally behind the ball** (weight hanging on trail side) or **vertically too deep** (steep entry that gouges before the ball even though the bottom-out point is in the right horizontal spot). These two look identical and need different fixes. **See "Impact Dynamics Reference — Low Point Control (3 Dimensions)" → Dimensions 2 and 3, including the misdiagnosis trap.**
- **No Pattern (two-way miss):** Typically a severe path issue (very left) with face flipping randomly. Shoulder sequencing breakdown. Most difficult to correct; start with path before face.
- **Heel strike:** Sweet spot is moving AWAY from the player during the swing. Most common cause is pressure shifting toward the toes; secondary causes are standing-up posture change and an over-active release that lengthens the radius. **See "Impact Dynamics Reference — Low Point Control (3 Dimensions)" → Dimension 1 (Lateral) for the full framework.** Do NOT generate explanations of heel/toe strike direction without consulting that section first — the directional logic is counter-intuitive and AI commonly inverts it.
- **Toe strike:** Sweet spot is moving TOWARD the player during the swing. Most common cause is pressure shifting toward the heels; secondary causes are a "covering" / forward posture change and an under-active release ("hanging the handle"). **See "Impact Dynamics Reference — Low Point Control (3 Dimensions)" → Dimension 1 (Lateral).**
- **Shank / neck strike:** Ball struck on the hosel. Almost always a combination of an extreme heel-strike pattern (Dimension 1) and a vertically-too-deep low point (Dimension 3). Do not call it a "closed-face shank" — that's a misdiagnosis. **See "Impact Dynamics Reference — Shanks (Neck Strikes)" for the full diagnostic and coaching approach.**

**Driving Distance Interpretation:**
- Under 180: Equipment fit check warranted; likely swing speed issue or contact quality
- 180–210: Beginner–high hdcp range; prioritize contact and basic path before distance
- 210–240: Mid hdcp; gain distance through better strike, not swing speed
- 240–270: Low hdcp range; efficiency gains available through attack angle and spin optimization
- 270+: TrackMan-level fine-tuning; optimize spin rate and launch conditions

**Fairway Hit % flag:** Under 30% = accuracy is a priority over distance. Never add distance to an inaccurate pattern.

**Confidence sliders (FW woods, long irons):** Low confidence on either = avoid prescribing them during play until addressed. High-lofted FW replacement for long irons is worth exploring for 10+ hdcp players.

---

### Section 3 — Approach Game (Mid/Short Irons, Wedges)

**Club Distance Awareness:**
- "Not really" = student is guessing on every approach; gap analysis is a session priority
- "Rough idea" = functional but leaves strokes on the table; TrackMan dial-in recommended
- "Yes, dialed in" = good foundation; focus coaching on trajectory, landing zone, and dispersion

**GIR Benchmarks (strokes-gained context):**
- 0–3 GIR: Approach game is a major scoring leak; even modest GIR improvement = significant score reduction
- 4–6 GIR: Mid hdcp range; work on distance gapping and eliminating short misses
- 7–9 GIR: Solidly functional; optimize wedge distances and attack angle to improve proximity
- 10–12 GIR: Low hdcp performance; dial in yardage gaps, trajectory, and miss management
- 13+: Scratch-level; SG:Approach analysis warranted

**Confidence ladder check:** If 6–8 irons are high confidence but 9–PW or wedges drop off, there is likely a technique shift (shorter swing, more wrist action) the student isn't comfortable with yet. Address swing consistency across clubs.

**Common approach errors to diagnose:**
- Poor contact on wedges with full swings → check ball position (center), posture, and hip clearance
- Distance inconsistency → check tempo and low point control (divot board drill)

---

### Section 4 — Short Game (Chip, Pitch, Bunker)

**Skill importance note:** Short game accounts for ~60% of strokes for most amateurs (per Pelz's empirical research). For any player 10+ hdcp, short-game improvement delivers the fastest score reduction. This is the "scoring zone" framing — surface it when a player undervalues short-game practice relative to its leverage. **For the full framework, see "Pelz Short Game Bible — The Scoring Zone & Practice Allocation."**

**Comfort score interpretation:**
- Under 4/10 on any area = a priority; do not leave this section unaddressed
- Low bump-and-run + low high loft = player likely has one swing for everything; diversify the toolkit. **The Pelz 4-Wedge System provides the structural answer — see "Pelz Wedge System — Clock-Based Distance Control + 4-Wedge Gapping."**
- Low bunker comfort is extremely common; often a setup/technique issue (open face, open stance, acceleration) that is fixable quickly. **See "Pelz Bunker Framework — The Splash Method" for the full protocol.**

**Common short game mistakes interpretation:**
- **Chunk/fat:** Low point behind ball OR vertically too deep; weight hanging back, decelerating, or trying to lift the ball. Around the green these two flavors are easy to confuse — always check divot depth before assuming "behind the ball." See "Impact Dynamics Reference — Low Point Control (3 Dimensions)" → Dimensions 2 and 3.
- **Blade/thin:** Vertically too shallow (most common around the green) — usually over-compensating for chunk fear; hands flipping through impact, chest pulling up. Less commonly, vertically too deep with the club climbing up the ball. See Dimension 3.
- **Poor distance control:** Lack of consistent landing spot targeting AND/OR lack of a swing-length system. **Pelz's clock system (7:30 / 9:00 / 10:30 backswing positions, constant tempo) is the canonical fix — see "Pelz Wedge System."** Landing-zone drills handle the targeting half.
- **Wrong club selection:** Decision-making issue, not technique; introduce the "land and roll" framework AND the Pelz 4-Wedge thinking (gap by yardage, not by improvisation).
- **Deceleration through impact:** The single most common short-game fault and almost always fear-based. **Pelz calls this the killer of finesse wedges and prescribes the "dead hands" / quiet-wrists philosophy as the antidote — see "Pelz Wedge System → Dead Hands / Anti-Deceleration."** Decel and commitment failures are the same root expressed mechanically vs. mentally.
- **Leave it in the bunker:** Setup issue (too little loft, too steep); address open face, open stance, shallow entry. **See "Pelz Bunker Framework — The Splash Method" for the open-everything-and-accelerate protocol.**

**Go-to club around green:** Note the club named. If it's a single club (e.g., SW for everything), the player lacks variety — this is a 1-wedge system trying to do a 4-wedge job. Introduce bump-and-run with lower-lofted club and the Texas wedge (putter from off-green) as easy wins, and surface the Pelz 4-Wedge System for the structural upgrade.

---

### Section 5 — Putting

**Distance control vs. line priority (per TrackMan/research):**
- Distance control (speed) eliminates 3-putts. It is statistically more impactful than read accuracy for most amateurs.
- For lag putting weakness (3-putt zone), start with distance control drills before working on read.
- For short putting weakness (under 5 feet), focus is stroke consistency and face control at impact.

**Confidence score interpretation:**
- Under 5 feet: <5/10 = yips risk or significant face control issue; check grip pressure and stroke arc
- 6–15 feet: This is the make-or-break range for hdcp reduction; improving here pays dividends
- 25+ feet (lag): Most common distance control issue; teach landing zone targeting for lag putts

**Typical miss direction:**
- Consistent left or right miss = alignment or face-at-impact issue
- Short miss = deceleration; work on stroke length equality (back = through)
- Long miss = overswing; same stroke length fix
- No pattern = path and/or face inconsistency; start with fundamentals

**Struggle: green reading vs. distance control:**
- If distance control: ladder drills, 3-putt elimination focus
- If green reading: teach systematic pre-putt routine (approach from low side, read from low side of break, macro-read from 20-30 feet away, AimPoint awareness)
- If both: tackle distance control first (more strokes saved)

**Alignment tool use:** Players who "never" use a line should be introduced to one — it's a quick win for confidence and start line consistency.

---

### Section 6 — On-Course Behavior & Strategy (Vision54 / Human Skills)

**This section maps to Vision54's "Human Skills" framework:** how the player manages themselves physically, mentally, and emotionally on the course. It is as important as technical skill.

**Risk/reward management:**
- "Rarely" = course strategy is a major scoring leak; player likely attacks pins regardless of position
- Teach the 3-option decision model: (1) attack if high % shot, (2) miss to the fat side, (3) play away from trouble entirely
- Flag areas of course that consistently cause discomfort as data for on-course lesson design

**Pre-round strategy:**
- "Never/Sometimes" having a course strategy = opportunity to introduce the "playing to strengths" framework
- Teach club selection by landing zone, not target; introduce miss direction awareness before each shot

**Pressure performance:**
- What "shows up best under pressure" is a coaching asset — build the lesson plan around those strengths
- What makes them most uncomfortable = the emotional frontier; address with routine and commitment cues, not just technique
- Note: per Vision54, the technical skills a player has in practice must be transferable to course performance; this section identifies the transfer gap

**Most frequent on-course mistakes:**
- Classify as technical (execution failures) vs. strategic (decision failures) vs. mental (commitment failures)
- Each requires a different intervention; don't prescribe technique fixes for strategy problems

---

### Section 7 — Strengths & Goals

**Use stated strengths to:**
- Open the session on a positive note (anchor confidence)
- Build the lesson plan around what's already working where possible
- Cross-reference: do stated strengths align with the data in Sections 2–5? If not, that mismatch is itself valuable insight.

**Use stated weaknesses to:**
- Confirm your priority ranking from Sections 2–6
- Note whether the student's self-awareness is accurate or distorted (over-critical of a strong area, blind to a major leak)

**Goals:** Every coaching recommendation should be connected back to the stated goals. If the goal is "break 90" and the profile shows 3-putt frequency, frame putting work as the direct path to breaking 90.

---

## The Baselines and Markers Principle (Hugh's Coaching Foundation)

**Attribution:** This is the meta-principle that underpins all of Hugh's frameworks (Setup Reference, Ball Position Spectrum, Slice Protocol, Speed Framework, Impact Dynamics). Every reference below assumes this principle is in operation.

### The principle in one sentence

**Baselines and markers are diagnostic frameworks, not absolutes.** They tell you where the club, the body, and the swing components are in space — relative to the shot shape, body type, and speed the player presents with — so you can make better judgement calls about what to shift to improve impact.

### What this means in practice

- **Baselines and markers exist from P1 (setup) through P7 (impact) and beyond.** Every position from address through follow-through has reference markers Hugh uses to read what the player's body and club are doing. Numbers like "97° wrist angle at impact" or "284° lead-shoulder angle at address" are typical markers.
- **They are NOT prescriptions.** The job is never to force a player to a specific number. Different body types, swing speeds, and desired shot shapes all produce different "correct" markers for that specific player.
- **They ARE diagnostic tools.** When a player produces a particular ball flight, the markers tell you which component is upstream of the result — and which component to shift first.
- **The marker that needs to move is rarely the marker that hurts most to look at.** A scary-looking marker may be a perfect compensation for an upstream issue; fix the upstream issue and the scary marker resolves on its own. (See the Slice Protocol — the slicer's left-aimed shoulders, low handle, kicking right heel are all compensations for the open face. Don't chase markers; find the root.)

### How to use this principle when generating a dossier

When the questionnaire surfaces a swing characteristic that AI training data would treat as universally "wrong" (low handle, weak grip, head moving, narrow stance, etc.), **do not flag it as a fault by default.** Instead:

1. Ask whether the marker is a compensation for an upstream issue.
2. Ask whether the marker fits the player's body type, shot shape, and speed.
3. Only flag it as a fault if it is producing a measurably worse outcome AND no upstream cause is plausible.

This is the difference between mechanical AI coaching ("your handle is too low — raise it") and human coaching ("your handle is low because your right arm is high — fix the right arm first and the handle finds its right height").

### Cross-references

This principle is the meta-frame for:
- **Setup Reference — The Two-Line Template** (markers for where the ball can sit at address)
- **Ball Position Spectrum** (markers for the full draw/fade component package)
- **Impact Dynamics References** (markers for low point + neck strikes)
- **Slice Faults and Fixes Protocol** (markers for distinguishing primary faults from compensations)
- **Speed Framework** (markers for pressure shift timing, tempo, intent)

When in doubt about whether a player characteristic is a fault or a feature, return to this principle: **check the markers, then make a judgement call. Never default to "wrong."**

---

## Baseline Start Positions — Pelvis, Hips, Knees, Ankles (Three-View Diagnostic)

**Attribution:** Hugh's setup-position diagnostic for the lower body and pelvis. Applies the Baselines and Markers Principle (above) to the foundation of the address position. Hugh views every player from three angles — front-on, down-the-line, and behind — because each angle shows things the others can't.

### Driver caveat

The pelvis-horizontal baseline below applies to **shots off the ground (irons, wedges, hybrids on a fairway lie)**. **Driver setup is different** — pelvis tilted slightly (lead-side higher) is normal for driver because the strike is ascending. See **"Driver Framework — Tee Height and Angle of Attack"** for the full driver-specific setup and delivery baselines.

### Why three views matter

A player's setup looks different from each angle. The under-used view is **behind the player** — Hugh explicitly says coaches don't use this perspective often enough. The behind view shows tilts and side bends that are invisible from the front-on or down-the-line views, and tilts/side bends have an outsized impact on how the player can move during the swing.

**Camera setup for all three views:** same height as the camera used for down-the-line; aim at the middle of the player's lumbar spine. Consistent height across views is the prerequisite for comparing them honestly.

### View 1 — Front-on (face-on)

What Hugh is reading from this angle:

- **Pelvis line.** Draw a horizontal line through the pelvis. **Baseline: pelvis parallel to the floor.** Slight lead-pelvis-higher than trail-pelvis is acceptable and common. Players with back curvature may not be able to achieve perfect horizontal — physicality always over-rides the baseline.
- **Knee/leg line.** Draw a line from the **middle of the laces** up to the **knobbly bit on the pelvis** (the iliac crest / hip point) on both sides. The line should **cut through the kneecaps**, with the **ankle joints sitting parallel** to that line.
- **Foot flare.** Both feet turned out roughly the same amount. Hugh's range: **10–15° as the absolute maximum**, with physicality taken into account — some players physically can't achieve it.

### View 2 — Down-the-line

What Hugh is reading from this angle:

- **Alignment.** Knees, thighs, pelvis, feet, AND shins should all be **parallel to the line of play.** The shins parallel is a tell most coaches miss — feet can look parallel while shins are angled.
- **Balance.** Draw a straight line down from the **middle of the pelvis (the knobbly bit / iliac crest)** — that line should **cut through the ankle.** When pelvis-knobbly is over the ankle, the player is in balance.
- **Pelvis tilt / forward bend.** Draw a line through the **belt line.** The belt line should be **angled toward the floor** — that's the tilt that allows the upper body to sit in its proper standing-over-the-ball position.

#### Hugh's contrarian note on "butt line vs. heel line"

Many coaches teach that the player's butt line should be over (or just behind) the heels. **Hugh stays away from this baseline** because there is **no commonality across body types and clubs.** The butt-vs-heels metric drifts every time the player changes club length or you compare two body shapes. The pelvis-knobbly-over-ankle balance check (above) is more reliable across all body types.

When the questionnaire surfaces a "your hips should be back over your heels" type teaching the player has been given, treat it skeptically — it may not fit this player's physicality.

### View 3 — Behind-the-player (the under-used perspective)

What Hugh is reading from this angle:

- **The pelvis-to-ankle box.** Draw a box from the **outside of the pelvis straight down.** It should line up with the **inside of the ankles.** This is the model start position from behind.
- **Pelvis horizontal.** Hugh prefers the pelvis sat horizontally over the lead-pelvis-higher pattern. He considers horizontal "much more healthy" because the trail-hand-down-the-grip access is achieved through **side bend** rather than tilting the pelvis.
- **Tilt access.** When the player needs to get the trail hand down to the grip, that's done through **side bend through the lumbar spine** — not by dropping the trail hip / tilting the pelvis. Lateral side bend preserves the pelvis foundation.
- **Vertical alignment lines.** Middle of the **ankle → middle of the glute → cutting through the middle of the knee.** Same on both sides of the body. This three-point vertical line is the cleanest behind-view check.
- **Tailbone position relative to the legs.** Draw a vertical line down from the tailbone. **A fraction closer to the lead leg = pressure starting slightly under the lead leg** at address. This is Hugh's preference — start with a little weight already lead-side rather than 50/50 or trail-biased.

### The model start position summary (behind view, three-point checklist)

When generating coaching guidance based on setup, surface these three behind-view markers as the diagnostic shorthand:

1. **Pelvis horizontal to the floor.**
2. **Outside of pelvis corresponds with inside of ankles** (the box).
3. **Middle of ankle → middle of glute → cutting through the knee** (vertical alignment, both sides).

### How to use these markers in the dossier output

The questionnaire doesn't directly capture setup video — but it surfaces signals that should trigger an **on-lesson probe** for these markers:

**Trigger setup-marker probes when the questionnaire flags:**
- Balance problems on full swings
- "Falls off" or "loses footing" patterns
- Posture / back issues
- Inconsistent contact across the bag
- Heel/toe strike patterns (also see Impact Dynamics — Low Point Dimension 1)
- Power leaks / lack of distance with no obvious technique fault

**For these triggers, surface in the On-Lesson Probes section:**
> "Setup diagnostics from three views (Hugh's framework):
> - Front-on: pelvis horizontal? Foot flare ≤15° and balanced?
> - Down-the-line: knees/thighs/pelvis/feet/SHINS all parallel? Pelvis-knobbly directly over the ankle?
> - Behind: pelvis horizontal? Outside-of-pelvis to inside-of-ankle box? Tailbone slightly toward lead leg?"

**Cross-reference cluster:**
- This setup framework **upstream of** the Impact Dynamics References (Low Point Control + Shanks)
- This setup framework **sister to** "Baseline Start Positions — Arms, Hands, and Club" (lever system) and "Baseline Start Positions — Upper Body, Spine, Ribcage, Shoulders, Head & Neck" (upper body)
- This setup framework **upstream of** the Setup Reference Two-Line Template (which covers ball/club position) and the Ball Position Spectrum (which covers component packages)
- Together they form Hugh's complete setup diagnostic: **lower body** (this section) + **lever system** (arms/hands/club) + **upper body** (spine/ribcage/shoulders/head) + **ball/club position** (Setup Reference + Ball Position Spectrum)

### Coaching philosophy reminder

Per the Baselines and Markers Principle: these are **not absolutes.** Body type, mobility limits, age, and prior injuries all shift what "correct" looks like for a given player. The markers tell you what to LOOK at; the judgement call about whether to MOVE a marker comes from understanding the whole player, not just the diagnostic.

---

## Baseline Start Positions — Arms, Hands, and Club (Two-View Diagnostic)

**Attribution:** Hugh's setup-position diagnostic for the upper extremities — the **"lever system" of the golf swing** (Hugh's term). Sister section to "Baseline Start Positions — Pelvis, Hips, Knees, Ankles" above. Together they are Hugh's complete setup baseline: lower body + pelvis from one section, arms + hands + club from this one.

### Why the lever system matters

The arms, hands, and club are the **mechanical lever** that delivers the swing energy. The lower-limb baselines establish the **foundation**; the lever system establishes the **delivery mechanism**. Both have to be in baseline ranges or the swing has to compensate for one to make the other work — and compensations are leaks.

The reference player below is hitting a **neutral shot shape** (straight ball flight). Variations for fade or draw bias come from the **Ball Position Spectrum** (component package below) — but the markers in this section are the neutral baseline.

### View 1 — Front-on (arms, hands, club)

What Hugh is reading from this angle:

- **Arm rotation.** Both arms turned in approximately **135°** around their long axis (the pronation/supination dimension). 135° is the **middle of the range of motion** for both arms — a natural, tension-free position from which to grip the club. Neither arm is at end-range pronation or supination.
- **Trail-hand grip (right hand for a right-hander).** The **thumb-forefinger crease points roughly at the right ear** — Hugh's neutral position for the trail hand. Crease pointing well outside the right shoulder = strong-grip territory; crease pointing at the chin or inside the right ear = weak-grip territory.
- **Lead-hand grip.** The thumb-forefinger crease is a little bit **further outside** the trail-hand crease line. This produces a neutral-to-slightly-strong lead-hand position — natural and tension-free.
- **Ball position relative to sternum.** Marginally **ahead of sternum, behind lead shoulder.** This is neutral within the corridor defined by the Setup Reference Two-Line Template.
- **Shaft lean at address.** A **marginal amount of forward lean** — not aggressively forward, not vertical. This is the neutral baseline; fade vs. draw shifts the shaft-lean amount per the Ball Position Spectrum.

### View 2 — Down-the-line (the lever system)

What Hugh is reading from this angle:

- **Shaft direction line.** Draw a straight line directly up the shaft. It should point somewhere **between the belt buckle and the belly button**, depending on club, shot shape, and body type. (Per Ball Position Spectrum: belly-button = draw bias; just above belt buckle = neutral; vertical = fade bias.)
- **Arm and ribcage alignment.** Forearms parallel to line of play, upper arms parallel to line of play, ribcage parallel to line of play — **all three correspond.** This is the easy diagnostic for "is this player aimed where they think they're aimed."
- **Lead forearm vs. trail forearm stacking.** **Lead forearm sits just slightly above the trail forearm** in the down-the-line view. Not by much — just enough that you can see a little of the lead forearm above the trail one.
- **Arm hang.** Hugh wants the arms to hang **just outside of vertical** — about **5° outside vertical** is his target. Vertical itself is acceptable. **Arms hanging INSIDE vertical (closer to the body than vertical) is NOT acceptable** — Hugh's hard rule. He has not seen many good players achieve that pattern. If you see arms hanging inside vertical, this is a flag, not a feature.

### How to use these markers in the dossier output

The questionnaire doesn't capture setup video — but it surfaces signals that should trigger an **on-lesson probe** for these markers:

**Trigger arm/hand/club marker probes when the questionnaire flags:**
- Grip-strength concerns or grip-related shot tendencies
- "Strong grip" or "weak grip" self-diagnosis
- Arm tension at address (player reports tightness, gripping too hard)
- Posture problems (often correlates with arm hang inside vertical)
- Slice or hook patterns (grip + arm position are upstream of face control — see Slice Protocol Component 1: Face)
- Inconsistent strike pattern with no obvious lower-body cause

**For these triggers, surface in the On-Lesson Probes section:**
> "Setup diagnostics — arms, hands, club (Hugh's framework):
> - Front-on: arms ~135° in (mid-range pro/sup)? Trail-hand crease at right ear? Lead-hand crease slightly outside that? Ball marginally ahead of sternum + slight shaft lean (neutral) — or shifted per shot shape?
> - Down-the-line: shaft pointing belt-buckle to belly-button (per shot shape)? Forearms / upper arms / ribcage all parallel to line of play? Lead forearm slightly above trail forearm? **Arms hanging just outside vertical (5°) — never inside vertical?**"

The "arms hanging inside vertical" check is the **single highest-yield diagnostic** in this section because almost no good players do it; if you see it, fix it before doing anything else with arms or hands.

### Cross-reference cluster

This section is the **lever system** sister in Hugh's setup baseline framework:

- **Baseline Start Positions — Pelvis, Hips, Knees, Ankles** (lower body foundation)
- **Baseline Start Positions — Upper Body, Spine, Ribcage, Shoulders, Head & Neck** (upper body)
- **Setup Reference — The Two-Line Template** (where the ball can sit at address)
- **Ball Position Spectrum** (full draw/fade component package — including how shaft aim and forearm stacking shift away from neutral)
- **Slice Faults and Fixes Protocol** (Stage 1 Face fix uses grip and forearm rotation cues that build directly on these markers)

When a slicer is being diagnosed, the **arm-rotation pattern + grip neutrality** in this section is the upstream cause that the Slice Protocol's Component 1 (face) addresses. They are the same diagnostic from two angles.

### Coaching philosophy reminder

Per the Baselines and Markers Principle: physicality, mobility, and prior injury all shift what "correct" looks like for a given player. The 135° arm rotation, 5°-outside-vertical arm hang, and trail-hand-crease-at-right-ear markers are starting points for diagnosis — not absolutes the player must achieve. **The arms-hanging-inside-vertical exception is the only near-absolute** Hugh enforces in this section, because the data on good players is overwhelming.

---

## Baseline Start Positions — Upper Body, Spine, Ribcage, Shoulders, Head & Neck (Three-View Diagnostic)

**Attribution:** Hugh's setup-position diagnostic for the upper body — completes the setup baseline trilogy alongside "Pelvis, Hips, Knees, Ankles" (lower body) and "Arms, Hands, and Club" (lever system). All three sections together are Hugh's complete setup baseline.

### The standing-posture principle (read this first)

Hugh's central teaching point about upper-body setup: **the player should represent their standing posture as much as possible over the golf ball.** Humans move in space adopting their natural standing posture most of the time — spatial awareness is built around that posture position. The job at address is to **recreate the standing posture over the ball**, not to invent a new "golf posture."

Practical implications:
- **Natural spine curves** (thoracic curve one way, lumbar curve the other) should be **retained** at address — don't flatten them out.
- **The natural curve at the bottom of the neck** that the player has when standing up should be recreated over the ball.
- A player whose standing posture is rounded forward will be rounded forward at address; a player whose standing posture is upright will set up upright. Trying to override this with a "perfect" golf posture often creates more problems than it solves.

This principle is upstream of every marker in the section below.

### Driver caveat

Hugh's pelvis-horizontal baseline applies to **shots off the ground (irons, wedges, hybrids on a fairway lie)**. **Driver setup is different** — pelvis tilted slightly (lead-side higher) is normal for driver because the strike is ascending. See **"Driver Framework — Tee Height and Angle of Attack"** for the full driver-specific setup and delivery baselines.

### View 1 — Front-on (upper body)

What Hugh is reading from this angle:

- **Shoulders box.** Draw a box outside of the shoulders straight down — it should **hit the middle of the feet.** Shoulders narrower than middle-of-feet = the player is hunched in; wider than middle-of-feet = the player is sprawled out.
- **Head position.** Centered within the shoulder box. The head should be **on top of the shoulders, on top of the pelvis, on top of the knees** — vertical alignment all the way down.
- **Spine tilt away from target.** Spine should tilt **3–4° AWAY from the target** (for a right-hander, slightly toward the right). There is some scope to go a little more, but **alarm bells start ringing for Hugh past about 5–6°.** Excessive away-from-target tilt is a flag, not a feature.
- **Shoulder tilt.** Player will have some natural shoulder tilt because the trail hand sits lower on the grip than the lead hand. Hugh's reference player shows about **8°**. Hugh's hard ceiling: **don't let it exceed 10°.** Beyond 10° is over-tilted.
- **Head/neck alignment.** Draw a line through the **middle of the head down to the belt buckle** — it should **cut through the middle of the nose.** That tells you the spine is aligned neutrally from front-on (head not tilted away from the body's centerline).

### View 2 — Down-the-line (upper body)

What Hugh is reading from this angle:

- **Pelvis tilt at setup** (line through belt — established in Lower Limbs section).
- **Ear-to-pelvis-midpoint stack.** The player's **ear should line up with the midpoint of the pelvis**. The line connecting them should cut through the **middle of the rib cage** — confirms the spine is stacked vertically from pelvis to head when viewed down-the-line.
- **Standing posture over the ball.** Per the principle above — natural thoracic and lumbar curves preserved; natural neck curve preserved; nothing flattened or invented for "golf reasons."
- **Eye line parallel to line of play.** Hugh emphasizes this — eye line **plays a large role in dictating where and how the player moves.** A tilted eye line (one eye higher than the other) shifts how the brain orients the swing; when the eye line is off, the swing tends to follow.
- **Ribcage alignment.** Ribcage parallel-left, **matching the pelvis, matching the thighs, matching the knees.** Down-the-line check: every horizontal slice of the body lined up the same direction.

### View 3 — Behind-the-player (upper body, head, neck) — Hugh's emphasized view

Per the Lower Limbs section, Hugh again emphasizes: **the behind-the-player view is the most under-used perspective**, and it's the best angle for checking tilts, side bends, neck tilt, and head tilt — all of which directly dictate how the player can deliver the club.

What Hugh is reading from this angle:

- **Pelvis horizontal to the floor** (per Lower Limbs section — modulo physiological limits and the driver caveat above).
- **Spine alignment.** Draw a straight line through the **middle of the neck → middle of the thoracic spine → into the lumbar spine**, meeting the pelvis line. The whole spine is one stacked line from neck to belt.
- **Right-side bend (for a right-handed player).** A small amount of right-side bend is expected — it's what allows the trail hand to sit lower on the grip than the lead hand without dropping the trail shoulder unnaturally.
- **Trail shoulder slightly lower than lead shoulder.** The visible result of the right-side bend. Both should be present together; you should see them as a matched pair.
- **Ear line horizontal.** Draw a horizontal line through the ears — it should **cut through the same point of each ear on both sides** (ears level, head not tilted). Hugh emphasizes this matters for two reasons:
  1. **Movement.** A tilted head pre-loads a movement bias that compromises the swing.
  2. **Neck health.** Asymmetric loading on the cervical spine over thousands of swings is a long-term injury risk.

### The complete behind-view checklist

The cleanest behind-view summary across both this section and the Lower Limbs section:

1. **Pelvis horizontal** (lower limbs)
2. **Outside of pelvis aligned with inside of ankles** (lower limbs)
3. **Middle of ankle → middle of glute → middle of knee** vertical alignment (lower limbs)
4. **Spine straight line from neck through thoracic into lumbar**, stacked on horizontal pelvis (this section)
5. **Slight right-side bend with trail shoulder marginally lower** (this section)
6. **Ear line horizontal** (this section)
7. **Tailbone slightly toward lead leg** = lead-side pressure preference (lower limbs)

### How to use these markers in the dossier output

The questionnaire doesn't capture setup video — but it surfaces signals that should trigger an **on-lesson probe** for these markers:

**Trigger upper-body marker probes when the questionnaire flags:**
- Posture concerns ("I get rounded over the ball," "my coach said my back is too curved")
- Neck pain or stiffness during/after rounds (the ear-line and head-tilt diagnostics matter here)
- Swing-plane issues (often downstream of spine tilt + shoulder tilt)
- Sway/lateral-shift issues on full swings (often downstream of eye line not parallel)
- Power leaks with no obvious technique fault (under-tilted spine bleeds power)

**For these triggers, surface in the On-Lesson Probes section:**
> "Setup diagnostics — upper body (Hugh's framework):
> - Front-on: shoulder box hits middle of feet? Head centered? Spine tilt 3–4° away from target (NEVER more than ~6°)? Shoulder tilt ~8° (NEVER more than 10°)? Head-to-belt-buckle through middle of nose?
> - Down-the-line: ear lines up with pelvis midpoint through middle of ribcage? Standing posture preserved (natural spine curves intact)? Eye line parallel to line of play? Ribcage parallel-left matching pelvis matching thighs matching knees?
> - Behind: pelvis horizontal? Spine straight from neck through thoracic into lumbar? Slight right-side bend with trail shoulder lower? **Ear line horizontal (matters for both movement AND neck health)?**"

### Cross-reference cluster (the complete setup baseline)

This section completes Hugh's setup baseline framework alongside:

- **Baseline Start Positions — Pelvis, Hips, Knees, Ankles** (lower body foundation)
- **Baseline Start Positions — Arms, Hands, and Club** (lever system)
- **Setup Reference — The Two-Line Template** (where the ball can sit at address)
- **Ball Position Spectrum** (full draw/fade component package)

Together: lower body + lever system + upper body + ball position + bias package = Hugh's complete setup diagnostic.

### Coaching philosophy reminder

Per the Baselines and Markers Principle: physicality, mobility, and prior injury all shift what "correct" looks like for a given player. The 3–4° spine tilt, 8° shoulder tilt, head-centered, ear-line-horizontal markers are starting points for diagnosis — not absolutes the player must achieve. **The two near-absolutes Hugh enforces in this section are: spine tilt should never exceed ~6° away from target, and shoulder tilt should never exceed 10°.** Both are protective limits — past those numbers the player's swing has to compensate, and compensations leak strokes (and risk injury).

---

## Driver Framework — Tee Height and Angle of Attack

**Attribution:** Hugh's framework for driver setup and delivery. This is the section the placeholders throughout the skill have been pointing at — driver geometry is genuinely different from iron geometry and needs its own treatment.

### Hugh's contrarian position (read this first)

The golf-instruction industry has become **obsessed with hitting UP on the driver.** The conventional wisdom: maximum upward angle of attack + minimum spin = maximum carry. Hugh disagrees for most players.

**The data point that anchors his disagreement:** the PGA Tour average angle of attack with driver is about **1° DOWN.** These are the highest-speed players in world golf, and they've collectively concluded that a marginally downward strike gives them more **control** — and that control matters more than the extra carry from hitting up.

**The damaging belief Hugh wants to debunk:** *"Effective driving is about hitting up as far as you can and spinning as little as you can."* This is wrong for most players. It costs them sweet-spot consistency, which costs them more strokes than the lost carry would gain.

### The 95 mph threshold

Hugh treats 95 mph club speed as the dividing line.

**Players over 95 mph — target 0° angle of attack.**
- Acceptable range: **1–2° down or up**, as long as the player can control the sweet spot.
- **Beyond 2° up = outcomes become more variable.** This is Hugh's hard ceiling.
- A slight downward AoA (say -1° to -2°) is actively beneficial — see "The case for slight downward AoA" below.

**Players under 95 mph — a little upward AoA is genuinely beneficial.**
- Helps optimize carry where the player needs it most (at lower speeds, distance gain matters more than sweet-spot precision).
- This is the only group for whom the conventional "hit up on it" wisdom applies cleanly.

### Why 0° AoA matters at higher speeds (the geometry)

At a 45° downswing plane, with **0° angle of attack**, the **club path and swing direction match.** When path and swing direction match, the player can move the club around easily to hit different shot shapes — fade, draw, neutral — without re-engineering the strike.

When AoA goes upward (4–5°), **path and swing direction diverge.** The sweet spot now travels in-and-out through the impact zone instead of moving cleanly along the target line. The result: the player struggles to consistently middle the ball, and high-speed players with off-center strikes lose more than they gain in carry.

This is why Hugh's preference holds even though hitting up CAN max carry — the carry gain is more than offset by sweet-spot inconsistency at speed.

### Tee height — Hugh's preference

**"The worst thing to happen in golf in the last 20 years is the tall tee."** Hugh's words.

**The mechanism:** a tall tee places the ball too far above the center of gravity of the clubhead. The player intuitively delivers an upward AoA to meet the ball where it sits — and as the ball goes up, the AoA does too, and the path/swing-direction divergence problem follows.

**Hugh's tee height baseline: tee level with the sweet spot of the club.**
- At that height + 0° AoA on a 45° plane, the player strikes the **center of the face** naturally.
- The higher the tee creeps up, the more the swing direction shifts right of the club path → sweet spot travels in-and-out → strike degrades.

**Practical coaching action:** if a player is struggling with driver consistency, the FIRST thing to check is tee height. Lowering the tee to sweet-spot level often resolves the AoA + strike issues without any swing change.

### The case for a slight downward AoA at high speeds

Counter to common belief, hitting DOWN a fraction at high speeds has real benefits:

- **Stabilizes the sweet spot.** A descending strike forces a more consistent approach angle through the ball.
- **Creates a little more spin.** Spin is *desirable*, not *enemy*, at higher speeds — it keeps the ball in the air longer and helps the player manage curvature. The "minimize spin at all costs" mantra works against control.
- **It's what the Tour does.** The 1° down Tour average isn't an accident.

### The exception — when hitting up IS appropriate at high speeds

Hugh's exception, stated plainly: **if a high-speed player can hit up 4–5° AND consistently control the sweet spot, that's fine.** It will maximize carry.

But the qualifier is non-negotiable: **"high speed players need as much CONTROL as they have distance."** Hitting up only works if sweet-spot strike doesn't suffer. If the strike wanders, the carry gain is wiped out and then some.

### The flexibility principle (per Baselines and Markers)

**0° AoA is the TARGET, not an absolute.**

- ±1–2° around 0° is fine if the player can control the sweet spot.
- Past 2° up at high club speed is the line where outcomes degrade reliably.
- Slight downward bias (e.g., -1° to -2°) at high speed is often the optimal, not the compromise.

The little parameters give the player wiggle room — the point isn't to force a specific number, the point is to keep them inside the band where the strike stays clean.

### Diagnostic shorthand for the dossier output

**When to surface this framework in a dossier (gating rules):**
1. Player flags driver as their biggest issue (inconsistent strike, off-center, lost balls, low carry).
2. Player reports **distance well below tier benchmark** AND high handicap is not the primary cause.
3. Player explicitly mentions tee height or hitting up/down on the driver.
4. Player has Trackman/launch-monitor data showing AoA outside the ±2° band at >95 mph club speed.

**When NOT to surface:** a player who flags any other miss pattern as priority (slice, hook, short game, putting). Driver geometry work is high-leverage when triggered, but it's rarely the highest-priority leak for an amateur.

**For triggered players, the recommendation order:**
1. **Tee-height check first.** Lowering to sweet-spot level often resolves AoA without swing work.
2. **AoA measurement.** Get launch-monitor numbers. Target band: -2° to +2° (over 95 mph) or +1° to +5° (under 95 mph).
3. **Sweet-spot strike consistency.** Impact tape on the face. Strike quality is the metric, not raw AoA.
4. **Spin reframe.** If the player has been told "minimize spin," explicitly reframe: spin is desirable for control, not the enemy. Tour-average spin numbers, not minimum spin numbers, are the target.

**On-Lesson Probes block (when triggered):**
> "Driver diagnostic (Hugh's framework):
> - Tee height — level with sweet spot, or too high?
> - AoA on launch monitor — inside the ±2° band (>95 mph) or +1 to +5° (<95 mph)?
> - Strike pattern on face tape — center, or migrating toward heel/toe?
> - Player's belief about driver — has the 'hit up + minimize spin' framing been installed by a prior coach? If so, reframe."

### Cross-reference cluster

This framework is what the following sections reference as "driver-specific" or "driver framework":

- **Setup Reference — The Two-Line Template** (irons-only scope)
- **Ball Position Spectrum** (irons-only scope)
- **Baseline Start Positions — Pelvis, Hips, Knees, Ankles** (driver = pelvis tilted slightly, lead-side higher)
- **Baseline Start Positions — Upper Body** (driver = same caveat)
- **Increasing Club Speed Framework** (Component 1: Equipment — driver fit affects AoA control, complementary to this section)

### Coaching philosophy reminder

The "hit up max, spin min" belief is the most common driver miscoaching in the industry. When a player arrives with that framing already installed, **reframing it is part of the coaching work** — not an aside. Until they understand WHY 0° AoA + sweet-spot-tee-height produces better outcomes than the conventional approach, they'll resist the changes you ask for.

---

## Impact Dynamics Reference — Low Point Control (3 Dimensions)

Low point — the bottom of the swing arc — is the single most diagnostic concept in ball-striking. It exists in **three dimensions**, and most ball-striking misses come from the low point being off in at least one of them. Diagnose them in this order; never assume which dimension is the cause without checking the others.

| Dimension | What it controls | Off in one direction → | Off in the other direction → |
|---|---|---|---|
| **1. Lateral (in/out)** | Sweet-spot path relative to the player | Sweet spot AWAY → heel strike | Sweet spot TOWARD → toe strike |
| **2. Horizontal (target line)** | Where the divot starts relative to the ball | Behind ball → fat / heavy / chunked | Ahead of ball → thin / bladed (irons), pop-up (driver) |
| **3. Vertical (depth)** | How deep the club bottoms out | Too deep → fat from beneath, climbing up the face (looks thin), or shanks if extreme | Too shallow → thin / blade / topped |

**The misdiagnosis trap to memorize:** A vertically-too-deep low point can look exactly like a horizontally-behind low point — both produce a divot before the ball. Don't assume "fat = behind the ball" until you've ruled out vertical depth (deep gouge vs. shallow scrape). Treating a depth issue as a horizontal issue (or vice-versa) is the most common reason a "fix" doesn't stick.

### Dimension 1 — Lateral (In/Out): Heel vs Toe Strikes

This addresses the **lateral position of the sweet spot relative to the player** during the swing — and what that produces at impact.

**THIS IS THE DIMENSION AI MOST OFTEN GETS BACKWARD. The correct rule (memorize and never invert):**

- **Sweet spot moves AWAY from the player → HEEL strike.** The ball is now between the player and the sweet spot, so the ball contacts the heel side of the face.
- **Sweet spot moves TOWARD the player → TOE strike.** The opposite — the ball is now beyond the sweet spot from the player's perspective.

If any output ever flips this (e.g. "club moving away from the player produces a toe strike"), it is wrong. The toe is the FAR end of the club from the player. When the club's sweet spot travels farther away, the heel of the face is what crosses the ball line. Heel strikes result.

#### The four components that shift the lateral dimension

1. **Balance** *(most common cause)*. Address-position imbalance, or pressure shift during the swing.
   - Pressure shifting toward the **TOES** during the swing → moves the sweet spot AWAY from the player → **heel strikes**.
   - Pressure shifting toward the **HEELS** during the swing → moves the sweet spot TOWARD the player → **toe strikes**.

2. **Radius (vertical movement of the club).** Pulling the club out of the ground (lengthening the radius) introduces the heel of the club to the ball — sweet spot pulls toward the player but can also result in a toe strike depending on the pattern. Diagnostic: watch where the club bottoms out laterally relative to the address position.

3. **Posture change.** Standing up (early extension) or hanging back during the swing shifts the player closer to or further from the ball, moving the sweet spot in the in/out dimension. A "standing up" pattern typically pulls the sweet spot away from the ball.

4. **Release pattern.**
   - A **full release** (active rotation through impact) tends to take the heel toward the ball.
   - A **thrown / no release** (hands flipping early) tends to take the toe toward the ball.
   - **Important caveat:** this is not absolute. The radius of the swing is also being lengthened or shortened by the release — that itself pushes the heel or toe at the ball regardless of release type. Combinations matter.

#### Match-ups (Ryan's coaching framework)

These are not absolutes — they are common patterns where one component is being used to balance another.

- **Stand-up / heel-pressure player** (player who shifts pressure toward the heels or stands tall through impact):
  - An **early release** + **lengthened radius** can balance the pressure shift and posture change.
  - Counter-intuitive but effective when the alternative is constant heel strikes.

- **"Neiman-type" player** (player whose posture goes forward through the swing — a "covering" pattern):
  - **Hang the handle** to **shorten the radius** and bring the sweet spot back toward the player.
  - Or drag the club into impact and **turn very hard at impact** to bring the sweet spot back in.
  - Same logic in reverse if the posture goes the other direction.

#### Coaching philosophy (lateral)

There is no absolute way of doing this. The job is to find the **one component** that, when shifted, lets everything else perform. Investigate in this order:
1. **Balance** (address + dynamic pressure shift)
2. **Posture change** (early extension / standing up / covering)
3. **Release pattern** (full vs thrown)

Then look for the **match-up** that fits the player's existing tendencies rather than trying to overhaul multiple things at once. The point is rarely to eliminate a tendency — it is to find the partner tendency that compensates for it.

#### Diagnostic shorthand for the dossier output (lateral)

When the questionnaire surfaces consistent **heel strikes** as a miss pattern, the most likely root cause order is: balance (toes-pressure shift) → posture change (standing up) → release (over-release lengthening the radius).

When the questionnaire surfaces consistent **toe strikes**, the most likely root cause order is: balance (heels-pressure shift) → posture change (covering / forward shift) → release (under-release shortening the radius, or "hanging the handle").

Always investigate balance first. It is the cause in roughly two-thirds of cases — and it is also the cheapest to verify (a single Bosu/balance-board observation, or watching divot direction on consecutive swings).

### Dimension 2 — Horizontal (Target Line): Behind vs Ahead of the Ball

This is the dimension most coaches mean when they say "low point" without qualifying it. It controls where on the target line the club bottoms out — relative to the ball.

- **Low point behind the ball.** Club bottoms out before reaching the ball. With an iron this is fat / heavy / chunked. With a driver off a tee this can produce a high pop-up because the club is ascending too steeply through the ball.
- **Low point ahead of the ball.** Club bottoms out after the ball. With an iron this is the desired pattern — ball-then-turf. Pushed too far forward, it produces thin / bladed contact (the leading edge meets the equator of the ball).

#### Causes — low point behind

- Weight hanging on the trail side through impact (no pressure shift to the lead side)
- Hands releasing early (handle stops, head passes the hands)
- Trying to "lift" the ball into the air (chest hangs back, trail shoulder drops)
- Ball position too far forward in the stance (looks like a low-point fault but is really a setup fault)

#### Causes — low point ahead

- Excessive forward shaft lean / hands too aggressive
- Body racing the club (lead-side stall reverses; chest passes the ball before the club catches up)
- Ball position too far back in the stance

#### Diagnostic (horizontal)

Use a divot board, alignment-stick line on the ground, or wet/spray-painted strike pattern. Where the divot **starts** relative to the ball line is the answer — not where it ends. A divot that starts behind the ball and crosses through it is horizontally-behind, regardless of how deep it is.

### Dimension 3 — Vertical (Depth): How Deep the Club Bottoms Out

This is the dimension most often missed and most often misdiagnosed. The club bottoms out at some **depth** into the ground (or above the ground for a thin shot). The PGA Tour average is roughly **1.7 inches deep** for a 7-iron from the fairway. Significantly more than that — say 3 inches — is **vertically too deep**.

#### Too-deep low point produces

- **Hidden fat shots.** The ball is struck in the right horizontal location, but the club entered so deep that the divot starts behind the ball anyway. **This is the misdiagnosis trap** — easy to call this a "behind-the-ball" (horizontal) issue and try to move the low point forward, when the real fix is to make the swing shallower in depth.
- **Climbing up the face.** A very deep entry can cause the club to ride up the ball at impact — the result looks like a thin or topped shot even though the swing was steep. This is one of the cruelest misses because it feels like the opposite of what it is.
- **Shanks (neck strikes) when paired with lateral movement.** See the Shanks reference below.

#### Too-shallow low point produces

- **Thin / blade / topped contact.** The club never descends enough to reach the bottom of the ball; only the equator is struck.
- Common in players who try to "scoop" or "help the ball up."
- Also common in players who back up through impact (Dimension 2 cause that bleeds into Dimension 3).

#### Causes — too deep

- Excessive downward attack angle / steep swing plane
- Heavy lead-side pressure with a steep shaft delivery
- Hands too far ahead at impact combined with a steep entry

#### Causes — too shallow

- Backing up / weight hanging on trail side
- Early release ("flipping the wrist") to add loft
- Pulling up out of posture (early extension is also a Dimension 1 driver)

#### Diagnostic (vertical)

Look at **divot depth and shape** on a fairway lie or off a divot board. A shallow scrape that takes no turf = vertically too shallow. A 1–2" divot with a clean entry = good. A deep gouge that's 3"+ at its deepest, especially one with a "trough" shape rather than a "bacon strip" = vertically too deep.

### Cross-dimension warning

These three dimensions interact constantly. A few common interactions worth knowing:

- **A vertically-deep low point that also drifts laterally outward → shank.** See the Shanks section below.
- **A horizontally-behind low point usually has a vertically-shallow profile too** — both are produced by hanging back on the trail side. Fix the weight shift and both improve at once.
- **A horizontally-ahead low point with vertically-too-deep depth produces deep divots starting AT the ball** — a high-quality strike but a turf-management problem; common in low handicaps who turn aggressively.
- **The misdiagnosis trap (worth repeating):** a vertically-too-deep low point produces a divot that starts behind the ball even though the swing's bottom-out point is in the right horizontal spot. Don't reach for "move the low point forward" until you've checked depth.

When in doubt: check **horizontal first** (where does the divot start relative to the ball), then **vertical** (how deep is it), then **lateral** (heel/toe via impact tape or face-tape).

---

## Impact Dynamics Reference — Shanks (Neck Strikes)

A "shank" is when the ball is struck on the **hosel / neck** of the club — the rounded inside corner where the shaft meets the face. It is the most confidence-shaking miss in golf and one of the most misdiagnosed.

**Terminology note:** "Shank" is technically a misnomer — there is no part of the club called a "shank." The correct teaching language is **"hit it on the neck"** or **"neck strike."** Use this language with players to depersonalize the miss and break the fear cycle around the word "shank." Anything that comes out of this skill that uses the word "shank" should pair it with "(neck strike)" at least once on first reference.

### The two mechanical causes

A neck strike requires the sweet spot to have moved AWAY from the player by even more than a heel strike requires. In other words, **a shank is a heel strike taken to its extreme** — driven by either of two patterns (and almost always both together):

1. **Vertical low point too deep (Dimension 3).** When the club enters the ground 3+ inches deep instead of the ~1.7 inch baseline, the effective lie angle flattens and the heel/neck of the club rotates closer to the ball line. A very deep entry can produce a neck strike on a swing that would otherwise have been a heel strike — or even a square strike.

2. **Lateral shift away from the player (Dimension 1, extreme version).** Whatever causes a heel strike — pressure to the toes, standing-up posture change, over-active release lengthening the radius — taken to its extreme, will move the sweet spot far enough away from the player that the ball meets the neck instead of the heel.

In practice, **a shank is almost always a combination of both.** A player who normally heel-strikes but who suddenly shanks has usually added a vertical-depth issue on top (got steeper, dug harder) or a postural shift (early-extended more aggressively).

### Common misdiagnoses — do not make these

- **"Closed-face shank."** This phrase is a common miscoaching. A closed face does not produce a neck strike; it produces a hook or pull. If a player is shanking, do not try to fix the face — fix the lateral and depth control of the low point.
- **"You're standing too close to the ball."** Sometimes true, but more often the address position is fine and the dynamic move (toes pressure + posture change + steep entry) is what closes the gap during the swing. Address position is the last thing to change.
- **"Slow down."** Tempo is rarely the cause and slowing down often makes the postural fault worse because the player gets tentative.

### How to diagnose

1. **Watch the divot direction and depth first.** If divots point left-of-target with a deep gouge, vertical depth + lateral shift are both off.
2. **Apply impact tape.** A neck strike will leave a mark right at the inside edge of the heel — sometimes off the face entirely, on the hosel itself.
3. **Rule out the heel strike pattern first.** Same root causes; the shank is just the more extreme version.

### Coaching approach

1. **Don't call it a shank.** Use "neck strike" or "hosel strike."
2. **Address the most common combination:** balance (toes pressure) + steep depth. Drills that move pressure to the heels and shallow the entry usually solve both at once.
3. **Avoid face-direction work** until lateral + vertical are clean. Trying to fix a shank with face cues is the fastest way to entrench it.
4. **Re-introduce the word "shank" only after the pattern is gone.** Until then, it is a fear-trigger word — not a coaching word.

---

## Setup Reference — The Two-Line Template (Ball Position Geometry)

**Inspiration credit:** This is Ryan's adaptation of the grid concept from Mark Blackburn's *The Coaching Code*. The template is simpler — three lines on the ground that any player can step into and physically hit from. Most coaching tools are still under-explored visually; this one translates a complex principle (setup dictates impact geometry) into something a student can see and feel in seconds.

**Core philosophy:** There is no fixed ball position that works for every player. Setup dictates impact geometry — and every player is trying to do something different. The template gives the **parameters** that keep a setup functional regardless of swing type, then lets ball position do work the swing would otherwise have to do.

### The template — three lines on the ground

1. **Ball-to-target line.** Straight line running from the ball toward the target.
2. **Front line.** Drawn perpendicular to the ball-to-target line, directly under the player's **lead shoulder.** This represents the **low point of the swing.**
3. **Back line.** Drawn perpendicular, directly under the player's **sternum.** This is the back reference for ball position.

The ball can sit **anywhere between the back (sternum) line and the front (lead-shoulder) line.** Where exactly, depends on swing type, shot type, and desired ball flight.

### How ball position adjusts ball flight

| Ball position within the corridor | Effect on ball flight |
|---|---|
| **Closer to the BACK (sternum) line** | More **draw** bias — steeper angle of attack, path shifts more in-to-out |
| **Closer to the FRONT (lead-shoulder) line** | More **fade** bias — shallower angle of attack, path shifts more out-to-in |

**Key number to remember:** Moving the ball within this corridor — **with the full component package moving with it** (handle height, shaft aim, trail-arm orientation; see **Ball Position Spectrum** below) — can change club path by **up to 4–5° without changing the swing at all.** That's enough to neutralize a soft slice or a soft hook before any swing work begins. Ball position alone won't get you the full effect; the components have to move together.

**Scope note:** Everything in the Setup Reference and Ball Position Spectrum below is for **shots off the ground (irons, wedges, hybrids on a fairway lie)** — shots that require a descending blow. **Driver geometry is different** (ball forward, ascending strike) and is covered in **"Driver Framework — Tee Height and Angle of Attack"**.

### The functional-setup test

A setup is functional **as long as both of these are true at the same time:**

- The **front of the ball** is behind the lead-shoulder line, AND
- The **back of the ball** is in front of the sternum line.

If both pass, the geometry will work. Outside that corridor, the player is fighting their own swing — contact is a guess and direction is random.

### Build-on-top layers (templates added once ball position is set)

The three-line ball corridor is the **base**. Once ball position is settled, additional layers can be drawn on top of it to teach increasingly specific pieces of the swing. **Add layers one at a time** — the player should be consistently matching the previous layer before the next is introduced. If they're still missing the layer below, the layer above just becomes noise.

#### Layer 1 — Shaft-lean diagonal

Draw a diagonal line from the ground up through where the **shaft** should sit at address. Top-down visual the player can match every time. Two common build-ons:

- **Draw setup with forward shaft lean.** Ball back (closer to the sternum line), shaft leaning toward the target. Many players who try a draw setup hang the handle too far back; the diagonal line gives them an unmissable visual reference for where the grip should be at address.
- **Fade setup.** Ball forward (closer to the lead-shoulder line), with the shaft angle drawn for them to match.

The player can stand above the template and self-check before every rep. That self-check loop is the part that compresses the time it takes to groove a new setup — the player isn't waiting on the coach to confirm position.

#### Layer 2 — Sweet-spot path arcs

Draw two **curved lines on the ground either side of the ball**, tracing the arc the clubhead's **sweet spot** should travel through impact (roughly P5 → P6 → P7). These arcs give the player a physical line to "match" with the clubhead through the strike zone.

**What this layer teaches:**
- **Backswing geometry (P1 → P2).** The player can see where the sweet spot needs to track on the way back, not just guess at it.
- **Through-impact path / exit direction.** The exit direction of the club becomes visible — useful for coaching an in-to-out exit (draw bias), a more neutral exit, or an out-to-in exit (fade bias).
- **Feel + visual together.** Many players have an intellectual concept of "swing path" but no visual reference for it; the arcs give them the picture and the feel in the same rep, which is the combination that sticks.

**When to add this layer:** After the player can consistently match the Layer 1 shaft-lean diagonal at address. Adding the arcs to a player whose setup is still drifting just dilutes both layers.

**Coaching cue:** *"Match the arc"* beats *"swing more from the inside."* The arc IS the inside, drawn in chalk where the player can see it.

#### Layer 3 — Foot outlines (stance width + foot flare lock)

Once the player's address position passes the ball-corridor and shaft-lean checks, **draw the outline of their shoes on the ground.** This is the "save your work" layer — it captures the exact setup the coach just dialled in so the player can recreate it instantly and consistently for every rep.

**What it locks in:**
- **Stance width** — the gap between the feet
- **Foot flare angle** — how much the lead foot and trail foot are turned out
- **Distance from the ball** — toe-line to ball-line distance
- **Toe-line direction** — alignment to the target

**When to add this layer:** As soon as the address position passes Layers 1 and 2 (ball position correct, shaft-lean correct). It costs nothing to draw and pays off the moment the player tries to rebuild the setup from memory.

**Why it matters for groove sessions:** When a player is trying to ingrain a new setup, the cost of drift between reps is huge — every "wrong" rep counts against the new pattern. The shoe outline removes the guesswork. The player steps into the outline and they're already 90% set up before they even think about the club.

#### Layer 4 — Hand path arc

Draw a **curved line under the hands** to show where the hands should travel back and through the swing. The player now has TWO simultaneous visual references on the ground: the sweet-spot arc (Layer 2) and the hand-path arc (this one).

**What this layer teaches:**
- **Where the hands travel back and through** — most players have a verbal idea of "low and slow" or "inside" but no spatial reference for it.
- **Prevents early-takeaway issues** — club moving in strange directions in the first 2 feet (lifted, sucked inside, pushed outside). The hand-path line gives the player something concrete to match instead of a verbal cue.
- **The relationship between the two arcs.** The hand-path arc and the clubhead (sweet-spot) arc **relate to each other but are different sizes** — the clubhead arc is LARGER because the clubhead travels further than the hands during the swing. They share direction but differ in magnitude.

**Coaching note on the two-arc relationship:** When introducing both arcs together, emphasize that the **hand-path is the smaller arc INSIDE the sweet-spot arc.** This prevents the common confusion where a player tries to match the clubhead arc with their hands and ends up over-rotating, casting, or losing structure. Hands ride the inner arc; clubhead rides the outer arc; same direction, different scale.

**When to add this layer:** After the sweet-spot arc (Layer 2) is consistent. This is the layer that often unlocks players who "feel" the swing intellectually but can't translate it physically — once their hands have a chalk line to follow, the takeaway stops being a mystery.

### Coaching applications by miss pattern

- **Slicer with weak grip and out-to-in path:** Move ball back toward the sternum line BEFORE changing the swing. The path shift can be 3–5° from setup alone — sometimes enough to neutralize the slice without grip work, which is the most invasive change you can ask for.
- **Hooker who over-corrected a slice:** Move ball forward toward the lead-shoulder line. Same logic in reverse.
- **Inconsistent contact / two-way miss:** Re-check that the ball is between the two lines. A ball that has drifted outside the corridor (too far back or too far forward) makes contact a guess — fix the corridor before chasing anything else.
- **Driver vs. iron:** The lines stay in the same relative position; the ball moves within the corridor. Driver = closer to the lead-shoulder line (forward, ascending strike). Mid-iron = middle of the corridor (descending). Wedge = closer to the sternum line (descending, lots of compression).

### Why this lands with players

Four reasons it teaches faster than a verbal cue:

1. It's **drawn on the ground** — visual + physical, not a verbal cue that has to be re-translated swing by swing.
2. The player can **stand above and self-check**, so the rep doesn't depend on the coach watching every swing.
3. It explains **why** ball position matters using geometry, not feel — players who reject "feel" coaching will accept the math of a 3–5° path change.
4. **It's built up in layers** — ball corridor → shaft-lean diagonal → sweet-spot arcs → foot outlines → hand-path arc. Each layer is added only when the previous one is consistent, so the player is never trying to manage too many cues at once. The foot outlines are the "save your work" layer; the arcs add path references on top of a locked-in setup.

### Diagnostic shorthand for the dossier output

When the questionnaire surfaces a slice, hook, or two-way miss as the dominant pattern, **always recommend the setup-template check before any swing-change recommendations.** Frame it as: "Before we try to change the swing, let's see what your existing swing produces from a different setup." This protects the student from over-coaching and often resolves the miss in one session.

When the questionnaire surfaces inconsistent contact (chunks and thins from the same lie), the setup-template check is the **first** thing to try — both misses are commonly produced by a ball that has drifted outside the functional corridor.

---

## Ball Position Spectrum — Full Component Package (Hugh's Detailed Framework)

**Attribution:** Hugh's detailed companion to the Setup Reference. The Setup Reference establishes the corridor; this section gives the **full component package** that travels with each ball position — handle height, shaft aim, trail-arm orientation, and the resulting ball-flight bias.

### Scope — irons off the ground only

**This framework is for shots off the ground that require a descending blow** (irons, wedges, hybrids on a fairway lie). It does NOT apply to driver, which uses a different geometry (ball forward, ascending strike). See **"Driver Framework — Tee Height and Angle of Attack"** for driver-specific ball position and AoA guidance.

### The spectrum endpoints (recap from Setup Reference)

| Endpoint | Position |
|---|---|
| **Furthest forward** | Front of ball in line with the **lead shoulder** |
| **Furthest back** | Back of ball in line with the **sternum** |
| **Middle ball** | The reference point (neutral) — shaft pointed just above the belt buckle, forearms square / parallel-left |

The **path difference between the two endpoints can be up to 4–5°** with no swing change — purely from ball position and the components that move with it. (This is Hugh's number; the previous "3–5°" estimate in the Setup Reference is conservative.)

### Forward ball position (closer to the lead shoulder) — FADE BIAS

Moving the ball toward the lead shoulder pulls a complete component package with it:

- **Path:** works toward LEFT (out-to-in) → fade bias
- **Angle of attack:** REDUCED (shallower)
- **Shaft lean:** REDUCED → shaft more **vertical**
- **Handle of the club:** **LOWER**
- **Trail forearm:** sits **HIGHER** than the lead forearm (down the line) — the right arm "starts to sit more on top"

The whole package together is the fade-bias setup, not just the ball position alone. If the player moves the ball forward but keeps the handle high and the trail arm tucked, the fade bias doesn't materialize — the components have to move together.

### Back ball position (closer to the sternum) — DRAW BIAS

Moving the ball toward the sternum pulls the opposite component package:

- **Path:** works toward RIGHT (in-to-out) → draw bias
- **Angle of attack:** INCREASED (steeper)
- **Shaft lean:** INCREASED (more forward)
- **Handle of the club:** **STOOD UP HIGHER** — at about the **belly button** level
- **Trail forearm:** sits **UNDERNEATH** the lead forearm (down the line) — the right arm folds into the side more naturally

### Middle ball position — NEUTRAL

- **Shaft aim:** pointed just **above the belt buckle**
- **Forearms:** square / parallel-left to the line of play
- **Path:** approximately neutral (square to target)

### Shaft-aim shorthand (use this with the player)

| Bias | Shaft points at | Handle position |
|---|---|---|
| **Draw** | Belly button | Stood up higher |
| **Neutral** | Just above belt buckle | Middle |
| **Fade** | More vertical (toward chest / chin) | Lower |

This is the single fastest verbal cue Hugh uses to communicate the full setup. Once the player can self-check shaft aim against belly button vs. belt buckle vs. vertical, they can rebuild the entire bias package on their own.

### Coaching applications

- **For a slicer trying to hit a draw:** move ball back toward sternum AND raise the handle to belly-button height AND let the trail arm fold underneath. All three together. Draw bias should produce up to 4–5° of right-path shift before any swing change.
- **For a hooker trying to hit a fade:** move ball forward toward lead shoulder AND drop the handle AND let the trail arm sit on top. Same logic in reverse.
- **For a player whose ball flight is inconsistent:** check that the component package is internally consistent. Mixed signals (back ball + low handle, or forward ball + high handle) confuse the swing and produce two-way misses. Pick a bias and commit the whole package to it.
- **Watch for partial commits:** the most common failure is moving ball position without moving the handle and trail arm. Player thinks they've changed something; actually they've changed nothing.

### Cross-reference

This framework is the detailed companion to the **Setup Reference — The Two-Line Template**. Use Setup Reference for the visual/teaching template (lines on the ground); use this Ball Position Spectrum for the full component package that defines what the ball position actually produces.

The Slice Protocol's Stage 2 path fix relies on this framework — when "shifting the path closer to the target" or "moving the start position to the right," the player isn't just moving the ball; they're moving the whole component package.

---

## Grip Framework — Building, Adjusting, and Pre-Building Ball Flight

**Attribution:** Hugh's complete grip framework. Three distinct jobs woven together — building a grip from scratch, the "spinning shaft" hack for changing curvature without a grip rebuild, and using arm/handle position to dictate start direction once grip and curvature are set.

Hugh's coaching philosophy on grip: *"We're all aware of how important the grip is — we need to get better at coaching the subtlety and the nuance of a great grip."* The visual aids (lines drawn on the glove) are how Hugh makes that subtlety teachable and self-correctable when the coach isn't there.

### The three jobs of grip work

This framework covers three related but distinct coaching jobs. Pick the right one for the player in front of you:

1. **Build a grip from scratch** (beginners, or rebuilding an established player with a fundamentally bad grip)
2. **The spinning-shaft trick** — change curvature WITHOUT changing the grip (for established players who resist a grip rebuild but need a different ball flight)
3. **Grip + curvature + start direction chain** — once grip and curvature are set, use arm and handle position to dictate where the ball starts

Most player visits use Job 2 or 3, not Job 1. Job 1 is reserved for players whose grip is genuinely broken at a fundamental level, because rebuilding a grip is invasive coaching that takes weeks to settle.

### Job 1 — Building the grip from scratch

Use **lines drawn on the lead-hand glove** as visual aids the player can self-check. The lines stay on the glove between sessions and remove the guesswork.

#### Glove-drawing system

- **Blue line across the middle knuckles** of the lead hand → indicates where the **rear/middle of the grip** sits when the club is held. This line is the cue that puts the club in the **fingers, not the palm**.
- **Horizontal line across the thumb-and-forefinger junction** → indicates where the thumb and forefinger meet and stay in contact (the V).
- **Arrow pointing straight up from the thumb-forefinger contact point** → indicates which direction the V points relative to the body. Hugh's neutral baseline: **arrow pointing at the right ear / right shoulder** for a right-handed player.
- **Blue dot on the top knuckle of the lead thumb** → marks a key pressure point that the trail hand will meet.
- **Blue dot in the middle of the lifeline pad of the trail hand** (the soft pad beneath the trail thumb) → marks the trail-hand pressure point that meets the lead-thumb-knuckle dot.

#### Lead-hand stage (first)

1. Place the **rear/middle of the grip across the blue knuckle line** — this puts the club in the fingers (not the palm).
2. Wrap the fingers around the grip.
3. Confirm the thumb-forefinger V points at the **right ear** (or wherever Hugh's adjusted baseline is for that player).

**Why fingers, not palm:**
- **Stability** — the club is more securely held in the fingers.
- **Access to wrist movement** — radial and ulnar deviation are unavailable from a palm-grip; the swing has to compensate elsewhere.

#### Trail-hand stage (second)

1. **The pressure point meeting:** the blue dot in the trail-hand thumb pad (lifeline) goes ON TOP of the blue dot at the top of the lead-hand thumb knuckle. This pressure point is critical for **loading and unloading the shaft through impact** — the energy transfer at the bottom of the swing depends on it.
2. **The trigger finger:** the **middle knuckle of the trail-hand index finger** wraps around the **side of the grip**. This is the second key pressure point for loading/unloading.
3. **The last three fingers of the trail hand**, particularly the **pinky**, secure the grip. The pinky pressure point is often under-coached.
4. **Heel-pad-of-lead-hand to top-of-grip contact** — the lead hand's heel pad sits over the top of the grip, completing the seal.

#### Flexibility note (per Baselines and Markers)

The above is the **baseline starting point**, especially for beginners and grip-rebuild work. With established players, Hugh has more flexibility — adjustments away from neutral are fine if they're producing the desired ball flight. Don't enforce the baseline if the player's existing grip is producing acceptable outcomes.

### Job 2 — The Spinning Shaft Trick (curvature without grip change)

**The hack:** if the player has a **reasonably sound baseline grip** (hands positioned appropriately relative to each other and to the upper torso), you can create different ball-flight curvatures **just by twisting the club in their hands before they grip it** — without rebuilding the grip itself.

Most players resist grip changes (*"I don't want to change my grip"*). This trick lets you change ball flight without that resistance.

**The mechanic:**
- **Twist the club so the leading edge angles closed relative to the shaft** → presets **left curvature (draw)**.
- **Twist the club so the leading edge angles open relative to the shaft** → presets **right curvature (fade)**.

**Hugh frames this as:** *"where the face is sitting relative to the shaft."* The hands haven't moved; the club has been rotated within them at address. The result: built-in curvature without any grip rebuild.

#### When it works

- Player's baseline grip is reasonably sound (hands relative to each other, hands relative to torso).
- You want to change ball flight without an invasive multi-week grip rebuild.

#### When it does NOT work

- Player's grip is fundamentally broken — Job 1 applies, not Job 2.
- The desired ball flight requires a magnitude of curvature that shaft-spinning alone can't produce.

#### Coaching applications

- **Slicer who resists grip change:** spin shaft so leading edge presets left (draw) curvature. Combined with arm-position adjustments (Job 3), the slice often resolves in a single session without grip work.
- **Hooker who resists grip change:** spin shaft the opposite way to preset fade curvature.
- **Hugh's general instruction:** *"Generally, I'm going to be asking players to go this way [draw direction] because the majority of people tend to miss it to the right."* Slice is the dominant amateur miss, so the draw-spin is the more common application.

### Job 3 — Grip + Curvature + Start Direction (the complete chain)

Once grip is set (Job 1) and curvature is built in (naturally OR via Job 2 spinning), the third job is **dictating where the ball STARTS** — independent of the curvature direction.

#### The complete sequence

1. **Build the GRIP** (Job 1, or accept existing if reasonably sound).
2. **Build the CURVATURE** (Job 2 if needed; otherwise it's natural to the player's pattern).
3. **Build the START DIRECTION** (this section) using arm position and handle position.

#### Draw setup — arm position

When curvature is pre-built for a draw, the ball would naturally start LEFT (because the face is closed relative to neutral). To start it RIGHT (so it can draw back to target):

- **Lift the hands** at address (handle higher).
- **Sit the trail arm beneath the lead arm** — down-the-line view shows lead forearm above trail forearm.
- **Cue for the player:** *"Point the face where you want the ball to STOP."* The face still has the built-in left curvature, but the sweet-spot is now positioned to start the ball right of target.

#### Fade setup — arm position

Mirror image of draw setup:

- **Move ball forward** in stance (toward lead shoulder — see Ball Position Spectrum).
- **Handle and shaft close to vertical** at setup.
- **Handle BACK (lower)** with hand back — preset start position is left of target.
- Combined with the built-in fade curvature, ball starts left and fades back to target.

#### The meta-principle

**Setup dictates impact geometry.** The grip + curvature + start-direction chain can produce dramatically different ball flights **at setup alone, without any swing change.** This is the key Hugh point:

> *"Pretty much every player I coach, I have to do some work on their start position. Why? Because setup dictates impact geometry. We can create curvature, and we can create start line in a million different ways, at setup alone."*

#### The big claim

> *"If you took your typical slicer, put the club in like this, got them to establish the grip, and set it up here, they would be able to push-draws really quickly."*

A typical slicer can hit push-draws within a session if grip + curvature + start direction are set correctly at address — no swing change required. This is the practical proof of the framework.

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Beginner / no-handicap player** → Job 1 (build grip from scratch) is automatic. Recommend grip-building as part of the lesson plan.
2. **Slice or hook as dominant miss pattern** → Jobs 2 + 3 (spin shaft + setup). Pair with Slice Protocol — this framework is the underlying mechanic that Slice Protocol Component 1 (Face) and the Setup Reference both build on.
3. **Player explicitly mentions grip** in the questionnaire (asks about it, reports a "weak grip" or "strong grip" diagnosis from a prior coach, mentions discomfort in the hands).
4. **Inconsistent contact across multiple clubs** — often a grip + setup root cause when no other obvious leak is present.
5. **Junior Elite Academy player** — at least once during onboarding, run a full grip audit before any swing work.
6. **Grip-perfection question on the questionnaire** (forthcoming — see task #42) — once the questionnaire asks "have you perfected the grip?", that answer becomes a direct trigger.

**When NOT to surface:** experienced player whose grip is producing acceptable outcomes and whose questionnaire flags other priorities first. Grip work is invasive — don't recommend a rebuild for a player who doesn't need one.

**Recommendation language for the dossier:**
- For Job 1 work: *"Grip rebuild is the priority. Use the lead-hand glove-drawing system (knuckle line + thumb-forefinger arrow + pressure-point dots) — student leaves with a marked-up glove they can self-check between lessons."*
- For Job 2 work: *"Don't rebuild the grip — use the spinning-shaft trick to preset draw curvature. Combine with the Slice Protocol Stage 1."*
- For Job 3 work: *"Setup chain — grip already sound; preset draw curvature; then arm position (hands up + trail forearm beneath lead forearm) to start ball right of target."*

**On-Lesson Probes block (when triggered):**
> "Grip diagnostic (Hugh's framework):
> - Lead hand: club in fingers or palm? Knuckle line position? Thumb-forefinger V pointing at right ear?
> - Trail hand: thumb pad pressure on lead-thumb knuckle? Index finger middle knuckle on grip side? Pinky pressure?
> - Curvature pre-built (face-shaft relationship)? Or neutral?
> - Arm position dictating start direction (per Job 3)?"

### Cross-reference cluster

This framework is **upstream of**:
- **Slice Protocol Component 1 (Face)** — uses pre-closed-face grip + forearm rotation; the spinning-shaft trick (Job 2) is the underlying mechanic Component 1 builds on.
- **Setup Reference + Ball Position Spectrum** — the start-direction work in Job 3 uses the Ball Position Spectrum's full component package (handle height, shaft aim, trail-arm orientation).
- **Baseline Start Positions — Arms, Hands, and Club** — the trail-hand-crease-at-right-ear baseline is a simplified version of this framework's full grip-building system.

### Companion: Pressure Points Framework

Hugh's **Pressure Points Framework** is the next section below — it provides:
- A 10-second lead-hand grip checkpoint (verifies the grip is correctly placed in the fingers + supported by the fat of the palm)
- Three isolation drills (lead-hand last three fingers, trail-hand index finger, trail-hand thumb pad) using a midline + low-point-line setup
- Ball-hitting progression and the universal element (pressure shift to lead side) that all the drills require

The Grip Framework above teaches HOW to hold the club; the Pressure Points Framework teaches WHICH PARTS of that grip do the work, with drills to develop feel. Use them as a pair.

---

## Pressure Points Framework — Grip Checkpoints and Feel Drills

**Attribution:** Hugh's companion framework to the Grip Framework above. The Grip Framework covers HOW the hands hold the club; this framework covers WHICH PARTS of the grip do the work, **a fast checkpoint to verify the lead hand is correctly placed**, and a **graduated drill program** to develop the feel of each pressure point in isolation before combining them in a normal swing.

### The pressure points (recap with expansion)

Four key pressure points across both hands:

1. **Lead-hand last three fingers** — security and finger-dominant grip stability.
2. **Lead-hand heel pad** — sits on top of the grip, completes the seal.
3. **Trail-hand index finger middle knuckle** — pressure on the side of the grip; one of the two key loading/unloading points.
4. **Trail-hand thumb pad (lifeline)** — pressure on top of the lead-thumb top knuckle; the second of the two key loading/unloading points.

This framework gives you drills to isolate and develop feel for each one.

### The lead-hand grip checkpoint (fast verification)

Use this 10-second check to verify a lead-hand grip is correctly placed in the fingers, supported by the fat of the palm:

1. Player establishes their lead-hand grip on the club.
2. Lift the last three fingers OFF the grip.
3. Lift the thumb OFF the grip.
4. **The club should remain stable, supported by the fat of the palm alone.**

**Read the result:**
- **Stable, no slip** → grip is correctly seated. Last three fingers + thumb are *additions* to the support, not the primary support.
- **Club slips, especially upward** → grip is too high in the fingers, NOT seated under the fat of the palm. Rebuild per Grip Framework Job 1.

This checkpoint is the fastest filter before deciding whether grip work is needed.

### The midline + low-point-line setup (the foundation for all drills below)

Draw two parallel lines on the ground:

- **Midline** — directly under the player's spine at address.
- **Low-point line** — a few inches **ahead of midline** (toward the target).

Every drill below uses this setup. The job is to **strike the low-point line** consistently — NOT the midline, NOT behind midline. Striking ahead of midline forces:

- **A pressure shift to the lead side** through transition (otherwise low point is behind, not ahead).
- **The trail wrist to retain shape** through impact (otherwise the club bottoms out behind the ball).
- **Grip pressure stays on the key pressure points** (otherwise the club twists out of position).

This is why the drills work: they're using ground-strike location as the visible feedback signal for invisible internal mechanics.

### Drill 1 — Lead-hand isolation (last three fingers + heel pad)

**Setup:** player establishes lead-hand grip, then **takes thumb AND forefinger OFF the grip.** Now only the last three fingers + heel pad are active.

**The drill:** make swings (no ball at first) and strike the **low-point line** consistently.

**What it teaches:**
- **The last three fingers are doing real work** — most players have never felt this in isolation.
- **Pressure shift to the lead side is REQUIRED** to strike ahead of midline. Without it, the club bottoms out at midline or behind.
- **Grip stability under the fat of the palm** through the swing — the club shouldn't twist or slip.

If the player can't strike the low-point line with this drill, they don't have functional last-three-finger pressure. Don't move on.

### Drill 2 — Trail-hand index finger isolation (the trigger finger)

**Setup:** lead hand OFF entirely. Trail hand: **last three fingers OFF the grip.** Player is now holding the club **like a pencil** between trail-hand thumb and forefinger only.

**The drill:** same midline / low-point-line setup. Strike the low-point line.

**What it teaches:**
- **The trail index finger middle knuckle pressure point** in isolation — this is the pressure that loads and unloads the shaft through impact.
- **Pressure shift to the lead side** through transition (same universal element).
- **Trail-arm structure retained** — without the lead hand to compensate, the trail arm has to do its job.

If the player can strike the low-point line with this drill, the trail-index pressure point is functional.

### Drill 3 — Trail-hand thumb-pad isolation (the lifeline pressure)

**Setup:** establish a normal full grip first, THEN remove ALL trail-hand fingers from the grip. Only the **trail-hand thumb pad (lifeline) pressing against the lead-thumb top knuckle** remains as the trail-hand contribution.

**The drill:** same midline / low-point-line setup. Strike the low-point line.

**Critical follow-through checkpoint:**
- **Trail-hand fingers are still off the grip** at the end of the swing.
- **Pressure on the lead-thumb knuckle is maintained** throughout.
- **Trail wrist retains shape** (cock / extension) at follow-through — visible from down-the-line view.

This is the hardest of the three drills because the player has to retain a pressure point with NO finger contact at all. It's also the most diagnostic — if a player can do this drill cleanly, their trail-hand pressure mechanics are excellent.

### Ball-hitting progression (apply drills to real shots)

Once the player can do the dry drills consistently, apply them to actual ball strikes. **Critical rule: start SMALL.** Little shots, not full swings. The drills become much harder with a ball in the way.

**Setup for ball-hitting drills:**
- Same midline + low-point-line markings.
- **Ball positioned between midline and low-point line** (closer to one or the other depending on shot shape preference).

**Three ball-hitting drills mirror the three dry drills:**

1. **Lead-hand drill with ball** — thumb + forefinger off, hit small shots, strike low-point line.
2. **Trail-hand index-finger drill with ball** — like a pencil, hit small shots, strike low-point line.
3. **Trail-hand thumb-pad drill with ball** — fingers extended off, only thumb-pad pressure, hit small shots, strike low-point line.

**Bonus drill: trail-hand-only full shots.** Lead hand fully off. Hit small shots with trail hand alone. Same checkpoints — pressure shift to lead, trail-arm structure retained, club finishes in a controlled position. This is the most demanding ball-hitting drill in the framework and also the most diagnostic.

### Combining back into a normal swing

After the player has mastered the drills in isolation:

- **Make little swings** — retain a shorter swing length so the player isn't fighting too many variables.
- **Watch the checkpoints**, especially in follow-through (trail wrist shape, pressure points still maintained).
- **Gradually expand swing length** only as the checkpoints stay clean.

The point of the drills isn't to play golf with thumb-and-forefinger-off grips. The point is to BUILD THE FEEL of each pressure point so that when the normal grip returns, the pressure points are doing their work without conscious effort.

### The universal element across all drills

**Pressure shift to the lead side is required for every drill in this framework.** Without it:
- Low point sits at midline or behind.
- Pressure points cannot be retained through impact.
- The club twists out of position.

This connects directly to:
- **Speed Framework Component 4 (Pressure Shifts)** — Hugh's #1 differentiator between high-speed and low-speed players. These drills teach the same pressure shift at the grip level.
- **Slice Protocol Combined Drill (Feet Together)** — both isolate the upper-body pressure work by removing lower-body interference.
- **Impact Dynamics — Low Point Control (Dimension 2: Horizontal)** — these drills are the most direct way to teach "low point ahead of ball" through hand mechanics.

### Coaching philosophy notes

Hugh's emphasis: **all of these drills are extremely difficult, particularly with a golf ball.** Use lots of **dry drills** to get the player accustomed to the pressure points, the feel of the club moving, and striking the ground BEFORE introducing a ball.

Don't rush. The drills are pressure-point training, not swing training. The internal feel is the deliverable; ball flight comes later.

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player has grip issues but doesn't need a full rebuild** — Pressure Points drills are the right intervention (Grip Framework Job 1 is for full rebuilds).
2. **Player flags low-point control issues** (chunked shots, fat shots, can't compress the ball) — these drills are the most direct way to fix it through grip mechanics.
3. **Player has slice or hook with grip-related root causes** — pair this framework with Grip Framework Job 2 (spinning shaft) and Slice Protocol.
4. **Player flags weak grip strength or "I can't feel the club"** — the isolation drills build pressure-point awareness directly.
5. **Player struggles with consistency across the bag** — often a pressure-point inconsistency masquerading as a swing problem.
6. **Junior Elite Academy player** — at least one session of pressure-point drill work as part of skill development.

**When NOT to surface:** experienced player with no grip-related symptoms. Pressure-point drill work is high-value but invasive — don't recommend if there's no grip-related leak in the player's profile.

**Recommendation language for the dossier:**
- *"Run the Pressure Points framework lead-hand checkpoint first — 10 seconds, tells you whether grip rebuild is needed (Grip Framework Job 1) or whether pressure-point isolation drills are the right path."*
- *"Drill program: Lead-hand isolation (Drill 1) → Trail-hand index finger (Drill 2) → Trail-hand thumb pad (Drill 3). Dry first, ball second, normal swing last."*
- *"Pressure shift to lead side is the universal element. If the player can't shift, none of these drills will work — fix the pressure shift before the drills."*

**On-Lesson Probes block (when triggered):**
> "Pressure Points diagnostic (Hugh's framework):
> - Lead-hand grip checkpoint: take thumb + last three fingers off — does the grip stay stable on the fat of the palm?
> - Trail-hand pressure points present? (Index finger middle knuckle on grip side, thumb pad on lead-thumb knuckle.)
> - Pressure shift to lead side present at transition? (Required for all drills.)
> - Trail-wrist shape retained at follow-through?"

### Cross-reference cluster

- **Grip Framework** (sister section) — provides the building blocks; this framework provides the feel work.
- **Slice Protocol — Feet-Together Drill** — body-isolation companion to these hand-isolation drills.
- **Speed Framework Component 4 (Pressure Shifts)** — same lead-side pressure shift principle, different application layer.
- **Impact Dynamics Reference — Low Point Control (Dimension 2)** — these drills are the direct teaching tool for horizontal low-point-ahead-of-ball.
- **Setup Reference — The Two-Line Template** — the midline / low-point-line setup is conceptually parallel (lines on the ground as a teaching frame).

---

## Slice Faults and Fixes — Coaching Protocol

**Attribution:** This protocol is adapted from Hugh's slice-fix process (the British coach whose teaching Ryan has integrated into his own framework). The structure, ordering, and core principles are Hugh's; the wording here is Ryan's plain-English coaching voice. **Part 1 covers face fixes, path fixes, the lateral-pressure-shift principle, and the two integration drills.** Additional parts will be added as more material is shipped.

### The diagnostic baseline (start every session here)

A slice — excessive left-to-right curvature for a right-handed player — is **clubface too open relative to club path at impact.** Nothing else. Not tempo, not "coming over the top" by itself, not equipment. The face is open to the path.

Typical slicer numbers: face near zero (target line), path 12–14° left of that. The ball curves because the face is way open relative to the path.

**At impact, you can see this with the naked eye:** look at the angle between the shaft and the leading edge of the club. If there's a clear angle (leading edge tilted left of where the shaft is pointing), the face is closed to the path — good. If the leading edge looks square or right of the shaft, the face is open to the path — that's the slice geometry.

### Why face FIRST, not path (the most important rule in this protocol)

Coaches get seduced by the path number. The path is 14° left, so the instinct is "fix the path first." **Don't.** Here's why:

If the face is at 0 and the path is at -14, and you "fix" the path by shifting it to -7, the face hasn't moved — but the relative angle between face and path is now LESS closed (or MORE open). **The ball will start further right and curve the same amount.** You haven't fixed the slice — you've sent it deeper into the right trees. The player walks away with a worse outcome despite a "better" path number.

The right order is: **face to path FIRST, then path to target.** This is non-negotiable. Every other step in this protocol assumes face has been addressed first.

### The 4-stage process

1. **Face → Path.** Bring the clubface closer to the path. Player will hit strong left shots — this is the desired outcome.
2. **Path → Target.** Once face is closer to path, shift the path itself closer to the target line (less left).
3. **Lateral pressure shift in transition.** Build the swing principle that lets the rib cage stay closed longer through transition, supporting both face and path.
4. **Integration drills.** Feet-together (and its progression) plus the alignment-stick-outside-the-ball constraint, used together to lock in the new pattern.

### The verbal coaching frame (use this with the player)

Explicitly tell the player at the start of the session: **"We're going to learn to hit it left before we can straighten it up."** This frame is critical — it pre-arms the player for the strong-left ball flight that's coming, so they don't panic when they see it. Without this frame, players abandon the change the moment they see a hook because their entire identity as a slicer is built around "the ball goes right."

What to point out as positive feedback signals while the player is hitting strong-lefts:
- **More ball speed** (the closed face compresses the ball better)
- **More penetrating flight** (less spin)
- **The ball can actually curve left at all** (many slicers have never felt this in their lives)

These signals tell the player the change is working — even though the ball is missing left of target.

### Stage 1 — The Face

The first job is bringing the face closer to the path.

#### Lever 1: Pre-close the face, then grip (the spinning-shaft mechanic)

- Have the player **stand up, hold the club in front of them, and turn the leading edge to the left.** Then take their grip on the closed face.
- Demonstrate the relationship: with the face closed at address you can already see the right-to-left curvature potential — purely from "wiggling the club in the hands."
- This is the first concrete step that gets the player to understand "how to hit it left."
- **This IS the spinning-shaft trick from the Grip Framework (Job 2).** See the Grip Framework section above for the full mechanic and when it applies vs. when a full grip rebuild is needed instead.

#### Lever 2: Forearm orientation (the bigger long-term lever)

The forearm orientation at address controls how much face rotation the player has access to through impact. Look at where the forearms point:

- **Lead arm:** if the inside of the lead glove hand points toward the camera (toward the target line / away from the player's body), the player has nothing to help close the face. Rotate the lead arm INTERNALLY (so the inside of the glove rotates toward the body) — this gives the player access to face rotation.
- **Trail arm:** if the trail arm has turned in toward the body (palm rotated down, "weak" right hand), same problem — nothing to help close the face. Rotate the trail arm EXTERNALLY (palm rotates more upward) to give access to face rotation.

This forearm change often does more long-term work than the closed-face grip alone. Address it before going to swing changes.

#### The slicer's body-shape profile (what to look for)

Common patterns that travel together with an open face:
- **Shoulders aimed well left** (compensating aim — trying to start the ball left of where they think it'll end up)
- **Very low handle at address** (forces the right arm into a weak position)
- **Right heel kicking out through impact** (part of the move to swing everything left to square the face)

These are not independent faults — they are **compensations for the open face.** Don't try to fix them individually. When the face moves toward the path, most of these compensations relax on their own.

### Stage 2 — The Path (shift path closer to target)

Once the face is closer to the path and the player is hitting strong lefts, the next step is to **shift the path closer to the target** (reduce the leftward path number toward 0).

The foundational principle: **start position pre-determines impact geometry.** The setup the player takes at P1 (address) constrains every movement option that follows. If the path is going to change, the start position has to give the player access to the new movement.

#### The path-fix sequence

This follows Hugh's coaching hierarchy: **self-solve before constraints.**

1. **Build the start position first.** Use the Setup Reference Two-Line Template + foot outlines + shaft-lean diagonal to create a P1 that gives the player access to a more rightward path (the appropriate movement options). Specifically check: arms, handle height, forearm structure (from Stage 1), chest structure. If any of these is still in slicer-default, fix it BEFORE asking for any swing change.
2. **Ask the player to self-solve.** "Can you shift the start line more to the right without changing your start position?" Give them room to find the movement on their own. Players often arrive at the correct path faster when they aren't being constrained.
3. **Add constraints only if self-solve doesn't land** (see drill below).

#### Path-fix constraint drill — Alignment stick OUTSIDE the ball

Place an alignment stick on the ground **just outside the golf ball** (on the far side from the player, parallel to the target line). The player hits balls without clipping the stick.

**What it teaches:**
- Encourages the club to approach impact from **inside the target line** (in-to-out).
- Visual reminder: if the player throws the club out-to-in (their slicer default), they'll **clip the stick** — immediate feedback.
- For better players, place the ball **very close to the stick** to reduce the margin for error and sharpen the feedback.

**The critical caveat — only use this drill on top of a great start position.** If the player is still in slicer-default at address (covering to the right, handle down, right arm high, chest aimed left), don't add this constraint. Even if they achieve the task and miss the stick, the ball will sail off into the right trees because the open-face geometry hasn't been addressed. **Fix the start position first; then add the stick.**

### Stage 3 — Lateral pressure shift in transition (swing principle)

The **rib cage opening too early in transition** is one of the deeper causes of an OTT path. A swing principle that helps: **lateral pressure shift toward the target during transition.**

- Pressure shifting toward the lead foot during transition (not after impact) helps **keep the rib cage closed longer**, which delays the rotation that produces an out-to-in path.
- This is added once Stages 1 and 2 are partially in place. It is a swing change — don't reach for it until setup and face have been worked.

### Stage 4 — Integration drills

Once face and path have each been moved individually, integrate them with these two drills.

#### Drill A — Feet Together (with progression)

**Setup:** Player stands with their feet touching, hits half-to-three-quarter swings.

**What it isolates:** Hands, arms, and club. The lower body is taken out of the equation, which forces the player to feel the pull-and-throw of the club through impact rather than throwing the chest at the ball.

**What the player feels and learns:**
- The **pull and throw element** — pulling the club down through impact rather than throwing it from the top.
- **Pulling helps hit down on the ball** AND naturally shifts the path more to the right (in-to-out for a right-hander).
- Removes the pattern of **throwing the chest at the ball** — one of the biggest causes of an out-to-in path in slicers.
- **Quietens the trail (right) hip and heel** and encourages lateral motion through impact rather than spinning out.

**Critical rule:** The player must **keep both feet on the floor throughout the shot.** Coming up onto the toes or rolling off the feet defeats the drill — the whole point is to isolate the upper-body sequence by removing the ability to push from the ground. Once the right heel kicks out, the slicer-pattern is back.

**Progression once feet-together is consistent:**
- 25% stance width (small step apart, feet still flat)
- 50% stance width (still flat)
- 75% stance width (still flat)
- Full stance (still flat)

The player must **keep the feet flat on the floor at every stage.** As soon as the right heel starts kicking out again, drop back a step and rebuild.

#### Drill B — Alignment-stick-outside-ball constraint (from Stage 2)

Use Drill A and Drill B in the same session — Drill A to feel the new path delivery, Drill B as the visual constraint that confirms it.

### The closing principle (state this to the player out loud)

**"Slicing comes from the player trying to move everything left to square the face. We have to get the face in line first; THEN we can shift the bottom line of the swing to produce functional shots."**

This single sentence reframes the entire slicer's body of compensations as a chain of consequences from one root cause (open face). Once the player understands that the low handle, the left shoulders, the kicking right heel, and the OTT path are all responses to the open face — not independent faults — they stop trying to "fix the swing" and let those compensations dissolve as the face moves.

### Diagnostic shorthand for the dossier output

When the questionnaire surfaces a slice as the dominant miss pattern, recommend this **four-stage ladder, one stage per session** (not all at once):

1. **Setup-level check first** — Setup Reference Two-Line Template (ball back toward sternum line) for an immediate 3–5° path neutralization without any swing change.
2. **Stage 1 — Face fix.** Closed-face grip; forearm rotation (lead internal / trail external) if more closing rotation is needed. Verbal frame: "we're going to learn to hit it left before we can straighten."
3. **Stage 2 — Path fix.** Build the start position FIRST (Setup Reference layers); then self-solve; then alignment-stick-outside-the-ball constraint. Never add the stick on top of a slicer-default start position.
4. **Stage 3 — Lateral pressure shift in transition** for the rib-cage-closed-longer principle.
5. **Stage 4 — Integration.** Feet-together drill with the 25% → 50% → 75% → full progression; feet flat throughout.

Feedback signals to track session-to-session: ball speed up (face closer to path) → strong-left shots (face moved) → pulled draws (path starting to neutralize) → straight ball or controlled draw (face + path both functional). Each visible step is the indicator the previous stage worked.

### Coaching hierarchy (referenced framework)

Hugh's broader **coaching hierarchy** governs the path-fix sequence above: **self-solve before constraints, every time.** This deserves its own dedicated section once Ryan ships the supporting material; for now, treat it as the rule that constraints (sticks, gates, headcovers) come SECOND, never first. They are tools for players who can't self-solve once the start position is right, not the default starting point.

### What's coming in later parts

Part 2+ of this protocol will cover additional slice fixes (e.g. body-sequencing detail, specific fault-finder cues for stuck-OTT players, on-course slice management strategies). Section will be appended as content arrives.

### Companion: Altus Out-to-In Path Framework

For path-specific issues that persist after the face has been addressed, see the **Altus Out-to-In Path Errors** framework in the next section. It complements this protocol with a Red Flags → Top Plays diagnostic-and-intervention model that maps specific causes (alignment / depth / rotation / hand-path / over-rotation) to specific drills.

---

## Out-to-In Path Errors — Altus Performance Framework (Red Flags + Top Plays)

**Attribution:** Altus Performance Framework. Ryan is an Altus Performance Certified coach. This framework uses Altus's structured "Red Flags → Top Plays" diagnostic-and-intervention model, focused specifically on **out-to-in (OTT) path errors** — the path component that produces slice ball flight when the face is open relative to the path.

### Framework Selection Rubric (Hugh's Slice Protocol vs. this Altus framework)

Both frameworks address slice / OTT path. They are **complementary, not competing.** Pick based on the player's specific issue:

**Use Hugh's Slice Faults and Fixes Protocol when:**
- The player profile shows slice as the dominant pattern AND face hasn't been addressed yet
- You need the complete face → path → integration sequence
- The player needs the verbal frame ("we're going to learn to hit it left first")
- The path issue is downstream of the open face (most common)

**Use this Altus OTT Path framework when:**
- Hugh's face fix has been worked AND the path is still OTT
- The player has a specific, identifiable backswing / transition / downswing cause for the OTT path (matches one of the 4 Red Flags below)
- You need a path-specific drill matched to a specific mechanical cause
- The path is the standalone problem, not downstream of a face issue

**When using BOTH:** Hugh as primary protocol, then reference one specific Altus Top Play (the noodle, opposite-side obstruction, or Justin Rose drill) as the drill for the matched red flag. **Do not run both protocols in full sequence on the same player in the same dossier.**

### The Altus opening principle (matches Hugh's "face first" rule)

Altus's first move on a slice is the same as Hugh's: **solve the face first.** When you solve the face (close it toward the path), the path often adapts to neutral on its own — the body reorganizes around a more square face. This is where this framework starts every time.

**But it's not always enough.** When the path stays OTT after the face has been addressed, that's when this framework's Red Flags + Top Plays come in.

### The Red Flags — diagnose the cause first

Altus identifies four primary causes of an OTT path. Diagnose them in this order (address → backswing → transition → downswing):

#### Red Flag 1 — Body alignments too far left at address

Any segment of the body open at address pulls the path with it.

- **Feet too far left** of target line
- **Hips too far left**
- **Ribcage too far left**
- Any one of these (or all three) and the path will follow the alignment

This is the first place the eyes go. Cheap to fix, biggest immediate return.

#### Red Flag 2 — Not enough depth in the backswing

If the hands don't get deep enough on the way back, there's no inside path to swing on coming down. Causes:

- **Too much outside takeaway**
- **Too much arm lift** (no rotation, just lifting the club)
- **Under-rotation** of the body (next red flag is the deeper version of this)

#### Red Flag 3 — Under-rotated in the backswing

Tied directly to Red Flag 2 but framed at the body level:

- Body isn't really rotating
- Trail (right) hip not getting out of the way
- No trunk rotation
- Without rotation, the hands can't get deep enough to deliver from the inside

#### Red Flag 4 — Hand-path shifts too far OUT in transition

A player can get to a great top of backswing AND STILL produce an OTT path if the transition shifts the hand path outward.

- The butt of the club shifts out over the toes during transition
- From there, the only place to go is left
- Often invisible without video — the top looks fine, the strike goes left

#### Red Flag 5 — Downswing rotation too open, too early

Less common in average players, more common in better players:

- The amount or rate of rotation has been increased
- The pelvis and trunk get open relative to the target line too early in the downswing
- The club gets kicked out as the body opens
- The result: a left path

### The Top Plays — match the drill to the red flag

#### Top Play 1 — The transition noodle (block the OTT shift)

**For:** Red Flag 4 (hand path shifts out in transition).

**Setup:** Place a swim noodle (or alignment stick / pool noodle) on the OUTSIDE of the swing path during the downswing. The player's hand path has to swing INSIDE the noodle to clear it.

**Bonus benefit:** the presence of the noodle on the outside also encourages more depth to the backswing — easier to miss the noodle on the way down if you've gotten depth on the way up.

**What it teaches:** physically blocks the OTT transition shift, forcing the player to feel a more in-to-out delivery.

#### Top Play 2 — Amplify the error (push them MORE outside)

**For:** Red Flag 4 (hand path good at the top but shifts out in transition).

**Setup:** Push the player even MORE in the OUT direction during transition than they normally go.

**What it teaches:** by amplifying the error to its extreme, the player feels the OPPOSITE sensation — they have to keep the lead arm loaded and create arm/hand depth on the way down to recover. The exaggeration makes the corrective feel obvious.

**Why it works:** "Feel vs. real" — exaggerating the bad gives the player the contrast needed to feel the good.

#### Top Play 3 — Obstruction on the OPPOSITE side (force under-plane delivery)

**For:** Red Flag 1, 2, or 3 (alignment, depth, or rotation issues producing OTT path).

**Setup:** Place an obstruction on the opposite side from Top Play 1 — on the INSIDE of where the OTT path wants to go through. Use either a high obstruction (alignment stick at chest height) or a low one (something on the ground).

**What it teaches:** to miss the obstruction, the player has to swing UNDER the plane — they have to feel the **mass of the clubhead BEHIND the hands** at delivery, which is the opposite of an OTT delivery.

**Variations:** can be used high, raised even higher, or on the ground depending on which dimension of OTT delivery needs the most attention.

#### Top Play 4 — The Justin Rose Drill (delayed rotation)

**For:** Red Flag 5 (over-rotation in the downswing).

**Setup:** Place a rod (alignment stick) through the belt loops of the player as a visual reference for trunk/pelvis rotation. Justin Rose famously uses this on the range.

**What it teaches:** the player feels their **trunk and pelvis stay CLOSED** while the arms lower down. They shift LATERALLY toward the target without unwinding the upper body. The big rotation through the ball happens LATER, not earlier.

**The result:** the rotation gets delayed long enough to let the club come down on plane instead of getting kicked out by an early opening.

### Diagnostic flow (how to actually use this framework)

When a player presents an OTT path:

1. **First, confirm Hugh's face fix has been addressed.** If face hasn't been worked, the path may resolve on its own — go to Hugh's Slice Protocol Stage 1 first.

2. **If face has been worked AND path is still OTT, run the Red Flags diagnostic in order:**
   - Address (alignment) → backswing (depth) → backswing (rotation) → transition (hand path shift out) → downswing (over-rotation)

3. **Match the drill to the red flag** — don't dump all 4 Top Plays on the player at once:
   - Red Flag 1 (alignment) → fix at address, no drill needed (just align)
   - Red Flag 2/3 (depth/rotation) → Top Play 3 (opposite-side obstruction) primarily
   - Red Flag 4 (transition shift) → Top Play 1 (noodle) or Top Play 2 (amplify error)
   - Red Flag 5 (over-rotation) → Top Play 4 (Justin Rose drill)

4. **One drill per session.** Per the Altus order-of-operations philosophy, structured problem solving means picking the matched intervention, not throwing the whole playbook at the player.

### Altus coaching philosophy notes

Altus emphasizes:

- **Order of operations matters** — diagnose in sequence (address → backswing → transition → downswing), don't skip ahead
- **Structured problem solving over guessing** — Red Flags identify the cause; Top Plays are the matched intervention
- **Match the ingredient to the matchup** — different players with the "same" OTT path have different causes; the diagnostic identifies which cause
- **Build a coach's playbook** — over time, the coach develops pattern recognition for which red flag presents in which player profile, expanding the toolkit
- **This is foundational, not exhaustive** — Altus has a broader ball-striking problem-solving framework; this OTT path piece is one component of it

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player has a clear OTT path issue** that has persisted through Hugh's face fix work, OR
2. **Player profile contains specific OTT-cause indicators** (e.g., "I aim left and the ball still goes right," "I can't stop coming over the top," history of working on the face without resolving the path), OR
3. **Junior Elite Academy player or tournament-track player** with documented OTT pattern that needs a structured diagnostic-driven fix.

**When NOT to surface:**
- Player is mid-protocol on Hugh's Slice Protocol — let that workflow finish first
- Player has slice but face hasn't been worked yet — face fix first, this comes later if needed
- Player has bigger leaks (driver disasters, putting catastrophe, short-game disaster) competing for priority

**Recommendation language for the dossier:**
- *"OTT path persists after face work. Red flag diagnostic: [identified cause]. Matched drill: [Top Play X]."*
- *"Don't run all four Top Plays. Match one drill to the cause and let it land before adding another."*

**On-Lesson Probes block (when triggered):**
> "Altus OTT diagnostic flow:
> - Body alignments at address — feet, hips, ribcage all square or open?
> - Backswing depth — hands getting deep, or outside/lifty takeaway?
> - Backswing rotation — trail hip clearing, trunk turning?
> - Transition — hand path staying inside, or shifting out over the toes?
> - Downswing — pelvis/trunk staying closed long enough, or opening too early?"

### Cross-reference cluster

This framework is the path-specific complement to:

- **Hugh's Slice Faults and Fixes Protocol** — face-first sequence; this Altus framework picks up where Hugh's path stage leaves off
- **Setup Reference + Ball Position Spectrum** — the alignment red flag is upstream of all of this; setup baselines should be confirmed before path drills
- **Baseline Start Positions — Lower Limbs / Upper Body** — alignment and rotation diagnostics live in the setup baseline framework too
- **Pressure Points Framework** — the "lateral shift toward target without unwinding" in Top Play 4 (Justin Rose drill) is the same pressure shift principle the Pressure Points drills isolate

### Future Altus content

This is the first Altus framework in this skill. As Ryan ships more Altus content (in-to-out path errors, low-point depth control, club-face delivery, wedge play, short-game problem-solving), each will be added as a clearly-attributed Altus section with its own Red Flags + Top Plays + selection rubric vs. the equivalent Hugh framework.

---

## Open Face Errors — Altus Performance Framework (Red Flags + Top Plays)

**Attribution:** Altus Performance Framework. The face component of the slice / right-miss problem — ball starts right of target and may curve further right.

### Framework Selection Rubric (Hugh's Slice Protocol vs. this Altus framework)

Both frameworks address open-face / right-miss issues. The selection rule:

**Use Hugh's Slice Faults and Fixes Protocol when:**
- The player profile shows slice as the dominant pattern AND you need the complete face → path → integration sequence
- The player needs the verbal frame ("we're going to learn to hit it left first")
- Hugh's closed-face grip + forearm rotation fix is the right-sized intervention (most amateurs)

**Use this Altus Open Face framework when:**
- The face issue is the standalone problem (path is acceptable)
- You need a structured Red Flag diagnostic to identify WHICH cause of the open face is dominant (grip, ball position, backswing-face orientation, lag/handle lead, or mass shift)
- The drills here (suitcase grip, swing-guide / tee face awareness, the buddy resistance drill) match the player's specific fault better than Hugh's general fix
- Player is more advanced (some red flags here, like excessive lag / handle lead, are elite-player issues)

**When using BOTH:** Hugh as primary (face-first sequence), then reference one specific Altus Top Play as the matched drill. Don't run both protocols in full sequence.

### The Red Flags — diagnose the cause first

Altus identifies five primary causes of an open-face / right-miss. Scan them in order:

#### Red Flag 1 — Grip too weak

Most common cause. Two visual cues:

- **Face-on view:** you can see a lot of the **palm side of the lead hand**, and a lot of the **top of the trail hand**.
- **Down-the-line view:** the lead arm presents UNDERNEATH the trail arm at address (the rotation of the hand affects the forearm, which affects the trail shoulder position).

Weak grips are visually MORE OBVIOUS than strong grips for most observers — easier to spot, easier to start with.

#### Red Flag 2 — Ball position too far back

The swing arc is on an inclined plane — a tilted circle. The early portions of that arc point more to the right. If the ball is positioned too far back in the stance, the club hasn't had a chance to close on the arc by the time it reaches the ball — face stays open at impact.

#### Red Flag 3 — Open face through backswing positions

Most commonly affected by grip (Red Flag 1), but worth checking independently. Use video and watch where the face is in space at:

- **P2 (first parallel back):** open face here points back toward the player's trail ear / cheek instead of toward the ball line
- **P3 (mid-back) and P4 (top):** is the face still riding parallel to the swing plane, or has it turned down toward the plane?
- **Transition into downswing:** a face still open here means the player has too much work to do on the way down

If the face is "riding the plane" instead of turning down to the plane through these positions, the player has to do enormous work in the downswing to square it — usually unsuccessfully.

This red flag is harder to see without video. Develop the eye for it as a coach over time.

#### Red Flag 4 — Excessive lag and handle lead at impact

This is mostly an **elite-player** red flag (Sergio Garcia is the classic example). Two coupled characteristics:

- **A lot of angle (lag) coming into impact**
- **A lot of forward handle lead at impact**

To square the face from a heavily lagged delivery, the player has to twist the knuckles down hard — a high-skill movement most amateurs can't execute reliably. The lag and the handle lead need to be released / straightened to allow the face to square more naturally.

Don't apply this red flag to a 20-handicap. It's relevant for the player who has the swing speed and structure to produce real lag.

#### Red Flag 5 — Aggressive mass shift to the lead side

Body movement that effectively moves the ball position back. Specifically:

- The body's centers (lower + upper) move too aggressively toward the target
- This shifts the effective ball position back relative to the player
- The player has effectively LESS TIME to do the work to get the face square

**Note:** body ROTATION (a lot or a little) is a smaller factor here than mass shift. A player with too much lateral mass shift is the open-face risk; a player with rotation variations is less so.

### The Top Plays — match the drill to the red flag

#### Top Play 1 — The Suitcase Grip (for weak grip)

**For:** Red Flag 1 (weak grip).

**Why it works:** when an untrained player picks up a club, the natural tendency is to tuck the lead hand UNDER, placing the grip too high in the palm. That's a weak grip with the face open at address. The suitcase method forces the grip into the fingertips with the proper rotation.

**Setup:**
1. Have the player hold the club at their side, **like a suitcase** — vertical shaft, hand wrapped around the grip end at fingertip height
2. Then **turn the clubface UP** (you may need to help them rotate it)
3. Have them **slide their hand down into the grip position** while keeping the grip in the fingertips
4. The handle rolls right up on top of the fingers as they assume the address position

**Result:** stronger grip naturally placed in the fingertips. Faster than trying to verbally describe knuckle counts and V-direction.

#### Top Play 2 — Backswing Face Awareness Drill (swing guide or tee)

**For:** Red Flag 3 (face too open through backswing).

**High-fi version (with swing guide):**
- Place a swing guide on top of the shaft, oriented so the leading edge is matched
- Then turn the swing guide further toward the right (e.g., 130° rotation on the grip)
- The player now has to actively CLOSE the face during the backswing to make the swing guide hit their lead arm
- Big medicine — overcorrects the face orientation through backswing

**Lo-fi version (tee in fingertips):**
- Place a tee in the fingertips of the lead hand at the grip end, pointing outward
- When the grip rolls open during backswing, the tee points to the SKY
- Goal: the tee should point DOWN to the GROUND at the top of backswing (face closed)
- Player can self-monitor face position throughout backswing

**Coaching cue:** "Tee facing UP = face open. Tee facing DOWN = face closed."

#### Top Play 3 — Transition Face Fix (the "unseat" drill)

**For:** face good at top of backswing, then opens in transition (lead wrist extension during the change of direction).

**High-fi version (with swing guide):**
- Place the swing guide on TOP of the lead arm
- Have the player "unseat" the swing guide off the arm during transition
- This produces lead-wrist FLEXION (opposite of the extension that's opening the face)
- Earlier squaring of the face in the downswing

**Lo-fi version (tee in fingertips):**
- Tee in fingertips of lead hand
- Have the player turn the tee back toward the camera (or back toward where you'd film from down-the-line)
- This creates the same response: lead wrist into flexion, trail wrist into extension
- Face turns down to the plane earlier in the downswing

#### Top Play 4 — The Buddy Resistance Drill

**For:** any open-face transition issue, especially when the player struggles to FEEL where the face is.

**SAFETY FIRST:** the coach (or buddy) stands on the back / right side of the player where the player can't see them. **Use slow backswings only.** Never do this with a full-speed swing.

**Setup:**
1. Player makes a slow backswing
2. At or near the top, coach catches the club and tries to TWIST the grip in the OPEN direction (toe rotates further toward the sky)
3. Player must respond with force in the OPPOSITE direction — rotate the grip toward CLOSED (toe down)
4. When the player applies enough force, the coach RELEASES
5. The club rebounds with force toward the closed direction — the player feels the squaring/closing motion through their hands and forearms

**Result:** the player learns the feel of actively squaring/closing the face. Especially valuable for players who can intellectually understand "close the face" but can't feel it dynamically.

### Diagnostic flow (how to actually use this framework)

When a player presents an open-face / right-miss:

1. **Check grip first.** If weak, run Top Play 1 (suitcase) — this resolves the issue for most amateurs without further work.
2. **If grip is OK, check ball position.** Move the ball forward if it has drifted back.
3. **If grip + ball position are OK, check backswing face orientation on video.** If face is too open through P2-P4, run Top Play 2.
4. **If backswing face is OK but face opens in transition,** run Top Play 3.
5. **If the player can't feel where the face is regardless,** run Top Play 4 (buddy drill, slow swings only).
6. **For elite players with excessive lag / handle lead,** address the lag mechanics specifically — this isn't a generic-amateur fix.
7. **For aggressive mass-shift causes,** the fix lives in the pivot work — partial-swing / pivot-pause drills (cross-reference Hugh's Pressure Points framework).

**One drill per session.** Pick the matched Top Play; don't dump all four on the player at once.

### Cross-reference cluster

This framework is the open-face complement to:

- **Hugh's Slice Faults and Fixes Protocol** — face-first sequence; this Altus framework gives matched drills for specific causes
- **Hugh's Grip Framework** — Top Play 1 (suitcase) is a different-feel alternative to Hugh's pre-closed-face grip method; both produce the same end state (stronger grip, face closer to path)
- **Setup Reference + Ball Position Spectrum** — Red Flag 2 (ball position too far back) is upstream of all the swing-side work; verify ball position before drilling face mechanics
- **Pressure Points Framework** — Red Flag 5 (aggressive mass shift) and Top Play 3 (lead wrist flexion via unseating) both connect to the Pressure Points lead-side work
- **Out-to-In Path Errors (Altus, above)** — the Altus principle "solve face first" sits at the top of both frameworks; if face stays open after these drills, the path framework is next

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player has a clear right-miss / open-face pattern** that's the dominant problem (path is acceptable or secondary)
2. **Player has tried Hugh's Slice Protocol Component 1 (face) and a specific Red Flag here matches** their persistent issue
3. **Player profile contains specific open-face cause indicators** (e.g., "I've been told my grip is too weak," "I leave the face open," visible weak grip in video)

**When NOT to surface:**
- Player profile shows slice but face hasn't been worked yet via Hugh's protocol — start there
- Player has an in-to-out / hook pattern — this is the wrong framework
- Player has bigger leaks competing for priority

---

## Closed Face Errors — Altus Performance Framework (Red Flags + Top Plays)

**Attribution:** Altus Performance Framework. The face component of the hook / left-miss problem — ball launches too far left, assuming centered strike. **Mirror image of the Open Face framework above** — same Red Flag → Top Play structure, opposite direction.

### Framework Selection Rubric

**Hugh has no dedicated closed-face protocol.** This Altus framework fills that gap. Use it whenever a player presents with a closed-face / left-miss issue. No conflict with Hugh's content — this is purely additive.

### The face angle concept (read first)

Face angle = the direction relative to the target line that the clubface is pointing at impact. With a centered strike:

- **Face pointed too far LEFT at impact** = closed face → ball launches left
- **Face pointed too far RIGHT at impact** = open face → ball launches right (see Open Face framework above)

The clubface is providing the ball with its launch direction at the moment of impact. The Red Flags below identify why the face arrives closed.

### The Red Flags — diagnose the cause first

Five primary causes, scanned in order:

#### Red Flag 1 — Grip too strong

Most common cause. Two visual cues:

- **Face-on view:** the lead hand is turned too much to the right — you can see a lot of the **logo on the back of the glove**
- **Face-on view trail hand:** turned too much UNDER — you see a lot of **fingers / fingernails** on the trail hand
- **Both together** = "double-left potential" — high likelihood of a closed face at impact

Strong grip is the first place to look. It's the most common cause and the easiest to fix.

#### Red Flag 2 — Ball position too far forward (left)

Mirror of the open-face ball-position issue. The swing arc is on an inclined plane — a tilted circle:

- The further left the ball is positioned, the more the circle has rotated to the LEFT of the body line by the time the club reaches it
- Catching the ball later in the arc, when the arc is facing left, presents a closed face
- Same effect as a body-position issue (Red Flag 5 below) but from a setup cause

#### Red Flag 3 — Closed face through backswing positions

Use video and watch where the face is in space at:

- **P2 (first parallel back):** face MORE TOWARD THE GROUND = closed (face pointing down means it's rotated past neutral)
- **P3 / P4 (top of backswing):** face MORE TO THE SKY = closed
- **Through downswing:** face being closed too much, too early — leaves the player with too much work to align it back, often over-aligning to closed at impact

Even a player who is neutral at P2 / P4 can over-rotate the face closed during the downswing motion itself. Watch the face throughout, not just at static positions.

#### Red Flag 4 — Cast (very common in average recreational players)

This is the most common closed-face error in amateur populations. Definition: over-using the trail hand to push the clubhead back to the ball.

Two patterns to watch for:

- **Wide backswing + early wrist-angle release** — player makes a nice wide backswing then uses the wrist angle prematurely to get the club back to the ground
- **Narrow backswing + proper wrist set + trail-hand release** — player sets the wrist nicely but the trail hand becomes the primary motion producer through release

**What cast produces at impact:**
- More LOFT (clubface added loft from the early release)
- Club working UNDERNEATH the handle sooner than needed
- High loft + closed face = left launch with high trajectory

Cast is a major closed-face contributor for the recreational player population.

#### Red Flag 5 — Hang-back (mass not moving forward in downswing)

Body movement that effectively moves the ball position FORWARD in the stance:

- Player hangs back on the downswing instead of shifting toward target
- Effectively moves the swing arc backward
- Causes the player to catch the ball later in the arc
- That arc point is effectively further forward in the stance (relative to body)
- Same impact effect as Red Flag 2 (ball too far forward at setup), but caused by body movement instead of static ball position

Note: this is the opposite of the Open Face Red Flag 5 (aggressive mass shift to lead). Mass shift to lead = open face. Hang back = closed face.

### The Top Plays — match the drill to the red flag

#### Top Play 1 — Build grip awareness (knuckle reference + tees + suitcase)

**For:** Red Flag 1 (strong grip).

**Method A — Knuckle reference (most common verbal cue):**
- Goal: have the player see FEWER knuckles on the lead hand than they currently do
- Rule of thumb for neutral: **2 knuckles visible on lead hand** (index + middle), **1 knuckle visible on trail hand** (just index)
- Pure-strong grip players will see 3-4 knuckles on lead hand at address — work down toward 2

**Method B — Tee placement:**
- Place a tee in the V intersection between the index-finger knuckle and the thumb on each hand
- The tee orientation tells the story of the rotation
- Tees roughly aligned to perpendicular-body / sky = neutral grip
- Tees pointed sharply right of that = strong grip

**Method C — Suitcase grip:**
- Hold the club at the side like a suitcase handle
- Hand naturally rolls into a more neutral position
- Turn the clubface UP, slide the grip down
- Same on the trail hand
- Result: neutral grip, softens the over-strong tendency

These three methods are interchangeable — use whichever the player responds to fastest.

#### Top Play 2 — Backswing / Downswing Face Awareness (swing guide + tee)

**For:** Red Flag 3 (face too closed through backswing or closed too early in downswing).

**High-fi version (with swing guide):**
- Position the swing guide at roughly **12 o'clock** to the toe of the club, or slightly right (12:15 or 12:30)
- Goal: work the swing guide into a position that **seats itself on the player's lead arm** during the swing
- When the swing guide sits comfortably on the lead arm, the face is in a less-closed orientation
- The visual reference of "swing guide sitting on lead arm" trains a more neutral face position

**Lo-fi version (tee in fingers):**
- Place a tee in the player's fingers between their index and middle finger of the lead hand at the grip end, pointing roughly down the target line
- Tee orientation tells the face story:
  - Tee facing too far DOWN at first parallel = face too closed (work it more neutral)
  - Tee facing too far UP at the top = face too closed (work it more neutral)
  - Tee neutral throughout = face neutral throughout

**Drill protocol:**
1. Slow practice swings monitoring the tee/guide at the trouble position
2. Once the player can hold the new face position consistently, hit shots
3. Use the same monitoring point during ball strikes

This drill works for any face-orientation issue at any phase (backswing, mid-downswing, transition).

#### Top Play 3 — Address the cast directly (for Red Flag 4)

**For:** Red Flag 4 (cast — over-using the trail hand).

The cast fix isn't covered as a single drill in this transcript — it's a coaching project that combines:

- **Pressure shift work** (lead-side pressure shift through transition; cross-reference Hugh's Pressure Points framework)
- **Wrist angle preservation** drills (lag-bag drills, pump-and-stop drills)
- **Trail-hand quieting** cues (lead-hand-only swings, towel-under-trail-arm drills)

Treat cast as a multi-session project, not a single-drill fix. The Pressure Points framework's lead-side pressure-shift drills are the most direct entry point for cast correction.

#### Top Play 4 — Mass-shift drill (for Red Flag 5)

**For:** Red Flag 5 (hang back).

Same logic as the cast fix — the underlying issue is the pivot pattern. Cross-reference:

- **Hugh's Speed Framework Component 4 (Pressure Shifts)** — earlier and more pressure shift to lead is the universal cure for hang-back patterns
- **Hugh's Pressure Points Framework drills** — the lead-side pressure shift is the foundation of all the isolation drills

A targeted drill: half-swing 7-iron with a focused pressure-shift cue (feel the lead foot loaded at the top of backswing / through impact). Build from half-swing to full as the pressure shift becomes habitual.

### Diagnostic flow (how to actually use this framework)

When a player presents a closed-face / left-miss:

1. **Check grip first.** If too strong, run Top Play 1 (knuckle / tee / suitcase). Most amateur closed-face issues resolve here.
2. **If grip is neutral, check ball position.** Move the ball back toward middle if it has drifted forward.
3. **If grip and ball position are clean, check backswing face orientation on video.** If face is too closed through P2-P4, run Top Play 2.
4. **If the player is casting,** treat as a multi-session project (Top Play 3 cross-references).
5. **If the player is hanging back,** treat as a pivot project (Top Play 4 cross-references).

**One drill per session.** Match the matched Top Play to the dominant red flag.

### Cross-reference cluster

This framework is the closed-face complement to:

- **Open Face Errors (Altus, above)** — sister framework, opposite direction
- **Hugh's Slice Faults and Fixes Protocol** — Hugh covers slice (open face); this Altus framework covers the closed-face / left-miss that has no Hugh equivalent
- **Hugh's Grip Framework** — Top Play 1 here is the closed-face inverse of Hugh's closed-face-grip approach for slicers; both use grip awareness, opposite direction
- **Hugh's Pressure Points Framework** — Red Flags 4 (cast) and 5 (hang back) both resolve via the lead-side pressure shift work
- **Hugh's Speed Framework Component 4 (Pressure Shifts)** — same pressure-shift principle applied to the closed-face cause set

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player has a clear left-miss / hook pattern** as the dominant problem
2. **Player profile mentions "I hook it," "ball goes left," "snap hook,"** or visual indicators of strong grip / closed face in any submitted video
3. **Player has been working on slice fix and over-corrected into a hook** — common after Hugh Slice Protocol Stage 1 (closed-face grip) is implemented too aggressively

**When NOT to surface:**
- Player has slice / right-miss as dominant — wrong framework, use Open Face / Slice Protocol
- Player has no consistent left-miss pattern — don't surface speculatively
- Player has bigger leaks competing for priority

---

## Altus Ball Striking Framework — Foundational Concepts

**Attribution:** Altus Performance Framework. The foundational concepts that sit beneath the Altus strike-error modules (Vertical Strike Errors and Horizontal Strike Errors below). Read this section first before applying either module.

### The two-bucket framework — Strike vs. Directional pain points

Altus categorizes ball-striking pain points into two buckets:

- **Strike pain points** — where on the clubface the player makes contact (the focus of Vertical and Horizontal Strike Errors modules below)
- **Directional pain points** — face and path errors that send the ball off line (the focus of the Open Face / Closed Face / Out-to-In Path / In-to-Out Path modules)

There's overlap (strike issues can cause direction errors), but the two-bucket categorization helps the coach prioritize: **contact is king.** Start with strike — if the player isn't centering the strike, no amount of face/path work will produce reliable ball flight.

### Sweet spot — the reference point

The clubhead **sweet spot** is the point on the clubface around which the face will NOT twist when contact is made. It's typically very close to the visual center of the clubface. Centered contact at the sweet spot is the goal — when contact is made there, any ball-flight error you observe is caused by something other than strike location.

When contact is NOT in the sweet spot, the off-center hit produces predictable cause-effect changes in ball flight. Knowing those rules is what lets you reverse-engineer the strike error from the ball flight.

### The four sweet-spot effect rules (right-handed player)

1. **Below the sweet spot (low on face)** → higher spin rate, can produce lower launch
2. **Above the sweet spot (high on face)** → lower spin rate, can produce higher launch
3. **Heel (closer to the shaft)** → increased spin rate, lower launch, MORE LEFT launch direction
4. **Toe (further from the shaft)** → decreased spin rate, higher launch, MORE RIGHT launch direction

These four rules let you diagnose strike location from the ball flight without TrackMan — a high-spin low-launch shot probably came from heel-and-low contact; a low-spin high-launch shot probably came from toe-and-high contact.

### Bulge and Roll / Gear Effect (advanced, COACH KNOWLEDGE ONLY)

**Coach reference only — NEVER surface in the dossier output to the player.** This is for the curious-coach reader.

**Bulge and Roll** is a design feature on metal woods, drivers, and hybrids: the clubface has some amount of curvature (bulge = horizontal curvature; roll = top-to-bottom curvature). The reason for the curvature is to **correct for toe and heel contact errors via gear effect.**

**Gear effect on a driver / wood / hybrid** (because the face has bulge):
- **Toe strike** → ball launches further RIGHT, then curves back LEFT (the "toe draw")
- **Heel strike** → ball launches further LEFT, then curves back RIGHT (the "heel fade")

These are OPPOSITE to what an iron strike produces (because irons don't have bulge).

**Practical use:** when watching driver ball flight, a high pull-fade can be a heel strike (gear effect) rather than a face/path issue. Spray the driver face to confirm before working on swing fixes. Same logic for vertical: high-on-face driver contact produces low-spin high-launch (good for distance, but rarely repeatable).

This isn't player-facing content. If the coach mentions it during a lesson it's because it's the cleanest explanation for an unusual ball flight pattern.

### How to identify a strike pain point

The diagnostic feedback sources, in order of preference:

1. **Spray the face** — face spray (like Dr. Scholl's foot spray on the clubface) shows the contact pattern after every shot. The most reliable, lowest-tech diagnostic. Use it on nearly every session.
2. **TrackMan Impact Point data** — for sessions on a launch monitor, the impact location is measured directly in mm offset from the sweet spot (vertical and horizontal).
3. **Ball-flight indirect signs** — low smash factor and ball speed = strike issue. High spin / low launch on a club = heel-and-low contact pattern. Low spin / high launch = toe-and-high contact pattern. Doesn't fit the optimal window for the club = strike issue.
4. **Sensory feedback** — experienced coaches can hear and see when a ball isn't hit solidly (the dull crack vs. the compressed thock). Most players also feel the difference (torque on the clubhead from off-center contact, turf interaction that doesn't feel right).

Once the strike pain point is established, run the matched module below: Vertical Strike Errors for fats/thins, Horizontal Strike Errors for heels/toes.

### Cross-reference cluster

This foundational section sits beneath:

- **Vertical Strike Errors (Altus, below)** — fats and thins
- **Horizontal Strike Errors (Altus, below)** — heels and toes
- **Hugh's Impact Dynamics Reference — Low Point Control (3 Dimensions)** — Hugh's diagnostic framework for the same problem domain; Altus provides matched drills, Hugh provides the conceptual diagnostic and the AI-gets-this-backward warning on lateral (heel/toe) direction

**For directional pain points** (face / path), see the separate Altus modules above (Open Face, Closed Face, Out-to-In Path) and Hugh's Slice Faults and Fixes Protocol. Directional pain points sit in the OTHER bucket of the Altus problem-solving framework, addressed by their own modules.

---

## Vertical Strike Errors — Altus Performance Framework (Red Flags + Top Plays)

**Attribution:** Altus Performance Framework. Vertical impact location errors — fats and thins with irons. The vertical dimension of impact location.

### TrackMan + advanced concept context (coach-knowledge sidebar)

**TrackMan terminology:** vertical strike errors show up as **Impact Point on the face**, measured in millimetres (high or low). When diagnosing on TrackMan, the relevant data field is the vertical mm offset from the sweet spot.

**Bulge and Roll / Gear Effect (coach-only knowledge):** for the curious-coach reader, the bulge (curvature across the face horizontally) and roll (curvature top-to-bottom on driver faces) introduce gear-effect compensation — a high strike on a driver face tends to launch lower-spinning, lower-launching, while a low strike does the opposite. Same physics on horizontal strike errors (heel/toe) with horizontal gear effect. **This is coach-knowledge only — do NOT surface to the player in dossier output.** It's relevant for explaining why some "off-center" strikes still produce reasonable results on driver, but it's beyond the scope of typical amateur coaching.

### Framework Selection Rubric

**Hugh's Low Point Control Reference (Dimension 3: Vertical Depth) covers the diagnostic conceptually.** This Altus framework provides the matched DRILL set for the same problem domain. Use them together:

- **Hugh** = diagnostic + concept (too deep vs. too shallow, the misdiagnosis trap)
- **Altus** = drill prescription matched to specific cause (posture / dynamic height / radius / lateral mass)

When generating dossier recommendations, default to citing the matched Altus drill below, with Hugh's vertical-depth framing as the supporting concept the coach already knows.

### The Red Flags — diagnose the cause first

Four primary causes of vertical strike errors (fats and thins). Scan in order:

#### Red Flag 1 — Static posture issue at setup

Two opposite versions, both produce strike issues:

- **Too much flex / sitting back too far toward the heels** → land club too early behind the ball (FAT shots)
- **Standing too tall / not enough forward bend** → club doesn't land in the ground at all, or lands thin (THIN shots)

If the address position is wrong, the swing has to compensate — and the compensation usually fails.

#### Red Flag 2 — Dynamic height change through the swing

Setup is OK, but the player loses or gains height during the swing:

- **Standing up / extending / losing posture** through transition or downswing → flattening the shoulder plane, club lands too late (thins) or wildly inconsistent
- **Lowering / over-flexing** in backswing or downswing → getting too low to the ground, lands club too early (fats)

This requires video to confirm — hard to see live with the eye.

#### Red Flag 3 — Radius management (wrist load)

The angle between the shaft and the lead forearm tells the story:

- **Underloaded / too wide** (early release — most common rec amateur error) → club lands TOO EARLY, fat shots
- **Lagging too much, retracting arms, or pulling mass too far left** → narrowing the radius excessively → club doesn't land at all OR lands too far forward, thin shots / topped shots
- Better players sometimes create so much lag that the club is too high in late downswing — thin / topped shots from too steep delivery

#### Red Flag 4 — Lateral motion (sway and slide)

Two opposite versions, both produce strike issues:

- **Backswing sway off the ball** (overloading into trail side, mass too far right) → can't get back in time → fat shots
- **Forward slide** (mass too far left in downswing, "surfing" toward target) → strike issues, often thins

### The Top Plays — match the drill to the red flag

#### Top Play 1 — The Neutral Posture Drill (the "barbell" / deadlift analogy)

**For:** Red Flag 1 (static posture issue at setup).

**Setup:**
1. Have the player hold the club like a **barbell** standing up in their hands (vertical shaft, both hands on top of grip end)
2. **Slide the club down the thigh** until it's just above the knee
3. As they slide it down, they naturally **push the hips back** and create a **soft flex in the knees**
4. From there, **hang the arms down** — they hang naturally right under the shoulders
5. That's neutral posture

**Why it works:** for players with gym experience, the deadlift cue maps cleanly. Even for non-gym players, the slide-down-the-thigh motion produces correct posture without the coach having to explain hip hinge mechanics verbally. This is the highest-mileage drill for fixing setup posture issues.

#### Top Play 2A — The Choke-up Drill (for players standing UP / extending)

**For:** Red Flag 2 (extending up during swing — most common dynamic-height issue in amateurs).

**Setup:**
1. Set up in good neutral posture (Top Play 1 above)
2. Choke up almost to the metal on the shaft — really high on the grip
3. **Hover the club well above the ball**
4. Dry swings: swing to the top, then try to land the club on the ground
5. To land the club from the choked-up position, the player MUST feel "chest down, butt back" through the strike — the opposite of extending up
6. Once they can find ground in dry swings, hit balls with the same choke-up + chest-down feeling
7. Then grip normally and replicate that same flex-down feeling

**Coaching cue:** "Lower into the ball" — opposite of their natural extension pattern.

#### Top Play 2B — The High-Tee 6-Iron Drill (for players LOWERING / getting too low)

**For:** Red Flag 2 (lowering during swing — less common but real).

**Setup:**
1. Take a 6-iron, tee it up **really, really high** in the air
2. Dry swings first: feel like you're **extending UP through the ball**, just clipping the 6-iron off the very top of the tee
3. Coaching cue: **"leave the tee in the ground"**
4. Once the player can clip the ball cleanly off the top of the tee, hit balls with the same feeling
5. Then transfer to a ball on the ground, replicating the standing-tall sensation

**Coaching cue:** "Clip it off the top" — opposite of their natural lowering pattern.

#### Top Play 3 — The Linked Divots Drill (high-mileage drill for fat shots)

**For:** Red Flag 3 (radius wider than ideal, early release) and Red Flag 4 (mass staying back). Most fat-shot patterns respond to this drill.

**Setup:**
1. Place rods on the ground as a visual reference for where the divot should start
2. **Step 1 (no ball):** punchy half-swing, make a divot starting at the rods extending forward
3. **Step 2:** start at the back of the just-made divot — **extend it further forward** by a few inches
   - Requires more lead-side mass shift
   - Requires more handle travel
   - Requires holding lag a little bit longer
4. **Step 3:** extend the divot forward ONE MORE TIME — even longer, even further forward
5. After a few rounds of this, hit balls with the same sensation

**Result:** the player who was landing the club too far back is now compressing the ball with the first turf contact much further forward than their habitual pattern. Trains low-point-forward delivery directly through divot evidence.

This is one of the highest-mileage drills in the Altus playbook for fat-shot fixes.

#### Top Play 4 — Swing Guide for Radius Management

**For:** Red Flag 3 (radius issues — most often early release widening the arc).

**Most common version (early release / wide arc → fat shots):**
- Place swing guide on the lead arm
- As the player starts down, the swing guide should **stay attached to the lead forearm for much longer than normal**
- This requires holding the lag — the wrist/shaft angle stays loaded
- More handle travel
- Low point moves forward — ball-then-turf strike
- Trains delayed release

**Inverse version (excessive lag / narrow arc → thin shots, rare, mostly better players):**
- Use swing guide so it does NOT touch the lead arm
- Player feels wider on the downswing, more structure preserved through release
- Allows the club to land earlier
- Removes the steep / too-far-forward low point pattern

#### Top Play 5 — Noodle on Trail Thigh (anti-sway / anti-slide)

**For:** Red Flag 4 (lateral mass movement).

**Most common version (sway off ball in backswing → fat shots):**
- Place noodle just outside the trail (right) thigh
- Allow about 1 inch of initial pelvic bump as the swing starts back
- As the player continues into the backswing, they should create SPACE between the trail thigh and the noodle by staying more centered
- If they sway, they hit the noodle — instant concurrent feedback

**Inverse version (forward slide / surfing → thin shots, rare):**
- Place noodle on the lead-side, a few more inches out (allowing 4-5 inches of pelvic shift toward target but not beyond)
- Player can shift toward target but not slide past the noodle
- Trains controlled lead-side pressure shift without runaway lateral motion

### Diagnostic flow (how to actually use this framework)

When a player presents fats or thins:

1. **Check static posture first** (Red Flag 1). Run Top Play 1 (barbell drill) if posture is off. Often resolves the issue without further drills.
2. **If posture is OK, check dynamic height on video** (Red Flag 2). Run Top Play 2A (choke-up) for extenders, Top Play 2B (high tee) for loweerers.
3. **If dynamic height is OK, check radius management** (Red Flag 3). Run Top Play 4 (swing guide) for radius issues, OR Top Play 3 (linked divots) for the most common fat-shot pattern.
4. **If first three are clean, check lateral mass movement** (Red Flag 4). Run Top Play 5 (noodle on thigh).
5. **One drill per session.** Match the matched Top Play to the dominant red flag. Don't dump multiple drills on the player.

### Cross-reference cluster

This framework is the matched-drill complement to:

- **Hugh's Impact Dynamics Reference — Low Point Control (Dimension 3: Vertical Depth)** — Hugh provides the conceptual diagnostic (too deep vs. too shallow + the misdiagnosis trap); Altus provides the matched drill for each cause
- **Hugh's Setup Baselines (Lower Limbs + Upper Body)** — Top Play 1 (barbell drill) is the practical setup-fix that produces what the Setup Baselines describe
- **Hugh's Pressure Points Framework** — Top Play 3 (linked divots) and Top Play 5 (noodle anti-sway) both reinforce the lead-side pressure shift that Pressure Points isolates

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player has a clear fat-shot or thin-shot pattern** as the dominant strike issue
2. **Player profile flags "I chunk it" / "I top it" / "inconsistent contact"** without a clear directional miss
3. **Player has been working on Hugh's Low Point Control conceptually but needs a specific drill** to install the change

**When NOT to surface:**
- Player has a clear directional miss (slice/hook) — face/path frameworks first
- Player has bigger leaks (driver penalties, putting catastrophe) competing for priority
- Player is at a level where strike quality is solid (low handicap with consistent contact)

---

## Horizontal Strike Errors — Altus Performance Framework (Red Flags + Top Plays)

**Attribution:** Altus Performance Framework. Horizontal impact location errors — heel and toe contact. Pairs with the Vertical Strike Errors framework above.

### Framework Selection Rubric

**Hugh's Impact Dynamics Reference — Low Point Control (Dimension 1: Lateral / In-Out)** covers heel and toe strikes conceptually, including the critical "AI gets this backward" rule (sweet spot AWAY = heel; sweet spot TOWARD = toe). This Altus framework provides the matched DRILL set.

Use them together:
- **Hugh** = diagnostic concept + the directional-rule warning the model must never invert
- **Altus** = drill prescription matched to the specific cause (mass shift / vertical plane / extension / path / setup distance)

### The Red Flags — diagnose the cause first

Five primary causes of horizontal strike errors. Scan in order:

#### Red Flag 1 — Anterior / Posterior mass shift

Body mass shifting toward or away from the ball during the swing:

- **Anterior shift** (mass toward the ball during swing) → tends to produce **heel contact** (and at the extreme, shanks)
- **Posterior shift** (mass away from the ball during swing) → tends to produce **toe contact**

This is the single most common cause and the first place to look.

#### Red Flag 2 — Vertical swing plane shifts

The plane of the swing isn't horizontal (baseball-style) and isn't vertical (skyscraper-style); it's an inclined plane. Late-downswing shifts in that plane direction produce strike issues:

- **Steepening / handle stands up** (clubhead works back toward the player) → tends to produce **toe contact** (most common version of this red flag)
- **Lifting up / thumbs pulling away** (less common, opposite direction) → tends to produce **heel contact** (and often LOW on the face too)

The toe-contact version is most often a function of **early extension** — hips thrusting forward through impact, throwing the handle up, clubhead twisting down.

#### Red Flag 3 — Arm extension or retraction (the "radius" issue)

Watch the trail elbow bend through transition:

- **Retracting** (pulling the elbows in, less extension at impact than at address) → club lands closer to the player → **toe contact**
- **Over-extending** (more extension at impact than at address, arms pushed away) → club lands further from the player → **heel contact** (or shank)

#### Red Flag 4 — Excessive path / swing direction

Angle of arc / angle of path that's too far across the target line. This one is **visually apparent immediately** when watching a player from down-the-line. Stands out as a red flag without needing video tools.

#### Red Flag 5 — Fundamental setup distance issues

The most basic place to start. Proximity to the ball at address:

- **Standing too close** → arms have to swing out away from the body to make room → **heel contact**
- **Standing too far / over-extended at address** → weight of arms + club brings them more vertical / closer to body at the bottom of swing → **toe contact**

Always check setup distance before drilling swing fixes.

### The Top Plays — match the drill to the red flag

#### Top Play 1 — The Buddy Drill (anterior / posterior mass shift)

**For:** Red Flag 1 (mass shift toward or away from ball).

**For anterior shift / heel contact:**
- Buddy stands in front of the player
- Buddy places hand or fist at the **front of the player's forehead / cap brim**
- Player makes backswings feeling where the buddy's hand is in space
- Awareness training — player learns the balance needed to NOT drift forward toward the buddy on the downswing

**For posterior shift / toe contact (the "Rickie Fowler" pattern):**
- Buddy stands in same position
- Buddy grabs the **bill of the player's cap** and gives a gentle TUG forward
- Player feels the resistance, learns the balance point
- Buddy releases mid-swing
- Player then makes the swing with the felt awareness of the correct balance position

#### Top Play 2 — Jump the Fence (extension / retraction)

**For:** Red Flag 3 (arm radius — too much retraction or too much extension).

**Setup:** alignment stick on the ground = "the fence."

**For too much retraction / toe contact (force more extension):**
1. Stand with feet AND club on the SAME side of the fence at address
2. Make slow back/down swings trying to make impact on the FAR side of the fence
3. Use a tee on the far side as the strike target (small precise target works best)
4. Forces the player to feel real extension — arms reaching out further from body
5. Watch that the player isn't introducing anterior shift (cheating with body) to make the drill easier
6. After several reps, hit balls starting on the offside of the fence — feel migrate from toe toward center

**For too much extension / heel contact (force less extension):**
1. Reverse: club starts on opposite side of fence from feet
2. Make small swings landing club on the SAME side as feet
3. Forces less extension — arms stay closer to body
4. Progress to ball strikes feeling the killed extension — heel contact migrates toward center

#### Top Play 3 — The Sting Drill (vertical plane / early extension producing toe contact)

**For:** Red Flag 2 (vertical plane shift, especially early extension).

**Setup:**
1. Player sets up to a ball normal posture
2. Bottom hand chokes way down to the metal of the shaft
3. Club hovers above the ball at normal height (the choke-down means the clubhead is now well above the ball)
4. Player makes slow swings rehearsing impact with **forward flex** and the feel of **thumbs pulling the club UP** away from the ground
5. Start high, rehearse down, thumbs up
6. Then strike a ball with the same feel

**Why it's called "the sting drill":** the player will likely hit the ball thin (their hands literally sting from the off-center contact), because they can't quite create enough forward flex. **That's the experience you want.** The thin contact is evidence they've reduced the toe-down vertical plane shift that was causing the toe contact in the first place.

**For the opposite (handle too LOW at impact, heel contact, less common):**
- "Toe drag" drill — coming to impact, elevate the handle and drag the toe along the ground
- Often presents as a heel-deep divot pattern
- Or just practice making very even divots — sole working uniformly along the ground

#### Top Play 4 — Head Cover Gate Drill (coordinative)

**For:** any persistent toe/heel issue. Coordinative skill training, not a mechanical fix.

**Setup:**
1. Place head covers on the OUTSIDE and INSIDE of the ball line, forming a channel / gate
2. Use a tee head pushed down into the ground as the strike target (so the clubhead just gently clips the top, possibly breaking it off)
3. **Start dry fire** — no ball — work the swing through the gate
4. Start wide (one ball-width either side of the channel — head covers stand up slightly, this isn't intimidating)
5. Successfully flicking the tee = good signal
6. Build length / speed in the swing as the player can land cleanly between the covers
7. Then **live fire** — spray the clubface for visibility, hit balls through the gate, watch the contact pattern migrate to center

**Why it works:** challenges the player to tap into the discrete sensations of where the clubhead lands relative to body. Hand-eye-coordination training that rewires the strike pattern through repetition with feedback.

#### Top Play 5 — The Setup Template (eliminate distance variability)

**For:** Red Flag 5 (fundamental setup issues — the most common foundational fix).

The premise: if the player stands a different distance from the ball every shot, contact will vary every shot. Fixing the setup variability fixes a huge percentage of horizontal strike issues without any swing change.

**Setup:**
1. Place an alignment stick BETWEEN the player's feet, perpendicular to the target line (this is the ball-line reference)
2. Confirm proper deadlift posture: hinge from the top of the hips, arms hanging down with about a fist of space between the top of the grip and the front of the thighs
3. **For the shortest club (lob wedge / sand wedge):**
   - Measure ONE CLUBHEAD distance from the alignment stick (heel of club touching the stick, toe touching where the ball will sit)
   - Player takes stance with proper deadlift posture
   - Mark the position on the ground or stick (tee, Scotch tape, duct tape — something semi-permanent)
4. **For the mid club (6-iron):**
   - Same measurement, one clubhead distance, mark the position
5. **For the longest club (driver):**
   - Same measurement BUT measure roughly 1 cm further away
   - Ball is positioned at the TOE of the driver instead of the heel
   - Mark the position

**Result:** the player has three reliable distance-from-ball references they can rebuild every time — short club, mid club, long club. Variability in distance from ball goes to zero, which removes a major contributor to horizontal contact errors.

### Diagnostic flow (how to actually use this framework)

When a player presents persistent heel or toe contact:

1. **Check setup distance first** (Red Flag 5) — run Top Play 5 (setup template). Often resolves the issue without swing work.
2. **If setup is clean, check mass shift on video** (Red Flag 1) — run Top Play 1 (buddy drill).
3. **If mass shift is clean, check extension/retraction** (Red Flag 3) — run Top Play 2 (jump the fence).
4. **If radius is clean, check vertical plane / early extension** (Red Flag 2) — run Top Play 3 (sting drill).
5. **If swing path is excessive across the target line** (Red Flag 4) — address with the path-related work in the Slice Protocol or Out-to-In Path Errors framework.
6. **For coordinative-skill reinforcement after any of the above,** run Top Play 4 (head cover gate) as a final integration drill.

**One drill per session.** Pick the matched Top Play for the dominant red flag.

### Cross-reference cluster

This framework is the matched-drill complement to:

- **Hugh's Impact Dynamics Reference — Low Point Control Dimension 1 (Lateral / In-Out)** — Hugh's lateral-strike concept including the AI-gets-this-backward rule; Altus provides the matched drill set
- **Vertical Strike Errors (Altus, above)** — sister framework, vertical dimension
- **Setup Reference + Ball Position Spectrum** — Top Play 5 (setup template) is the practical drill for what the Setup Reference describes
- **Out-to-In Path Errors (Altus)** — Red Flag 4 (excessive path) crosses into path territory; if path is the dominant cause, run that framework instead

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player has a clear heel or toe strike pattern** (as flagged in their face-contact answer on the questionnaire, OR visible on impact tape)
2. **Player has been working on the Hugh Low Point Control concept and needs the matched drills** to install the change
3. **Player has shanks** — toe-contact framework with extra urgency (shanks are the extreme of heel-strike geometry)

**When NOT to surface:**
- Player has a clear directional miss (slice/hook) without specific strike-location flags
- Player profile shows centered contact — strike isn't the issue
- Player has bigger leaks competing for priority

---

## Increasing Club Speed — Coaching Framework

**Attribution:** Hugh's framework for helping a player increase club speed (distance off the tee). The structure is Hugh's; the wording is Ryan's plain-English coaching voice.

### When to recommend this framework in the dossier output (gating rules)

**Speed work is rarely the highest-priority recommendation.** Surface this framework in the dossier only when ONE of these triggers is present:

1. **Player explicitly states distance as a goal** (questionnaire goal answer mentions "more distance," "hit it further," "I'm too short").
2. **Driving distance is significantly below tier benchmark** (e.g., 220 yards or under for a low handicapper, 200 or under for a mid handicapper, 180 or under for a high handicapper) AND no bigger leak is competing for priority.
3. **Junior Elite Academy player** — speed is a long-term development priority for any junior.
4. **Tournament-track player** where competitive distance is a real gating factor.

**When NOT to surface this framework:**
- Player has a major short-game leak, putting catastrophe, or driver-penalty pattern — those return more strokes per session than speed work.
- Player is older with chronic mobility/strength limits — pivot to course-management and short-game gains instead.
- Driving accuracy is under 30% — fix accuracy first; never add distance to an inaccurate pattern. (See Section 2 — Fairway Hit % flag.)

### The core principle (state this to the player)

**"Your ability to accelerate the club will only ever be as good as your ability to decelerate it."**

This is the unifying principle. It explains:
- Why **strength matters** (deceleration capacity is what makes high speed safe to produce)
- Why **grip strength matters** (the hands are the brake — weak hands cap how fast a player will allow themselves to swing)
- Why **technique-first** is sometimes the right answer (a poor technical pattern produces unsafe speed the body can't decelerate, and the body responds by quietly capping the speed)

### The two-track model (short-term + long-term run in parallel)

**Short-term components** — gains within sessions or weeks. Act on these immediately.

1. **Equipment** (driver, ball, grip)
2. **Technique** — nature of impact first, then speed of impact
3. **Player concept / intent**
4. **Pressure shifts** (the single biggest differentiator)

**Long-term components** — gains over months. Layer on once the short-term stuff is moving.

5. **Strength**
6. **Mobility**
7. **Muscle mass**
8. **Grip strength**
9. **Reaction time**

The **coaching obligation:** clear the short-term backlog FIRST, then introduce long-term gym work alongside. A player who is producing speed they can't control is being failed by their coach.

### Short-term Component 1 — Equipment

So many club players are using equipment that isn't helping them. The big three:

- **Driver fit.** Loft, shaft flex, head design, and (especially) shaft weight all gate the player's ability to produce and deliver speed. A wrong driver is a hard speed cap.
- **Golf ball.** Compression, spin profile, cover. Many high-handicap players use tour-spec balls that don't help their speed; many low-handicap players use rec-spec balls that bleed performance.
- **Grip — size, type, and condition.**
  - **Size:** studies have shown that **fatter grips can produce more club speed** (likely from reduced grip-pressure tension and better wrist hinge release).
  - **Type:** rubber vs. corded vs. wrap; affects perceived security and grip pressure.
  - **Condition:** worn-out grips force the player to grip harder, which kills speed.

**Coaching action:** if you can't get all three sorted, get the grips done. It's the cheapest intervention with the best speed return per dollar.

### Short-term Component 2 — Technique (nature of impact BEFORE speed)

Two technical paths to better distance:

- **Improve the NATURE of the impact** (where the player strikes the face, attack angle, smash factor)
- **Improve the SPEED of the impact** (raw club speed)

**Hugh's preference: nature first.** A consistent middle-of-face strike with the right impact factors will optimize ball speed at the player's CURRENT club speed before you ever try to make them swing faster. A 95 mph swing that hits the sweet spot will out-distance a 102 mph swing that finds the heel every other ball.

Only AFTER nature is consistent do you go after raw club speed. Speed work added on top of a wandering strike pattern produces longer misses, not longer drives.

### Short-term Component 3 — Player concept and intent

This is the most overlooked component. Most club players don't actually try to hit it hard.

- **Most players move at a speed they THINK they can control impact.** Speed is governed by their internal trust limit, not by their physical capability. The body knows it can't decelerate the club from a faster swing safely, so the body quietly caps the speed below where it can actually work.
- **Tempo issues are universal.** The majority of club players take **too long to get to the top of the backswing AND too long to get to impact.** Both halves of the swing are slow. The fast players are fast going back AND fast coming down.
- **Coaching action:** ask the player explicitly — "Are you trying to hit it hard?" Most will say no. Many have never been given permission to actually try. Permission alone (without any technical change) often produces 5–10 mph instantly.

### Short-term Component 4 — Pressure shifts (the #1 differentiator)

**Pressure shift timing is the single biggest factor separating high-speed players from the rest.**

- **High-speed players shift pressure to the lead side EARLIER and MORE** in the swing. Pressure begins moving lead-side during the backswing or at the transition, not after impact.
- **Slow-speed players shift pressure late or not at all.** Many never get pressure off the trail side.
- The earlier-and-more pressure shift unlocks access to **ground reaction force** — which is where the bottom-up speed comes from in elite players.

**Coaching action:** measure with a pressure plate if available, or visually with foot work and lead-side tilt at impact. If pressure shift is late or absent, this is the highest-leverage short-term intervention you can make for speed.

### Long-term Components — Strength, mobility, grip, reaction time

Gym work. Multi-month timeline. Layer on alongside the short-term work; do not delay technical coaching while waiting for gym gains.

- **Strength.** General lower- and upper-body strength expands the deceleration ceiling.
- **Mobility.** Hip and thoracic mobility specifically — limits ROM in the backswing and through impact, capping the speed available.
- **Muscle mass.** Power-to-weight is the relevant metric, not raw mass.
- **Grip strength.** Specifically called out as a "really key component." Weak grip strength is a hard cap on club speed because the body refuses to swing faster than the hands can secure the grip. Easy at-home work: grippers, towel hangs, dead hangs.
- **Reaction time.** Players with slow reaction times generally swing the club a little bit slower. Reaction-speed work (fast-twitch drills, batting cage, ball-toss reaction games) bleeds into swing speed.

### Coaching application notes — order of operations

In a typical 4-session speed-development arc:

1. **Session 1:** Equipment audit (grip immediately; flag driver/ball for separate fitting). Concept / intent conversation — give permission to try to hit it hard. Tempo baseline measurement.
2. **Session 2:** Nature-of-impact work. Strike pattern, smash factor, attack angle.
3. **Session 3:** Pressure-shift work. Earlier + more, lead-side at transition.
4. **Session 4:** Speed-of-impact work — overspeed training (lighter clubs at higher mph) once 1–3 are landed.

**In parallel:** S&C program (referral to a TPI-trained trainer if available). Grip-strength homework as floor-level "do every day" work.

### Diagnostic shorthand for the dossier output

When the gating rules above are met:

1. **Lead with the equipment audit** — fastest no-cost gain, sets credibility.
2. **State the core principle to the player** explicitly: *"Your ability to accelerate is only as good as your ability to decelerate."* This frames the whole speed conversation honestly — they need to be capable of stopping the club, not just swinging it.
3. **Recommend nature of impact before speed of impact.** This is non-negotiable.
4. **Probe pressure shift timing** as a high-leverage diagnostic — note in the On-Lesson Probes section.
5. **For JEA players:** include a referral to a TPI-trained S&C resource in the recommendations as long-term parallel work.
6. **Frame the realistic timeline:** short-term components can show measurable gain within 2–3 sessions; long-term components take months. Set the player's expectations honestly so they don't quit at week 4.

---

## Short Game Framework — The Foundation Shot

**Attribution:** Hugh's complete short-game framework — built around a single "Foundation Shot" that the player masters first, then adapts for every situation on the course. *"This is the heart of my short game coaching"* — Hugh's words.

**Future use note:** This framework is also designed to grow into a **2.5-hour Short Game Clinic Blueprint** as more short-game content is added. Each section below is structured modularly so it can become a clinic segment. A clinic-blueprint placeholder appears at the end — to be fleshed out as the corpus expands.

### The Foundation Shot principle

Hugh's central short-game thesis: **master ONE shot first.** Get the player very good at the Foundation Shot, then introduce the components that dramatically alter spin rate, ball speed, trajectory, and carry distance — all by adapting that one shot.

This contrasts with the common amateur approach of "having a different shot for every situation" — which results in inconsistency at every shot type because none gets the reps to be reliable.

#### The three principles of the Foundation Shot

1. **Stamped loft.** Use the loft of the golf club as the manufacturer made it. Don't add or subtract loft. *"Master a shot with what I call zero loft."*
2. **Downward hit.** A descending strike. The amount can vary as long as the player can predict how much down they want to hit it.
3. **Zero club path.** Working toward a club path of zero degrees. As loft increases, club path becomes the dominant influence on direction — so a zero path makes the ball flight predictable.

The combination: **face aligned per manufacturer's loft + zero club path + downward hit** = predictable trajectory and direction every time.

The zero path can be produced multiple ways (massive downward hit + massively left swing direction, OR small downward hit + relatively neutral swing direction). The path number is what matters; the components that produce it can vary by player.

### Setup for the Foundation Shot

#### Club setup

- **Manufacturer's loft.** Set the club up as the manufacturer intended. No adding or subtracting loft.
- **Middle of sole on the floor.** This is critical — the middle of the sole sat flat on the ground. NOT heel-up, NOT toe-up. The middle-of-sole contact point dictates the shaft plane.
  - **Why this matters:** anything heel-up or toe-up at address can result in a deflected impact, which compromises ball speed, spin rate, AND trajectory. Sole position is non-negotiable.
- **Positive shaft lean toward target.** Acceptable range: **3° to 7°** of forward shaft lean.

#### Body setup

- **Sternum over the golf ball.** Ball position is defined relative to the **sternum**, not the feet. Player's head should be centered above the ball.
- **Checkpoint:** the player's **nose should be over the ball** when viewed from face-on.
- **Pressure 60–65% on the lead foot at setup.** This is the Foundation Shot starting bias.
- **Pelvis + ribcage as close to parallel to the floor as possible.** This aids rotation AND helps the downward hit.
- **Down-the-line view:** forearms, ribcage, and eye line all parallel-left to target line. Only specialist shots warrant moving these to the right; the Foundation Shot keeps them parallel-left.

### Slope Adaptations — the four scenarios

The Foundation Shot is the base. For each slope scenario, ONLY the necessary changes are made; everything else stays the same.

#### Uphill (slope away from target)

**What changes:** ball will kick higher in the air naturally (slope adds loft); gravity pulls the player down the slope (toward the trail foot).

**Two adaptations only:**
1. **Allow pressure to fall down the slope** — almost exclusively under the trail (right) foot. Lead foot barely on the ground.
2. **Move ball position BACK** to retain the sternum-over-ball relationship.

**Stays the same:** swing thought, technique. Maybe a slightly bigger swing because the higher launch needs more carry. Pressure stays under the trail foot throughout the swing — that's what prevents the club digging into the slope.

#### Downhill (slope toward target)

**What changes:** ball will come out hot and lower (slope removes loft); gravity pulls the player down the slope (toward the lead foot).

**The most common amateur error here:** trying to "lift" the ball into the air. **Don't.** Accept that the ball will come out lower.

**Two adaptations only:**
1. **Allow pressure to fall down the slope** — almost exclusively under the lead foot.
2. **Move ball position FORWARD** to retain sternum-over-ball.

**Stays the same:** swing thought. Probably a slightly shorter swing (the ball comes out hot and runs).

#### Ball above the player's feet

**What changes:** the more the ball sits above the feet:
- **Face points to the LEFT of target** (the swing plane flattens).
- **Toe of the club comes out of the ground; heel stays in the ground.** Both effects are damaging.

**Two adaptations:**
1. **Tilt the face open** to counteract the leftward face aim.
2. **Stand the club up** (more vertical shaft) to get the middle of the sole back on the floor.

Then make the Foundation swing.

#### Ball below the player's feet

**What changes:** less dramatic effect on face direction than ball-above-feet, but the sole-on-floor problem returns (heel-up or toe-up).

**One primary adaptation:**
- **Stand the club up** to get the middle of the sole flat on the ground.
- Face position can stay reasonably square — face direction isn't as compromised as in ball-above-feet.

Then make the Foundation swing.

### Lie Adaptations — the three scenarios

Same problem-solving logic as slopes: keep the Foundation Shot, adapt only what the lie demands.

#### Standard fairway lie

Foundation Shot applies directly. Maybe add a slight bit of loft. Otherwise no changes.

#### Ball sat down (buried in thick grass)

**What changes:** ball is at the bottom of grass; grass is thick/chewy and will grab the club; need to drive the club down to reach the ball; need more speed to power through the grass.

**Adaptations (multiple, used together):**
1. **Add a little bit of loft** (because we're about to add speed and steepness — without added loft the ball would fly too far).
2. **More pressure to the left** (lead side).
3. **More shaft lean** (which helps move the club down into the ground).
4. **More speed** to power through the grass and counterbalance the added loft.

#### Ball sat up (perched on top of grass)

**What changes:** ball is above the ground level; need a U-shaped swing (low point pulled out of the ground); ball will strike higher on the face naturally → goes higher; ball comes out slower from this lie than from a standard lie.

**Adaptations:**
1. **Stand closer to the ball** and **grip down** on the club. This pulls the low point out of the ground.
2. **Use a "very dead arm swing"** to manage the low point and create the U-shape at the bottom of the swing.
3. **Add a little speed** because the ball comes out slower from this lie and the carry is reduced.

### The Problem-Solving Framework (the cornerstone teaching)

The deepest teaching point in this framework: **train the player to PROBLEM-SOLVE, not memorize.** The course presents infinite variations; the player needs a generative method, not a memorized list.

**For every short-game scenario, ask three questions:**

1. **How much LOFT does this require?**
2. **How much SPEED does this require?**
3. **What ANGLE OF ATTACK or SHAPE OF SWING does this require?**

If the player asks themselves these three questions before every shot, they can adapt to ANY situation by combining the Foundation Shot with the answers.

#### Hugh's coaching trick — the player-led walk

A specific drill Hugh uses: walk the player around the green, point at different lies and slopes, and ask the player to **verbalize how they will adapt the Foundation Shot.** Don't tell them — make them solve it.

*"It's amazing how quickly the player picks up on the subtle changes required to play these shots effectively"* once they're forced to articulate the adaptation themselves.

### Components that adapt impact (the levers)

Each of these levers shifts impact independently. Combining them produces dramatic shifts. Pick the minimum needed for the shot:

- **Lean LEFT (more lead-side pressure)** → steepens angle of attack.
- **Lean the HANDLE forward** → steepens angle of attack.
- **Combine the two** → really steepens angle of attack.

One component shift can massively shift impact. Understanding which lever does what is the difference between effective coaching and trial-and-error.

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Short game flagged as a weakness** in the questionnaire (low save percentage, high handicap with short-game leakage, comfort scores under 5/10 on chip/pitch/bunker).
2. **Player explicitly mentions short-game struggles** (chunked chips, bladed shots, can't get out of bunkers, doesn't have a go-to chip).
3. **Player is working on scoring** (10+ handicap, where short game returns 60% of strokes per Section 4 of the questionnaire).
4. **Junior Elite Academy player** — Foundation Shot mastery is a default development priority.
5. **Player describes "different chip for every situation" approach** — this is the core symptom the Foundation Shot framework addresses.

**When NOT to surface:** experienced player whose short game is producing acceptable up-and-down percentages, where another leak (driver, putting, approach) is competing for priority.

**Recommendation language for the dossier:**
- *"Foundation Shot first, every other short game shot second. Master one shot — stamped loft, downward hit, zero club path — before introducing variation."*
- *"For [slope/lie scenario X]: adapt only the necessary components — the Foundation Shot stays the same."*
- *"Use Hugh's three problem-solving questions: how much loft, how much speed, what angle of attack? Train the player to ask these themselves."*

**On-Lesson Probes block (when triggered):**
> "Short game diagnostic (Hugh's Foundation Shot framework):
> - Setup: middle of sole flat on ground? Sternum over ball (nose check)? 60–65% pressure lead-side? Positive shaft lean 3–7°?
> - Player's go-to chip — single Foundation Shot they can adapt, or a different shot for every situation?
> - Slope adaptation: can the player verbalize the changes for uphill / downhill / ball-above / ball-below?
> - Lie adaptation: can the player verbalize the changes for buried vs. perched?
> - Three problem-solving questions: is the player asking them, or guessing?"

### Cross-reference cluster

This framework connects to:

- **Pressure Points Framework** — the lead-side pressure shift that drives the Foundation Shot's downward hit is the same pressure shift the Pressure Points drills isolate.
- **Speed Framework Component 4 (Pressure Shifts)** — same pressure-shift principle, applied to short-game.
- **Setup Baselines (lower limbs, arms/hands/club, upper body)** — the Foundation Shot setup is a short-game-specific instance of the broader setup framework.
- **Impact Dynamics — Low Point Control** — the Foundation Shot's downward hit IS low-point-ahead-of-ball (Dimension 2 horizontal); slope/lie adaptations also touch Dimension 3 (vertical depth).
- **Tiger 5** — Short game directly affects Tiger 5 #3 (blown easy save) and supports avoiding bogeys with scoring clubs.

### Future expansion: 2.5-Hour Short Game Clinic Blueprint *(placeholder)*

A 2.5-hour clinic structured around this framework would map roughly as:

| Time | Segment | Content |
|---|---|---|
| 0:00–0:15 | Intro + Foundation Shot principles | Why master ONE shot first; the three principles (stamped loft, downward hit, zero path) |
| 0:15–0:45 | Foundation Shot setup + execution | Full setup checklist; Foundation Shot reps with feedback |
| 0:45–1:15 | Slope adaptations | All four scenarios: uphill, downhill, ball-above, ball-below |
| 1:15–1:30 | Break + Q&A | — |
| 1:30–2:00 | Lie adaptations + problem-solving framework | Three lie scenarios; introduce the three problem-solving questions |
| 2:00–2:30 | Player-led adaptation around the green | Walk the green; players verbalize their adaptations for each shot |

**This blueprint is a placeholder.** As more short-game content lands (specialist shots, bunker work, distance wedges, putting integration, mental approach), the segments will be fleshed out and the clinic will be locked into a deliverable workshop format.

---

## Wedge System — Power, Control, and Partial Swings (Distance Control Architecture)

**Attribution:** Hugh's wedge distance-control system. This is the architecture that makes the 5% Progression Game (Practice Strategies) actually work — without a wedge system, the 5% Game just measures inconsistency. With the system, the player has a repeatable structure to produce specific distances on demand.

### The core distinction — Power Swing vs. Control Swing

Hugh's foundational distinction for wedge play:

#### Power Swing
- The normal full golf swing — optimizing club speed.
- **More pressure shift** (lead-side loaded aggressively).
- **More X-factor** — separation between rib cage and pelvis.
- **More leverage / lag** through the arm structure to convert power into clubhead speed.
- Used for the maximum-distance number with each wedge.

#### Control Swing
- Same physical structure but with **deliberately reduced power principles**.
- **Less X-factor.**
- **Less pressure shift.**
- **Less leverage** through hands and arms.
- Still a full pivot, but the engine is dialed back.
- Used for the controlled, sub-maximum number with each wedge.

The whole wedge system is built around **managing these power principles up and down** to produce predictable distances. Every other adjustment (length, grip, tempo) sits on top of this base distinction.

### The three tools to alter club speed (in Hugh's coaching preference order)

#### Tool 1 — Length of swing (preferred for club players)

- Shorter swing = slower club speed = shorter distance.
- Longer swing = faster club speed = longer distance.
- **Easiest to teach, easiest to repeat.** Start here with most players.

#### Tool 2 — Grip length (used more with better players)

- Where on the grip the player holds the club.
- **Hugh's system default:** everyone holds in the **MIDDLE of the grip** for every shot — same amount of grip sticking out above the hands as below.
- **End of the grip** (top): roughly **+2 mph** vs. middle, for a better player.
- **Lower on the grip:** further reduction in club speed proportional to how far down.
- Used as a fine-tuning lever once length-of-swing is dialed in.

#### Tool 3 — Tempo (hardest to coach; reserved for better players)

- Same length of backswing, different release character produces different speeds.
- **Aggressive pull-throw release** = more speed.
- **Languid, one-lever release** = less speed.
- In real time the backswing looks identical; the speed difference comes from the through-swing dynamics.
- Hugh has coached good players with the same backswing length using only tempo to vary club speed.

### Building the Wedge System — the layered approach

Hugh's strict process: master one swing per wedge before adding the next.

#### Layer 1 — Full Power Swing (Distance #1 per wedge)

- Full power swing.
- Hugh's number with a 56°: **95 yards.**
- This is the maximum distance for that wedge — the "I'm going for the back of the green" number.

**With 4 wedges:** 4 distances mastered.

#### Layer 2 — Full Control Swing (Distance #2 per wedge)

- Same full pivot, but power principles dialed back (less X-factor, less pressure shift, less leverage).
- Same grip length (middle), same setup.
- Hugh's number with a 56°: **85 yards** (~10 yards less than the power swing).
- This is the "stock" wedge number — the controlled distance the player hits for green-finding.

**With 4 wedges:** **8 distances** mastered. *"That's the basis of any good pitching system."*

This 8-distance baseline covers roughly **70 to 125 yards** with a common amateur wedge set (60°, 56°, 52°, 48° or similar gapping).

#### Layer 3 — Partial Control Swing (Distance #3 per wedge)

Once full power and full control are dialed in, add the partial control swing.

- **Same setup, same grip length, same pivot mechanics.**
- **Same power principles as the full control swing** (still no X-factor max, no leverage max).
- **Just shorter** — hands swing **just BENEATH shoulder height** at the top (vs. above shoulder for full control).

**Hugh's critical principle for partial swings: backswing length and through-swing length MUST mirror each other.**

- Full control swing: hands above shoulder back → hands above shoulder through.
- Partial control swing: hands just under shoulder back → hands just under shoulder through.

This is **different from the power swing**, where backswing and through-swing don't have to mirror exactly. For control swings, mirroring is the discipline that produces repeatable distances.

**With 4 wedges:** **12 distances** mastered.

#### Layer 4 — Quarter Control Swing (Distance #4 per wedge, optional)

Once Layers 1-3 are mastered, add a fourth swing for the most polished players.

- **Hands to waist height** on backswing → **hands to waist height** on through-swing (mirrored).
- Even shorter than partial control.
- Same setup, same grip length, same control principles.

**With 4 wedges:** **16 distances** mastered. This is a complete wedge system.

### The strict coaching sequence (do not skip)

Hugh emphasizes this is a **strict process** — no shortcuts:

1. **Get good at the Full Power Swing** with each wedge first.
2. **Then add the Full Control Swing** with each wedge.
3. **Then add Partial Control Swings.**
4. **Then (and only then) add Quarter Control Swings.**

Adding a new swing layer before the previous one is consistent produces a player with four wedges and zero reliable distances. The discipline is: master, then add.

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player flags distance-control issues with wedges or short irons** — "I never know how far my wedge will go," inconsistent approach distances 75-150y, low GIR with no obvious technique fault.
2. **Player has the "one wedge for everything" pattern** — using the same swing for every wedge distance, hoping for the best.
3. **Player attempts the 5% Progression Game and fails (Practice Strategy 1)** — the system has to be built BEFORE the test will produce useful data. If they're failing the 5% Game, this framework is the prerequisite.
4. **Junior Elite Academy player** — wedge system mastery is a default development priority.
5. **Tournament-track player** — the Wedge System is what makes their approach play hold up under pressure.

**When NOT to surface:** experienced player whose wedge play is producing tight proximities, where another priority (driver, putting, chipping) is competing for focus.

**Recommendation language for the dossier:**
- *"Build the Wedge System: master the Full Power Swing per wedge first. Once that's tight, add the Full Control Swing. That's 8 distances across 4 wedges — the foundation of any pitching system."*
- *"Don't add a third swing (Partial Control) until the first two are landed. The strict order is non-negotiable."*
- *"For partial swings, backswing and through-swing MUST mirror each other. Hands-under-shoulder back, hands-under-shoulder through. That mirroring discipline is what produces repeatable distances."*

**On-Lesson Probes block (when triggered):**
> "Wedge System diagnostic (Hugh's framework):
> - How many distinct distances can the player produce per wedge? (Goal: 2 minimum, 3-4 ideal.)
> - Are they relying on swing-length variation, grip-length variation, or tempo variation? (Hugh's order: length first.)
> - Are partial swings mirrored back-to-through? (Critical discipline for repeatability.)
> - Pressure shift dialed back appropriately on control swings? (Required for the Power-vs-Control distinction to actually work.)"

### Cross-reference cluster

- **Short Game Framework — The Foundation Shot** (sister section) — Foundation Shot is for chip distances (around the green); Wedge System is for full and partial wedges (50-130y). Pedagogical progression: chips → wedges → bunker.
- **Bunker Framework** (sister section) — same swing-architecture-then-distance-control pattern.
- **Practice Strategies — The 5% Progression Game** — the test that validates whether the Wedge System is working. If 5% Game scores are weak, the system isn't built. If they're strong, the system is producing what it should.
- **Practice Strategies — Trackman SG Random Targets** — once the Wedge System produces repeatable distances, this strategy tests whether the player picks the RIGHT distance for the situation (decision layer on top of execution layer).
- **Speed Framework** — the Power Swing principles used here (X-factor, leverage, pressure shift) are the same components the Speed Framework targets when full-swing speed is the goal. Cross-pollination: a player working on speed gets benefit on the Power Swing wedge number; a player working on Wedge System control gets a clearer feel for what to dial DOWN to produce slower club speeds elsewhere in the bag.

### Future expansion

This framework covers the **2-to-4 swing distance system per wedge.** As Hugh ships more wedge content (specialist trajectories — flighted vs. high vs. spinner; specific shot shapes — fade wedge / draw wedge; bunker-edge wedges; partial-swing tempo variations), each will fit as an extension of this base architecture.

---

## Bunker Framework — The Foundation Bunker Shot

**Attribution:** Hugh's bunker fundamentals. Same structural DNA as the Short Game Foundation Shot — start with impact geometry, then build the setup principles that produce that geometry repeatably. Sister section to the Short Game Framework above.

### The two pillars

Hugh frames bunker play as **two pillars**:

1. **Appropriate impact geometry** — what we want to deliver to the ball at impact.
2. **Setup principles** — how we set up to produce that impact geometry every time.

Get both right and bunker shots become consistent. Get only one right and they're random.

### Pillar 1 — Impact geometry for bunker

Two non-negotiables:

#### A. Zero club path, with the face matched to that path

- **Zero path is the priority.** Then aim the face at the same direction as the path.
- **Loft can be added** at address — that's how trajectory and spin get controlled. But path stays at zero.
- **Why path matters more than face for bunker shots:** with very lofted clubs (sand wedge, lob wedge), **the ball biases more toward the PATH than the face.** This is the inverse of what's true for less-lofted clubs. Most amateurs over-aim the face for bunker shots, expecting it to dictate the start direction the way it does on a 7-iron — it doesn't, because the loft is so high.

#### B. Manage the VERTICAL low point — Hugh's critical reframe

**Don't think "hit behind the ball." Think "hit the ground BENEATH the ball."**

This is Hugh's most important bunker insight, and it's a real reframe:
- **"Hit behind the ball"** focuses on a horizontal target on the sand a few inches behind the ball. It produces inconsistent contact because the player aims at sand, not at the relationship between club and ball.
- **"Hit the ground beneath the ball"** focuses on the **vertical low point** — taking the bottom of the swing arc DOWN, below where the ball sits. The club then enters the sand behind the ball **as a consequence**, not as a target.

**Vertical low point is the biggest key in great bunker play.** When the vertical is right, horizontal takes care of itself. When the vertical is wrong, no amount of horizontal aim fixes it.

### Pillar 2 — Setup principles that produce that geometry

Two simple setup moves. That's it.

#### Setup principle 1 — Work the feet into the sand

- **Shuffle the feet down into the sand at address.**
- **Every millimetre you work your feet into the sand takes the low point beneath the golf ball by a millimetre.** This is the most direct lever for managing vertical low point.
- **Bonus benefit:** working the feet in **tests the sand surface** — firm, soft, wet, fluffy. This is a metric good bunker players use to inform shot selection. Shallow + firm = different shot than deep + soft.

#### Setup principle 2 — Pressure bias to the lead side (~60%)

- **About 60% pressure on the lead foot at setup** for a right-handed player.
- **Why:** lead-side pressure produces a stable swing. Stable swing = controlled low point. Unstable swing (pressure shifting around) = low point wandering.
- **What this controls:** the BACK-FRONT (horizontal) position of the low point. Combined with feet-in-sand for vertical, you've got both dimensions covered.

### What the framework eliminates from your worry list

When the two setup principles are in place:

- **No need to worry about "hitting behind the ball"** — you've already taken the low point beneath it. The club enters the sand behind the ball as a natural consequence.
- **No need to worry about inconsistent horizontal strike** — you've kept the pressure on the front foot. The low point isn't moving back and forth swing-to-swing.

This is the simplification Hugh delivers: two setup moves replace a dozen swing thoughts.

### How to use this framework in the dossier output

**When to surface this framework (gating rules):**

1. **Player flags bunker play as a weakness** — comfort score under 5/10 on bunker, "leave it in the bunker" pattern, fear or avoidance of bunker shots.
2. **Junior Elite Academy player** — bunker fundamentals are a default development priority and notoriously under-coached for juniors.
3. **Player explicitly asks about bunker play.**
4. **Course-strategy issues that stem from bunker fear** (e.g., aiming away from greens to avoid bunkers) — fixing the bunker shot fixes the strategic posture too.

**When NOT to surface:** experienced player whose bunker play is producing acceptable up-and-downs, where another short-game leak (chip, pitch, distance wedge) is competing for priority.

**Recommendation language for the dossier:**
- *"Bunker reframe first: stop thinking 'hit behind the ball.' Think 'hit the ground beneath the ball.' Vertical low point is the key, not horizontal aim."*
- *"Two setup moves: feet worked into the sand (controls vertical low point), 60% pressure on lead foot (controls horizontal low point). That's the whole framework — don't add swing thoughts on top."*
- *"For very lofted clubs (sand/lob wedge), aim the PATH at zero. The face follows the path. Don't over-aim the face — the loft is too high for face direction to dictate start direction."*

**On-Lesson Probes block (when triggered):**
> "Bunker diagnostic (Hugh's framework):
> - Setup: feet worked into the sand? Pressure ~60% lead-side?
> - Mental model: 'hit beneath the ball' (vertical low point), or still 'hit behind the ball' (horizontal aim)?
> - Path / face awareness: does the player understand path matters more than face on lofted clubs?
> - Comfort under pressure: does the bunker work hold up when there's a real shot at stake?"

### Cross-reference cluster

- **Short Game Framework — The Foundation Shot** (sister section) — same impact-geometry-then-setup structural pattern.
- **Impact Dynamics — Low Point Control (Dimension 3: Vertical)** — Hugh's "hit beneath the ball" framing IS the vertical low-point teaching, applied to bunker. The cross-dimension misdiagnosis trap (vertical depth misread as horizontal-behind) is exactly what Hugh's reframe fixes.
- **Pressure Points Framework** — the lead-side pressure shift required here is the same principle the Pressure Points drills isolate.
- **Short Game Family Practice Strategies** — Torture Practice (which includes unraked bunker lies) directly trains this framework's adaptability under bad conditions.
- **Future Short Game Clinic Blueprint** (task #43) — bunker fundamentals will be a core clinic segment.

### Future expansion

This framework covers **standard sand shots from a normal lie**. As Hugh ships more bunker content (buried lies, fried egg lies, downhill / uphill bunkers, long bunker shots, fairway bunkers, hardpan), each will be added as an adaptation of this Foundation Bunker Shot — same pattern as the slope/lie adaptations of the regular Foundation Shot.

---

## Practice Strategies — Family Index

The Practice Strategies section is organized into **families** by game area. Each family contains drills (Hugh's) that are designed to live in the player's practice life — homework with measurable scores the player brings back to the coach, not in-session assessments.

**Current families:**
1. **Approach Game Family** — full-swing approach drills (5% Progression Game, Trackman SG Random Targets)
2. **Short Game Family** — chip/pitch/lie/landing-spot drills (Fill the Basket, The 33s, Torture Practice, Ghost Hole)

**Discipline reminder:** per the Dossier Length and Discipline Rules, **pick ONE drill maximum per dossier**. Match the drill to the player's specific leak — don't recommend a family of drills, recommend the single one that fits.

**Junior coaching note:** the Short Game Family drills (especially Fill the Basket and The 33s) are explicitly designed to engage juniors through gamification and scoring. They are also core components of the future 2.5-hour Short Game Clinic Blueprint (see Short Game Framework above).

---

## Practice Strategies — Approach Game Family

The Approach Game Family contains two paired drills:

- **Strategy 1 — The 5% Progression Game** trains the player to execute a known yardage repeatably.
- **Strategy 2 — Trackman SG Random Targets** trains the player's decision-making (which shot to pick) once execution is in place.

When recommended in the dossier output, frame them as **homework the player runs between sessions**, with a measurable score they bring back to the coach.

---

## Practice Strategy 1 — The 5% Progression Game (Approach Distance Control)

**Attribution:** This is one of Hugh's assessment drills (same coach as the slice protocol above). Ryan uses it directly as a bridge between technical/mechanical range work and on-course performance.

### When to recommend this drill in the dossier output (gating rules)

**This drill is NOT a default recommendation.** Only surface it in the dossier output when at least ONE of these triggers is present:

1. **Distance-control struggles** — questionnaire flags include "Not really" on club distance awareness, low GIR percentage, or self-reported approach inconsistency.
2. **Slice or fade as dominant miss pattern** — the drill exposes direction issues alongside distance, so it doubles as a slice-progression assessment.
3. **Previous lesson notes** flag distance work as an open priority.
4. **Junior Elite Academy program member** — default performance-prep tool for any JEA player regardless of other indicators.

If none of these triggers fire, **do not recommend this drill in the dossier.** The dossier should always lead with higher-priority leaks first (short game for high handicaps, off-the-tee disasters, etc.). This drill earns its place only when distance control is part of the priority ladder.

### The drill — setup and execution

**Yardages (16 targets):** 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150 — every 5 yards.

**Sequence:**
1. Player hits ONE shot to the 75-yard target.
2. If they land it within 5% of the target (within 3.75 yards either side of 75), they progress to 80.
3. If they miss the 5% window, they stay on 75 until they pass it.
4. Continue through all 16 numbers in order.

**The in-air call-out (this is the key teaching mechanism, not optional):**
Before the ball lands, the player **calls out the distance they think it flew.** This forces the development of:
- Feel for carry distance
- Ball-flight awareness
- The connection between strike quality and result

Run a **full pre-shot routine** on every shot — the drill is partly a routine-execution test.

### The "magic number" — pass/fail scoring

**Total shots / 16 ≤ 1.25** = pass. Player has earned the right to move to a harder version of the drill.

**Tom's example from the source video:** 21 shots to complete 16 targets. 21 / 16 = 1.31 — just failed the 1.25 threshold. He needs to repeat the test until he beats it before moving up.

**Promotion ladder once a player passes 5%:**
- 5% → 4% (harder window)
- 4% → 3% (elite / tour-style window)
- Or: same drill **un-normalized** (every shot must land in the window, not "1.25 attempts on average")

### Tier-matching to skill level (do not use 5% by default)

The 5% standard is too punishing for most club players. Match the percentage to the player so they engage:

| Player tier | Recommended window |
|---|---|
| World-class on their game / tour-level | **3%** |
| Elite competitive amateur / junior on form | **4%** |
| Junior Elite Academy / strong amateur / tournament prep | **5%** |
| Mid-handicap competitive player | **7–8%** |
| Recreational mid-handicapper / club player | **10%** |
| High handicapper learning to play | **15%** |

**The golden rule on tier selection: better to start too easy than too hard.**
- Too easy is recoverable — the player engages, you tighten the standard at the next session.
- Too hard "you've probably lost the player." Disengagement at the assessment stage is a serious coaching failure.

### Why this drill works (use these as motivators with the player)

1. **Identifies which yardages the player is GOOD vs. BAD at.** Especially in the wedge zone (75–100 yards) where most amateurs leak strokes without realizing.
2. **Strategy refinement.** Once leaks are surfaced, the player can FIX them rather than avoid them on course — most amateurs unconsciously play to their good distances and away from the bad ones, which leaves strokes on the table.
3. **Tournament preparation.** Simulates the "must execute now" pressure of every approach shot.
4. **Develops feel and ball-flight awareness** — the in-air call-out is the irreplaceable mechanism.
5. **Bridges technical to performance.** The single biggest coaching gap is the one between "swung well on the range" and "scored well on the course." This drill lives in that gap.
6. **Progressive difficulty.** Same drill made harder over weeks/months — visible, measurable improvement the player can hold in their hand.
7. **Confidence builder.** The player walks off the range with a NUMBER (their shot count). That number is concrete proof of improvement and it travels with them onto the course.

### Coaching application notes

- **Use as an early-session assessment with new students** — surfaces distance-control patterns in 30 minutes that lesson play might not reveal for months.
- **Use as a tournament-prep tool the week before competition.** Tom's example was direct: he had ~12 approach shots between 75 and 150 expected in his tournament, so this drill literally WAS his tournament prep.
- **Repeat the drill every 4–6 weeks** to track measurable improvement against the player's prior score.
- **The score is the most important coaching output** — the student's number, not their feel. Numbers travel; feelings don't.

### Diagnostic shorthand for the dossier output

When the gating rules above are met:

1. **Recommend the drill at the player's appropriate tier** (3%, 4%, 5%, 7–8%, 10%, or 15% per the table above). Default to one tier easier than the player's stated handicap implies — better to under-aim and tighten later.
2. **Frame the homework like this:** *"Run this drill once before our next session. Bring me your number. We'll target the worst-performing yardages in the lesson."*
3. **In the Game Diagnostic section**, note that distance-control work will be assessed via the 5% Progression Game and progress will be tracked by score across sessions.
4. **In the On-Lesson Probes section**, include: "Watch the in-air call-outs — does the player's perceived distance match actual distance? A consistent gap is a feel issue independent of the strike."

---

## Practice Strategy 2 — Trackman SG Random Targets (Strategy / Target Selection)

**Attribution:** This is Hugh's strategy-assessment drill — the natural pair to the 5% Progression Game. The 5% Game tests the player's ability to **execute a known distance**; this drill tests their ability to **pick the right shot in the first place.** Together they form a complete approach-game assessment.

### When to recommend this drill in the dossier output (gating rules)

**Three triggers must align before recommending this drill in the dossier:**

1. **One of the same triggers as the 5% Progression Game** is present (distance struggles, slice/fade dominant, previous notes flag distance work, OR Junior Elite Academy member).
2. **The player has at least passed 10% on the 5% Progression Game first.** Strategy work is wasted on a player who can't yet hit the number — fix execution before adding decision-making complexity.
3. **The player has access to Trackman, GCQuad, or a comparable launch monitor with a strokes-gained-vs-PGA-Tour database** (Trackman Range, indoor sim, or studio bay). Without the SG measurement, the drill loses its scoring sharpness — it can be approximated with proximity-only scoring, but the harsh PGA-Tour comparison is the teaching mechanism.

**Skill-level guardrail:** This drill is harsh. Strokes-gained scoring uses the PGA Tour baseline, which is brutally high. **Use it freely with elite players (Sunshine/Korn Ferry-tier amateurs, JEA leaders, scratch-and-better adults).** With club players, expect negative SG numbers across the board and consider running a softer proximity-only version instead so the player isn't crushed before they engage.

### The drill — setup and execution

**Tool:** Trackman app's **Random Shot Selector** (or GCQuad equivalent).

**Setup:**
- Same yardage range as the player's 5% Game (e.g., 75–150 for tournament-prep players)
- The app randomizes:
  - The **green** (each has different trouble locations — bunkers, water, run-off areas)
  - The **flag position** (front, middle, back; left, right, center; tight-to-trouble or middle-of-green)
- Player gets ONE shot per scenario, must choose the appropriate shot for that flag on that green
- Measured on **SG vs. PGA Tour baseline**

### The interactive coaching layer (this is what makes the drill work)

This is **not a silent test.** The coach asks questions before AND after each shot:

**Before the shot:**
- *"Where are we going to lose if we hit that?"* (consequence-of-miss thinking)
- *"Are you trying to play beyond/short of that flag?"*
- *"Biasing slightly left/right?"*

**After the shot:**
- Call the result number (carry distance + proximity to flag)
- Tie the result to SG — *"That's nearly half a shot gained"* / *"You've lost a fraction of a stroke"*
- Validate or challenge the choice — *"Exactly the right shot to play, even though the result wasn't perfect"* vs. *"That's where the aggression cost you."*

The coaching during the drill matters as much as the score. The player is learning a **decision-making framework**, not just collecting numbers.

### Sample scenarios (from the source video, illustrative)

These give a sense of the shape of the assessment:

- **112 yards to a front flag.** Player picks "full gap wedge ~120" — **correct shot**, slightly past the flag is the safe miss. Result: 119. Half a shot gained.
- **125 to a back-right flag.** Player goes gap wedge again, biases slightly left. Result: 8 feet. Nearly half a shot gained — perfect target selection AND execution.
- **90 to a tight-left flag halfway up the green.** Coach probes: *"Where are we going to lose?"* — answer: long-left. Player picks ¾ 56° aimed slightly right. Player gets aggressive, blows it 6 yards long-left → loses **portion of a stroke**. The lesson: aggression in the wedge zone costs more than it pays.
- **78 yards to a tight-left flag.** Player picks "less than a full lob wedge, ~75, aimed right of flag." Result: 10 feet. **Strokes gained.**

### The core teaching message (state this to the player explicitly)

**"Testing your STRATEGY is as important as testing your ability to control the golf ball."**

Three principles to drive home in the post-drill debrief:

1. **One aggressive miss in the wedge zone costs half a stroke.** Aggression in the 75–150 range is mostly negative-EV.
2. **The 75–150 mantra: par or better, give yourself makable chances, never make bogey.** This is a SCORING zone, not a HEROIC zone. The job is to land the ball in a place where two-putt par is automatic and the birdie putt is at least makable.
3. **Anti-aggression reality check.** *"Look at PGA Tour proximity averages — look at how close you actually need to hit it relative to the best players. It's not quite as close as you think."* Most amateurs over-rate the value of attacking pins because they over-rate how close pros hit it.

### Coaching application notes

- **Use as the second drill in a two-drill sequence** with the 5% Progression Game (5% Game first, this drill second once 5% is passing).
- **Use as a tournament-prep tool** the week of competition — same player, same yardage range as their event, gets reps at decision-making under measurement.
- **Re-run periodically** (every 4–6 weeks) and track SG total across sessions. Improving SG numbers = improving strategy, independent of swing improvement.
- **For club players who can't access Trackman:** approximate with proximity-only scoring on a real practice green (drop balls at random distances, pick a flag, score on average proximity in feet). Loses the harsh PGA-Tour comparison but keeps the strategy-coaching layer.

### Diagnostic shorthand for the dossier output

When all three gating rules are met:

1. **Recommend the drill as the Stage 2 of an approach-game assessment** (Stage 1 = 5% Progression Game).
2. **Frame the homework like this:** *"Run this with me at our next launch-monitor session. We'll work through 8–10 random scenarios in your tournament yardage range. The score isn't the point — the conversation about each shot selection is."*
3. **In the Game Diagnostic section**, note that strategy and target selection will be assessed separately from distance control.
4. **In the On-Lesson Probes section**, include: "Watch the player's pre-shot decision pattern — are they defaulting to 'attack the pin' or 'play to the safe side'? The default tells you whether their on-course strategy is aggressive or disciplined."

### When NOT to use this drill

- Player has no Trackman / launch-monitor access → use proximity-only version OR skip entirely.
- Player is still leaking strokes badly on the 5% Game (worse than 15% standard) → fix execution first, strategy work is premature.
- Player has bigger leaks elsewhere (driver penalties, short-game disasters, putting leaks) → those leaks return more strokes per practice hour. Strategy work is high-margin but high-skill-prerequisite.

---

## Pelz Short Game Bible — The Scoring Zone & Practice Allocation

**Attribution:** Drawn from Dave Pelz's *Short Game Bible* and supporting research. Pelz spent decades measuring amateur and tour-player short-game performance with mechanized testing devices and on-course statistical tracking. The frameworks below are his empirical conclusions, rendered in Ryan's operational coaching language. Pelz's body of work sits alongside Hugh (full-swing primary) and Altus (ball-striking diagnostic) as the third named source in this skill — the short-game complement.

### The central claim — the Scoring Zone

Pelz's most consequential empirical finding: **roughly 60–65% of strokes for amateur golfers happen inside 100 yards — including putts.** The exact percentage varies by handicap (higher handicaps lose even more strokes here), but the principle holds across every tier.

The corollary that drives Pelz's pedagogy: **amateurs allocate roughly 10–15% of practice time to this zone.** A 4-to-1 mismatch between where strokes are lost and where time is spent.

This is the leverage argument the skill should surface for any player whose:
- GIR is low AND scoring average is high → short-game salvage is the missing skill
- Stated weakness mentions wedges, chipping, bunkers, putting, or "shots between 40 and 100 yards"
- Self-described practice habit is "I hit the range and then go play" with no short-game allocation
- Goal is a handicap drop greater than ~3 strokes (technique-side ball-striking gains plateau; short-game gains compound)

**How to frame this in the player-facing Game Plan:** *"You're not losing strokes because you can't hit a 7-iron. You're losing strokes because the 8 shots you face inside 100 yards each round are mostly improvisation, not system. We're going to give you a system."*

### Practice allocation Pelz prescribes

| Distance band | % of typical round strokes | Recommended practice allocation |
|---|---|---|
| Tee shots (driver + long irons) | ~25% | 25–30% |
| Approach shots (>100 yds) | ~15% | 15–20% |
| Wedge shots (30–100 yds) | ~20% | 25–30% |
| Chip/pitch/bunker (under 30 yds) | ~15% | 15–20% |
| Putting | ~25% | 20–25% |

These are guidelines, not absolutes — adjust to the individual player's leak profile. A scratch player with poor lag putting needs more putting hours; a 20-handicapper who hasn't yet built a reliable wedge gap needs the wedge band. The principle is: **the practice mix should mirror or slightly over-weight where strokes are actually lost.**

### When to surface this section in the player's dossier

- Any player 8+ hcp whose stated practice habit is range-dominant
- Any player whose stated weakness names the scoring zone
- Any junior on the Junior Elite track (the practice-allocation conversation is part of long-term player development)
- Any player whose goal involves a sub-10 handicap (the next 3 strokes off the handicap are almost always in the scoring zone)

### Cross-references

This framing sits upstream of:
- **Pelz Wedge System** (the wedge-band practice prescription becomes concrete here)
- **Pelz Putting Framework** (the putting-band practice)
- **Pelz Scoring-Zone Practice Protocols** (the drills that turn allocation into skill)
- **Hugh's Short Game Framework — The Foundation Shot** (the technique that the practice allocation gives the player time to build)

---

## Pelz Wedge System — Clock-Based Distance Control + 4-Wedge Gapping

**Attribution:** The two pillars of Pelz's wedge instruction — a **swing-length system** (the "clock system") that controls distance without changing tempo, and a **4-wedge bag composition** that creates evenly-spaced yardage gaps from 30 to 110+ yards. Together they convert wedge play from improvisation into engineered distance precision.

### The Clock System — distance control through backswing length, NOT tempo

Pelz's central insight on partial wedges: **most amateurs try to control distance by swinging slower or harder, which destroys tempo and triggers deceleration.** The professional solution is the opposite — keep tempo constant, vary the *length* of the backswing.

Imagine the player standing in front of a clock face, viewed from down-the-line. The lead arm at address points at 6 o'clock. The three reference backswing positions are:

| Position | Lead arm position | Carry % of full |
|---|---|---|
| **7:30** | Lead arm low — roughly belt-high backswing | ~50% |
| **9:00** | Lead arm parallel to the ground | ~75% |
| **10:30** | Lead arm above parallel, hands at shoulder height | ~90% |

(A full wedge — lead arm to ~12, with full wrist set — is the fourth point. Most players actually need their 10:30 and full to be close together, since full-out is rarely the prescription.)

**The non-negotiable: same tempo at all three lengths.** The arms decelerate to the top, change direction, and accelerate through impact at the same rhythm regardless of backswing length. Distance comes from the size of the arc, not from swinging harder or softer.

### The 4-Wedge System — bag composition for yardage gapping

A 1-wedge or 2-wedge bag can't cover the scoring zone without enormous gaps that the player fills with improvised half-swings. Pelz's prescription: **four wedges, evenly gapped in loft (4–6° apart), each played at three swing lengths = 12 baseline yardages.**

Typical 4-wedge composition (adjust to the player's overall set makeup):

| Wedge | Loft | Approx 9:00 carry | Approx 10:30 carry | Approx full carry |
|---|---|---|---|---|
| PW (Pitching Wedge) | 44–46° | 75 yd | 95 yd | 115 yd |
| GW (Gap Wedge) | 50° | 65 yd | 80 yd | 100 yd |
| SW (Sand Wedge) | 54–56° | 50 yd | 65 yd | 85 yd |
| LW (Lob Wedge) | 58–60° | 40 yd | 55 yd | 70 yd |

(Yardages are illustrative — every player builds their own personal matrix on a launch monitor. Higher swing speeds shift everything 10–15 yards longer; juniors and slower-tempo players shift shorter.)

**The point of the matrix:** the player can hit any yardage from ~40 to ~115 by picking the wedge + clock position that lands in that range. No improvisation, no half-swings of indeterminate length, no fear of the in-between yardage.

**For the player who currently carries only 2 wedges (e.g., PW + SW, or PW + 58):** flag this in the dossier as a structural gap. Recommend fitting a third wedge (GW around 50°) before any technique work begins. The gap between 46° PW and 56° SW is roughly 25–30 yards — the exact range where most scoring-zone strokes are lost.

### Dead Hands / Quiet Wrists — the anti-deceleration philosophy

Pelz's diagnostic on the single biggest finesse-wedge fault: **deceleration through impact, caused by active hands trying to "guide" the shot.** When the wrists fire (flip) to add or subtract distance, the club face becomes unpredictable, the leading edge digs or skips, and the player decelerates because the body senses the strike is unsafe.

The Pelz prescription: **dead hands**. The wrists are passive carriers, not active producers. The shoulders and arms swing as one unit, the wrists hinge and unhinge with the natural arc, and the hands do nothing extra at impact. The trail palm "stays facing the target" through and past the strike — that's the feel cue.

**Diagnostic test for hand activity (use on lesson):** ask the player to hit a 9:00 wedge and finish their swing held — frozen at finish for 3 seconds. If they can't hold the finish, they decelerated. If the finish is high and balanced, hands were quiet.

**The decel-fear loop:** decel comes from fear that the shot will fly long; fear comes from not knowing the carry yardage; not knowing the yardage comes from not having a system. **The clock + 4-wedge matrix above is itself the long-term cure for deceleration** — once the player KNOWS that 9:00 with a GW carries 80, they stop trying to manipulate it mid-swing.

### Setup for the Pelz wedge (complements Hugh's Foundation Shot setup)

- **Stance narrow** — feet roughly 12–18 inches apart for a 9:00 wedge (narrower than full-swing stance)
- **Slightly open stance** — lead foot pulled back ~15°, helps the body rotate through and prevents the dreaded "stuck" feel
- **Ball position center to slightly back** of stance — encourages descending strike with stamped loft
- **Weight slightly forward** — 55/45 lead/trail at address; stays forward throughout (no pressure shift)
- **Hands slightly ahead of the ball at address** — pre-sets the shaft lean Pelz wants at impact
- **Grip down on the club** about a half-inch — increases control, slightly reduces effective shaft length and distance

The narrow open stance + center ball + slight forward press + dead hands = the canonical Pelz finesse-wedge address.

### How this section feeds the dossier output

When the questionnaire surfaces:
- "Poor distance control on wedges" → surface the **Clock System** as the diagnostic + prescription
- "Deceleration through impact" → surface the **Dead Hands** philosophy + the decel-fear loop reframe
- "Go-to club: only 1 or 2 wedges" → surface the **4-Wedge System** as a structural recommendation BEFORE any technique work
- "Inconsistent strike on wedges" → surface the setup section AND the Foundation Shot from Hugh (the Pelz delivery sits on Hugh's setup)

The On-Lesson Probes section for such players should include:
> "Pelz wedge audit:
> - How many wedges in the bag? (target: 4, evenly gapped 4–6° loft)
> - Does the player have a clock-based language for partial wedges? (7:30 / 9:00 / 10:30)
> - Frozen-finish test on a 9:00 wedge — can they hold the finish, or do they collapse? (collapse = decel)
> - Trackman partial-wedge dial-in session to populate the personal 12-shot matrix."

### Framework Selection Rubric — Pelz Wedge System vs. Hugh's Wedge System

Both Hugh and Pelz teach a partial-wedge architecture. They are not contradictory — different vocabularies for similar mechanics. Pick based on the player's primary leak:

| Use Pelz when | Use Hugh when |
|---|---|
| Player's primary leak is distance precision (e.g., consistently short or long on 40–100 yard shots) | Player's primary leak is strike quality (chunks, blades, inconsistent contact at any distance) |
| Player has no swing-length language at all — improvising every wedge | Player has a system but the technique inside the system is breaking down |
| Player has 1 or 2 wedges and needs the structural argument for a 4-wedge bag | Player has a full bag but is hitting them poorly |
| Coach wants to install distance precision as the FIRST upgrade | Coach wants to install strike quality as the FIRST upgrade |

When in doubt: **Pelz for distance, Hugh for strike.** Often a player needs both — sequence Pelz first (gives them the system to be IN), then Hugh's Foundation Shot to make the strikes inside that system clean.

---

## Pelz Bunker Framework — The Splash Method

**Attribution:** Pelz's bunker technique, distilled from on-tour and amateur testing. Complement to Hugh's Bunker Framework — same conclusions on the high-level principles, slightly different vocabulary and emphasis. Use whichever the player's prior teaching aligns with; switching vocabularies mid-stream confuses more than it helps.

### The single most important principle — hit the SAND, not the ball

Pelz's diagnostic for the leave-it-in-bunker miss: **the player is trying to hit the ball.** A greenside bunker shot is the one full-swing shot in golf where the clubface should *not* contact the ball directly. The sand is the medium that lifts the ball out.

The cue: **draw a 2-inch line in the sand under the ball, and hit that line.** Where the line is, that's where the leading edge of the club enters. The ball comes out on a cushion of sand, not from clubface contact.

### Setup — open everything

Pelz's setup checklist, in order of importance:

1. **Open the clubface FIRST**, then take the grip. (If you take the grip first and then try to open the face, your wrists rotate it back closed at impact.) The face should be aimed ~20° right of the target for a right-handed player on a standard greenside shot.
2. **Open the stance** — feet aligned 15–20° left of the target line. The combination of open face + open stance creates the out-to-in swing path that splashes the sand correctly.
3. **Dig the feet in** to the sand for stability — this also lowers your strike point so you naturally hit BEHIND the ball.
4. **Ball position forward** in the stance, roughly off the lead heel. This pre-sets the bottom of the arc to land behind the ball.
5. **Weight slightly forward** — same as the wedge setup; do NOT hang back trying to "help" the ball up. The open face does the lifting.

### The swing — accelerate through

The non-negotiable Pelz mantra for bunkers: **accelerate through the sand.** A decelerating bunker swing leaves the ball in the bunker every time. The follow-through should be at least as long as the backswing — the most common amateur fault is a long backswing and a short, decelerated follow-through.

Swing length: a typical greenside bunker shot from a good lie is a 9:00 to 10:30 backswing position (per the clock system). The longer the shot, the longer the backswing — same as any wedge. But ALWAYS at full tempo on the way down, with a full finish.

### Diagnostic triggers for the dossier

Flag the player for this framework when:
- Bunker comfort score is below 5/10
- Stated mistake includes "leave it in the bunker"
- Player describes bunker shots as "the worst part of my game"

The On-Lesson Probes section should include:
> "Pelz bunker audit:
> - Does the player open the FACE first, then grip? Or do they grip first and rotate? (face-first is correct)
> - Open stance (feet 15–20° left)? Feet dug into the sand?
> - On a sample shot, does the follow-through finish high and complete? Or does it stub short? (stub = decel = leave it in)
> - Where does the divot start? Behind the ball, or at the ball? (behind = correct)"

### Framework Selection Rubric — Pelz Bunker vs. Hugh's Bunker Framework

Both teach the same principles. Choose based on:
- **The player's prior teaching language** — if a previous coach taught them "splash," stay with Pelz vocabulary; if "Foundation Shot" or Hugh's terms, stay with Hugh.
- **Severity of fear** — if the player describes high fear/avoidance of bunker shots, Pelz's "hit the line, ball is incidental" reframe is often more freeing than a mechanical Hugh breakdown.
- **Equipment context** — if the player has no SW or is using a low-bounce wedge in a soft-sand bunker, surface the equipment issue first (Pelz's wedge-fit guidance) regardless of which technique framework you use.

---

## Pelz Putting Framework — The Big Three

**Attribution:** Pelz's putting research is the most extensive empirical work in golf instruction history (literally millions of measured putts across decades). Three findings have outsized practical impact for amateur improvement and form the spine of Pelz's putting instruction.

### Big Three #1 — Distance control is more important than line

Pelz's data: among amateurs, the strokes lost to mis-read green is roughly 1/3 of the strokes lost to mis-paced putts. **Speed/distance control eliminates 3-putts; line accuracy at best converts a few more 1-putts.** The leverage is overwhelmingly on the distance side.

Practical coaching implication: for ANY amateur leaking strokes on the green, **start with distance control drills, not green-reading work.** Green-reading is the next 1–2 strokes per round after distance control is reliable.

The standard distance-control drill:
- 9 balls, 30 feet from the hole
- Goal: every ball finishes within a 3-foot radius of the hole (in front or behind, doesn't matter)
- Progress to 40 feet, then 50 feet
- The "ladder" drill — 3 balls each at 20, 30, 40, 50 feet — is a faster diagnostic version

### Big Three #2 — The 17-inch optimal pace

Pelz's testing showed that the optimal *speed* for a putt is one that would carry the ball **17 inches PAST the hole** if the hole weren't there. Not "die at the hole" (too slow, mis-reads pull off line in the last 6 inches as gravity dominates), not aggressive (too much break read, lip-outs become common). 17 inches past is the speed where the ball "takes the break" cleanly but isn't catapulting through the line.

Practical coaching cue: **"see the ball stopping 17 inches past the hole — make a stroke that does that."** It reframes putting from "trying to make it" to "trying to control speed." Counterintuitively, more putts go in once the player stops trying to make every one.

### Big Three #3 — The fork drill (face control)

For face control on short putts (5 feet and in), Pelz developed a drill using a fork (or any two thin parallel rods) set just outside the heel and toe of the putter at address. The drill:
- Set up 5 feet from the hole
- Place the fork so the putter head can pass through it without touching either prong
- Make 10 putts in a row through the fork

Misses tell you what's wrong:
- Hit the heel-side prong → swinging the putter outside-in (face open at impact)
- Hit the toe-side prong → swinging the putter inside-out (face closed at impact)
- Clean passes but the ball misses left or right → face alignment at address is off; check setup

The drill develops both face control AND the player's awareness of their natural putter path.

### Setup for the Pelz putting stroke

- **Eyes directly over the ball** — Pelz tested this rigorously. Eyes inside or outside the ball line shift the player's perceived target line by 1–3 feet on a 20-foot putt.
- **Hands slightly forward of the ball** — pre-sets a slight forward shaft lean; promotes a slight downward strike that gets the ball rolling end-over-end fast.
- **Stance shoulder-width** — narrower for short putts, slightly wider for lag putts. Stability matters; stylistic preference accommodated within reason.
- **Pendulum stroke driven by shoulders, not wrists** — the wrists do nothing actively (same dead-hands principle as wedges). The shoulders rock the triangle (lead arm + trail arm + shaft) back and through as one unit.

### Diagnostic triggers for the dossier

Flag the Pelz Putting Framework when the questionnaire surfaces:
- Long-putt confidence (25+ ft) is under 6/10 → distance-control drills are the prescription
- 3-putt frequency mentioned in mistakes/weaknesses → distance control AGAIN, plus 17-inch pace cue
- Short-putt confidence (under 5 ft) is under 6/10 → fork drill + face control
- "Yips" mentioned anywhere → handle with care; Pelz has yips-specific protocols but those are coach-only territory, not skill-output content
- "Green reading" listed as the struggle → distance-control work FIRST (better speed = forgiving reads); systematic pre-putt routine SECOND

The On-Lesson Probes for these players:
> "Pelz putting audit:
> - 9-ball drill at 30 ft — how many finish inside 3-ft radius?
> - On a putt that misses, was the speed right? (player needs to learn to self-assess pace independent of line)
> - Eyes-over-ball check (drop a ball from the bridge of the nose, should land on the line)
> - Short-putt fork drill — clean 10 in a row at 5 ft? If not, which prong gets hit?"

### Framework Selection Rubric — Pelz Putting vs. (no current Hugh putting framework)

Hugh's current corpus in this skill does NOT have a deep putting framework — Pelz is the default for putting work. If/when Hugh's putting content is added, position Pelz as the empirical/distance-control side and Hugh as the technique/feel side. For now, all putting prescriptions in dossier outputs draw from Pelz.

---

## Pelz Scoring-Zone Practice Protocols

**Attribution:** Pelz's drills and skills tests for the scoring zone. These complement Hugh's "Practice Strategies — Short Game Family" (below) by adding distance-control-specific and stat-tracking drills. Use both libraries; they're additive, not competing.

### Drill 1 — The wedge matrix dial-in

The foundation Pelz drill for any player adopting the 4-wedge clock system:

1. On the range with a launch monitor (Trackman, Foresight, etc.) and all 4 wedges
2. Hit 10 shots at 7:30 with each wedge → record median carry
3. Repeat at 9:00 → record median carry
4. Repeat at 10:30 → record median carry
5. Write the resulting 12 numbers on a card the player carries in the bag (or in the portal wedge matrix tool)

The card becomes the player's personal scoring-zone reference. On-course, they pick the wedge + clock position whose number matches the carry needed. This is the practice protocol that turns the Pelz Wedge System from theory into a live skill.

Re-test every 6 weeks — yardages drift as technique evolves, conditioning changes, and season progresses.

### Drill 2 — The 50-yard ladder

A distance-control test for wedges between 30 and 70 yards:

1. Set 5 landing zones at 30, 40, 50, 60, 70 yards (use towels or flags as targets)
2. Hit 3 shots to each landing zone with the appropriate wedge + clock position
3. Score: 3 points if all 3 land in the target zone, 2 points if 2 do, 1 if 1, 0 if 0
4. Max score = 15. Track over weeks.

The drill is diagnostic AND game-like. Juniors especially respond to the scoring.

### Drill 3 — The 30-foot 9-ball lag test (putting)

The canonical Pelz distance-control test for putting:

1. 30 feet from a hole on a flat or slightly sloped green
2. Hit 9 balls
3. Score: number of balls that finish within 3 feet of the hole
4. Tour-pro benchmark: 7 of 9. Single-digit handicap benchmark: 5 of 9. 10–20 hdcp: 3 of 9.

Track the number over weeks. The single most diagnostic short-game metric a player can track for improvement.

### Drill 4 — The 5-foot fork challenge (putting)

Per the Big Three #3 above:

1. Set the fork 5 feet from the hole, allowing the putter head to pass through
2. Hit 10 putts in a row
3. Score: 10/10 = ready; below 10/10 = continue daily

The drill is uncompromising and therefore high-leverage — most amateurs have never made 10 in a row from 5 feet, which itself is a diagnostic.

### Drill 5 — The Up & Down challenge (chip + putt)

A full short-game test that pressure-checks chip distance control AND short putting:

1. Drop 10 balls in various lies around a practice green (in greenside rough, in the fringe, in a bunker, on the apron, etc.)
2. The goal for each ball: chip it close, then 1-putt for an up-and-down par save
3. Score: number of up-and-downs out of 10
4. Tour benchmark: 7/10. Scratch benchmark: 5/10. 10–20 hdcp benchmark: 2–3/10.

This is the single best test for "are my short-game improvements showing up on the scorecard?"

### How to surface these drills in the dossier

When the player's leaks point to scoring-zone work:
- Prescribe Drill 1 (wedge matrix dial-in) FIRST for any player without an established personal wedge matrix
- Prescribe Drill 3 (9-ball lag test) as the baseline putting test — log the number, retest in 4 weeks
- For juniors, prescribe Drill 5 (Up & Down) as the season-long tracking metric — it gamifies short-game improvement and produces a real number that goes up over time
- For tournament-prep players, all five drills become the weekly short-game practice circuit

---

## Practice Strategies — Short Game Family

**Attribution:** Hugh's short-game practice and skills-test toolkit. Sister to the Approach Game Family above. Companion to the Short Game Framework (Foundation Shot) — that framework teaches the player HOW to chip; these drills test, develop, and gamify the skill.

**Junior emphasis:** these drills are explicitly designed to engage juniors through gamification, scoring, and problem-solving. They are also core building blocks of the future **2.5-hour Short Game Clinic Blueprint** (see Short Game Framework section above and task #43).

### When to surface this family in the dossier output (gating rules)

Surface a drill from this family in the dossier when ONE of these triggers is present:

1. **Short game flagged as a weakness** in the questionnaire (low save percentage, comfort scores under 5/10 on chip/pitch/bunker, "different chip for every situation" pattern).
2. **Junior Elite Academy player** — gamified short-game practice is a default development priority.
3. **Player working on scoring** (10+ handicap with short-game leakage).
4. **Player explicitly mentions short-game struggles** (chunked chips, bladed shots, can't pick a landing spot).

**Per discipline rules: pick ONE drill maximum per dossier.** Match to the player's specific leak — don't recommend the whole family.

### Drill 1 — Fill the Basket (Hugh's favorite informal short-game drill)

**Setup:** 16 balls in a range basket. Stand near the green.

**The drill:**
1. Throw the balls into random locations around the green.
2. For each ball, pick a target on the green.
3. Hit the chip.
4. **Within 3 feet of the target (one club length):** ball goes back in the basket.
5. **Outside 3 feet:** throw or kick the ball off in another direction — you have to play it again from a new lie.
6. **Goal:** fill the basket in as few shots as possible.

**Why it works:**
- **Gamified scoring** — the "fill the basket" goal turns practice into a competition with yourself.
- **Variable scenarios** — random throws produce random lies, slopes, and target distances. Mirrors the course.
- **Failure penalty is more practice** — missed shots return you to a worse lie, doubling the learning value of every miss.

**Junior fit:** this is the highest-engagement short-game drill in the family. The competition + the increasing-difficulty penalty keeps juniors locked in for 30+ minutes when traditional practice loses them in 10.

### Drill 2 — The 33s (Hugh's favorite formal scoring test)

**Three nested three-ball games.** Formal — keep score. Build the player's "scoring game handicap" (Hugh's term for the proximity baseline per shot type).

#### Why three-ball games matter (Hugh's coaching reasoning)

1. **Reflects the variable nature of the course** — infinite change, never the same shot twice.
2. **Identifies the player's superpower shots** — which clubs and which flights they're genuinely good with, vs. which to stay away from on the course.
3. **Builds the scoring game handicap** — a measurable proximity baseline per shot type that the player tracks across sessions.

#### 33s Game A — Three Different Clubs to the Same Target

- Pick three wedges — typical: 60°, 56°, 52°.
- Same target.
- Hit one ball with each wedge.
- Measure proximity for each shot.
- Get an average.
- **Track which club tends to be closest at that distance — that's your superpower club for that range. Take it to the course.**

#### 33s Game B — Same Club, Three Different Flights

- Pick one wedge.
- Same target.
- Hit three different trajectories: **low / mid (foundation shot) / high (added loft)**.
- Measure proximity for each.
- **Track which trajectory you're best with — that's your superpower flight from this lie.**

#### 33s Game C — Good, Bad, Ugly (three different lies)

- Drop three balls within 18 inches of each other.
- Three fundamentally different lies: **a reasonably good lie / a horrible lie / something in between.**
- Same target.
- Tests **problem solving** AND **lie reading** (Hugh's emphasis: "It's a great way of teaching your students lie reading").
- Hugh's note: *"This is the most fun part — some of the lies get ridiculous."*

**Coaching application:** keep a running total across all three games. Track session-to-session improvement on the scoring game handicap. The player's "superpower shots" become their go-to under pressure on the course; the "weak shots" become the homework target.

### Drill 3 — Torture Practice (informal problem-solving drill)

**Hugh's words:** *"When I'm feeling particularly nasty with students."* End-of-session drill — uses the mess that's already on the green from a long session.

**Setup:** 6 balls. Player throws them into:
- Unrepaired divots
- Unraked bunkers
- Other terrible lies left from the session

**The drill:** play each ball.

**What it's NOT testing:** proximity to the hole. Don't keep score on closeness.

**What it IS testing:** the player's ability to **problem-solve** when normal technique can't apply. Buried bunker lies, divot lies, and chewy roughs all require different adaptations of the Foundation Shot. The drill stimulates the thinking process.

**Coaching application:** ask the player to verbalize the adaptation BEFORE each shot. *"What are you going to do differently?"* Connects directly to the Short Game Framework's three problem-solving questions (loft / speed / angle of attack).

### Drill 4 — Ghost Hole for Landing Spots (training-aid drill)

**Hugh's caveat first:** *"Not all good chippers rely on landing spots, but for those that do, this is an excellent drill."* If the player is a feel chipper who doesn't think in landing spots, this drill won't unlock anything. If they're a structured chipper who thinks in zones, this drill is gold.

**Setup:** a "ghost hole" training aid (a marker / target / plate) placed where the player wants to LAND the ball — NOT where they want it to finish.

**Scenario example:** short-side flag, ~12 yards. Player has to identify the right landing spot for the chosen shot (lower lofted = land farther back; higher lofted = land closer to the flag).

**The drill:**
1. Player identifies where they want to pitch the ball.
2. Place the ghost hole at that spot.
3. Player makes the swing.
4. **Three feedback points** the coach surfaces:
   - Where the player THOUGHT they'd pitch it
   - Where it ACTUALLY pitched
   - Where it FINISHED relative to the hole

**What it teaches:** cause-and-effect awareness of trajectory + green type + landing spot relationships. Different green firmness + different trajectories = wildly different roll-outs. The player builds the mental model.

### How to use this family in the dossier output

Per discipline rules, **recommend ONE drill maximum per dossier**:

- **Player's short game is structurally weak (no consistent shot, low comfort scores)** → Fill the Basket. Engagement-led, gamifies the skill from zero.
- **Player has decent short game but needs measurable benchmarks** → The 33s. Formal scoring builds the scoring-game handicap and identifies superpowers/weak spots.
- **Player has good technique but freezes on tough lies** → Torture Practice. Trains problem-solving on adverse lies specifically.
- **Player is a structured (non-feel) chipper who needs landing-spot precision** → Ghost Hole. Builds cause-and-effect awareness.

**Recommendation language for the dossier:**
- *"Run [drill name] three times before our next session. Bring me your score. We'll target the weakest shot type in the lesson."*
- *"For [The 33s]: keep a running scoring-game-handicap log. We're tracking session-to-session improvement, not single-session score."*

**On-Lesson Probes block (when triggered):**
> "Short game practice diagnostic:
> - Has the player been running their assigned drill between sessions? Score progression?
> - For The 33s: superpower shot identified? Weak shot identified? Practice plan adjusted accordingly?
> - For Fill the Basket / Torture Practice: engagement and problem-solving observed during drill execution?"

### Cross-reference cluster

- **Short Game Framework — The Foundation Shot** (sister coaching framework) — the Foundation Shot is what these drills test and develop.
- **Future 2.5-Hour Short Game Clinic Blueprint** (placeholder in Short Game Framework) — Fill the Basket and The 33s are core clinic segments; Torture Practice fits as a problem-solving capstone.
- **Pressure Points Framework** — pressure-shift fundamentals from Pressure Points are required for clean execution in all of these short-game drills.

### Future expansion

More short-game drills will be added as Hugh ships them (specialist-shot games, distance-wedge games, bunker-specific drills, putting-integration drills). Each will integrate into both the player's practice prescription system AND the clinic blueprint.

---

## The Tiger 5 — Course Management Mental Scorecard

The Tiger 5 is a course management framework revealed by Scott Fawcett (founder of DECADE Golf) on the *On the Mark* podcast with Mark Immelman. Fawcett explained that Tiger Woods used this personal mental scorecard system during tournaments to track avoidable errors. Tiger's benchmark: 6 or fewer of these events in a 4-round tournament (roughly 1.5 per round), and he figured he would win.

**The 5 avoidable errors Tiger tracked:**

1. **Bogey or worse on a par 5** — Par 5s are scoring holes. A bogey here means a missed opportunity and typically signals a strategic error (greed off the tee, wrong layup zone, poor wedge target).

2. **Big number (double bogey or worse)** — One double derails momentum and requires two good holes just to get even. Avoiding big numbers is the single biggest score differential between skill levels.

3. **Blown easy save (failed up-and-down from easy position)** — When the ball is within 15 yards of the green in a good lie, the goal is always on the green, ideally the middle. A two-chip error or a skulled chip is an avoidable waste of a stroke.

4. **Three-putt** — Poor distance control or missed short putts. Every three-putt is a wasted shot from a position where a two-putt was completely achievable.

5. **Bogey with a scoring club (9-iron or shorter) on approach** — When a player has a 9-iron or less in hand, making bogey is almost always a mental/strategic mistake: aiming at a dangerous pin, not committing, or poor target selection. The fat part of the green is always the right call.

**How to use the Tiger 5 with the profile:**

- Cross-reference each of the 5 with the student's answers in Sections 4, 5, and 6.
- If a student reports poor short game save percentage → Tiger 5 #3 is a priority.
- If they report frequent 3-putts → Tiger 5 #4 is leaking strokes every round.
- If they report making bogeys with short irons → Tiger 5 #5 = strategic/mental issue, not technique.
- If they report making big numbers frequently → Tiger 5 #2 = disaster shot elimination first.
- If par 5s are not scoring holes for them → Tiger 5 #1 = course management mindset shift needed.

**For mid-to-high handicappers:** Reframe the Tiger 5 to match their skill level:
- #1: No double bogey on par 5s (net bogey is fine)
- #2: No triple bogey or worse anywhere
- #3: Get it on the green in one chip from easy positions
- #4: No 3-putts from inside 20 feet
- #5: Hit the green (anywhere) when holding a 9-iron or less

**Coaching application:** Introduce the Tiger 5 as a mental scorecard the student can use during play — not to track score, but to track decision quality. It shifts focus from "how did I swing?" to "did I make smart decisions?" This is a Vision54 Human Skills application embedded in a course management tool.

---

## Priority Ranking Logic (Strokes-Gained Framework)

Rank improvement areas using this hierarchy for amateur players:

1. **Eliminate disaster shots** (OB, lost balls, penalty areas) — biggest score savers
2. **Short game fundamentals** (if 10+ hdcp) — highest stroke-per-session ROI
3. **Putting distance control** — eliminates 3-putts, fastest green improvement
4. **GIR improvement** — approach consistency, requires stable long game first
5. **Short putt conversion** — confidence builder, critical for scoring
6. **Driving accuracy** — only address after short game has improved or for lower hdcp
7. **Distance / power** — last priority unless player is 240+ and making good contact

**For lower hdcp (0–9):** Reverse the emphasis — approach game and SG metrics drive scores more than short game conversion.

---

## Dossier Length and Discipline Rules (READ BEFORE GENERATING ANY DOSSIER)

The dossier is for Ryan's eyes — it informs his lesson, it doesn't replace it. **Bloated dossiers are unread dossiers.** Ryan does not want to spend his life reading dossiers; he wants to spend it coaching. Ruthlessly observe these limits or the entire skill loses its value.

### Total length cap

A complete dossier (all 5 sections) should fit in a **2–3 page PDF**, dense and actionable. Reading time target: **90 seconds**. If your draft exceeds 3 pages, cut.

### Per-section hard limits

1. **Player Snapshot:** ONE paragraph, 3–5 sentences max. Who is this person and what do they want.
2. **Game Diagnostic:** Five sub-sections (Long Game / Approach / Short / Putting / Strategy), **2–4 sentences each**. Total: ~20 sentences max. Cut anything that's not a flag or a key strength. Do not interpret data the player didn't provide.
3. **Priority Order:** Maximum **5 items**, ranked. ONE sentence rationale each.
4. **Session 1 Coaching Plan:** Maximum **3–5 focus areas**. Each area: what to address (1 sentence), why it matters for THIS player (1 sentence), one drill or cue (1 sentence). Per area total: **3 sentences**.
5. **On-Lesson Probes:** Maximum **4–6 probes total**. NOT "every framework's full checklist." Pick only the probes most relevant to the player's flagged issues.

### Hugh framework discipline (this is where dossiers most often bloat)

**The Hugh frameworks INFORM the dossier; they do NOT BECOME the dossier.** Ryan already knows the frameworks. The dossier just tells him which one to apply to this specific player.

**Pick ONE protocol max per dossier.** If a player triggers both the Slice Protocol AND the Speed Framework, pick whichever is more impactful for their stated goals. Mention the other briefly only if it's a genuine secondary priority. Never recap both in full.

**Pick ONE practice strategy max per dossier.** Not both 5% Game AND Trackman SG — pick the one that fits the player's tier and access. The other can be mentioned in one sentence as "future addition once X is in place."

**Reference frameworks; don't recap them.** Acceptable: *"Run the Slice Protocol Stage 1 (closed-face grip change)."* Unacceptable: *"In Stage 1 of the Slice Protocol, we have the player turn the leading edge of the club to the left, then take their grip on the closed face, which produces strong-left shots that..."* — Ryan knows what Stage 1 is. Just name it.

**Setup baselines collapse to ONE probe block.** Pick the 3–5 most relevant markers across all three baseline sections (lower body, lever system, upper body) and put them in a single On-Lesson Probes bullet. Do NOT generate three separate probe blocks for the three views.

**Never generate "what's coming in later parts" or "see also" framework lists in the dossier itself.** Those belong in the skill's reference content, not in the player's dossier.

### Trigger gating reminder (also covered in each framework section)

Most framework sections in this skill say explicitly: "only surface in the dossier if X trigger is present." **Honor those gates.** If the trigger is absent, the framework does NOT belong in the dossier — even if you "could" find a way to relate it to the player.

### What "good" looks like

A good v14+ dossier:
- Fits in a 2-page PDF
- Takes Ryan 90 seconds to read end-to-end
- Names 3–5 priorities tied directly to what the player flagged
- Recommends ONE protocol and (if appropriate) ONE practice drill
- Plants 4–6 on-lesson probes Ryan will actually run

A bad dossier:
- Spans 5+ pages
- Recaps Hugh frameworks the coach already knows
- Lists every probe from every framework section
- Recommends 8 things to work on this session
- Reads like a textbook rather than a coaching plan

When in doubt, **cut**. The player is paying for Ryan's coaching, not a printout.

---

## Output Format

**Default output is always a formatted PDF.** After producing the analysis, generate a print-ready PDF using the RR Golf brand style below. Do not deliver a text-only report — always end with a PDF file the user can download.

**Before generating, re-read the "Dossier Length and Discipline Rules" section above.** Hard limits per section apply. Reading time target: 90 seconds. PDF page target: 2–3 pages. If the draft exceeds these, cut.

Produce the following 5 sections in order. Use Ryan's voice: direct, warm, coach-to-student.

### 1. Player Snapshot
One paragraph. Who is this person? What's their golf story? What do they want?

### 2. Game Diagnostic
Go section by section (Long Game → Approach → Short Game → Putting → Course Strategy). 2–4 sentences per section. Interpret the data, don't just repeat it. Flag every red flag.

### 3. Priority Order
Numbered list. Most impactful area first. Brief rationale for each.

### 4. Session 1 Coaching Plan
3–5 focus areas. For each: what to address, why it matters for this player, and one or two specific drills or cues grounded in best practices.

### 5. On-Lesson Probes
4–6 questions or observations Ryan should gather during the lesson that the form can't answer (e.g., posture, grip, tempo, pre-shot routine, emotional state under pressure).

---

## PDF Design Spec — RR Golf Brand Style

All PDFs must follow this visual system exactly. Do not deviate for any report type.

### Brand Colours
```
NAVY       #0A1628   — primary background, header bar, table accents
NAVY_MID   #1A2E4A   — secondary navy for drill strips
NAVY_LIGHT #2C4A6E   — tertiary navy
GOLD       #C9A84C   — accent colour: rules, numbers, cue labels, priority lines
WHITE      #FFFFFF   — page background (keep white for printing)
LIGHT_BG   #F7F8FA   — card/cell backgrounds
MID_GREY   #8A9BB0   — meta text, footer text
DARK_TEXT  #1A1A2E   — body copy
RULE       #DDE3EC   — light divider lines
```

### Page Layout
- Paper: Letter (8.5 × 11 in)
- Margins: 0.65 in left/right, 0.85 in top, 0.65 in bottom
- Font family: Helvetica (built-in ReportLab — no external fonts needed)
- Library: `reportlab` (always use platypus + canvas for layout)

### Header (every page)
- Full-width navy bar, 0.55 in tall
- Left: **RR GOLF** in white Helvetica-Bold 10pt
- Right: `madriverpro.com` in MID_GREY 8pt
- Gold rule (1.5pt) under the bar

### Footer (every page)
- Full-width RULE colour bar, 0.45 in tall
- Centred: `Ryan Rinneard · Director of Instruction · Mad River Golf Club · Page N`

### Section Labels
- Small caps style: Helvetica-Bold 7pt, GOLD, letter-spacing 1.5, e.g. `PLAYER SNAPSHOT`
- Followed by a section title in Helvetica-Bold 13pt NAVY

### Gold Rule Divider
- 1.5pt gold line used after the main document title
- 0.5pt RULE-colour light lines between sections

### Player Meta Strip
- Single-row table spanning full width
- LIGHT_BG background, 7pt padding
- Fields: Player Name (bold, 11pt NAVY) | Handicap | Goal | Experience | Coach (right-aligned)

### Priority Cards (3-up grid)
- 3 cards per row, each 2.3 in wide
- LIGHT_BG background, 2pt GOLD line at top
- Large gold number (18pt), bold title (10pt NAVY), body text (8.5pt)

### Focus Area Blocks (Session Plan)
- Header row: large gold number (20pt) + bold title (12pt NAVY) + TAG badge (navy bg, white text, right-aligned)
- "Why it matters" body paragraph
- DRILL strip: NAVY_LIGHT left cell (label), LIGHT_BG right cell (text)
- CUE line: gold label + italic navy text
- 0.5pt RULE divider between each block

### Tiger 5 Table
- 3 columns: navy number cell | title + description | risk badge
- Risk badges: red `#C0392B` for HIGH RISK, green `#27AE60` for MANAGEABLE
- 0.5pt RULE dividers between rows

### On-Lesson Probes
- Gold arrow (→) left column, bold label + body text right column
- No background — clean white

### Closing Block
- Full-width LIGHT_BG cell
- Italic NAVY_MID text, 3pt GOLD left border
- Coaches summary sentence wrapping up the session intent

### Output filename conventions
- Session 1 plan: `[firstname]_session1_plan.pdf`
- Multi-session arc: `[firstname]_[N]week_arc.pdf` — e.g. `sunny_6week_arc.pdf`

Save all files to `/mnt/user-data/outputs/` and present with `present_files`.

---

## PDF 2 — Multi-Session Arc

After delivering the Session 1 plan, always offer to build the multi-session arc PDF. This is a second, separate document. Default arc length is 6 sessions for low-handicap players (0–9); 4 sessions for mid-to-high handicap players (10+).

### Arc PDF Contents (in order)

**1. Title Block + Player Meta Strip**
Same style as Session 1 plan. Title: `[N]-Week Coaching Arc`. Include start handicap, target, number of sessions, coach name.

**2. Arc Overview**
One paragraph in Ryan's voice. What is this player capable of? What's leaking strokes? What does this arc fix? Frame it as a shared journey, not a curriculum.

**3. Three Running Themes**
Extract 3 overarching themes that run across all sessions (e.g. Technical Precision / Routine & Mental Game / Course Management). Present as a 3-card colour-coded row with gold, navy-mid, and navy-light top borders.

**4. Week-by-Week Session Breakdown**
One block per session. Each block contains:
- Week number (large gold) + Theme name + Session subtitle
- **Primary Focus** — the main technical or mental work for that session
- **Secondary Focus** — supporting area addressed in same session
- **Between-Session Practice** — 3 specific assignments the student does independently
- **Tiger 5 Focus** — which of the 5 errors to prioritise tracking that week
- **Ready to Progress When** — a clear, observable checkpoint (green text)
- **Measure** — the specific stat(s) to track that week

**Progression logic for session sequencing:**
- Sessions 1–2: Diagnose and lock in foundations (technique + routine)
- Sessions 3–4: Precision and short game (distance gapping, bunker, chipping)
- Session 5: On-course integration (playing lesson or on-course session preferred)
- Session 6: Reassess, measure, plan next arc

**5. Progress Markers Table**
6 key metrics. Columns: Metric | Current State (red) | 6-Week Target (green) | Why It Matters.
Standard metrics to include: Fairways Hit, GIR per Round, Putts per Round, 3-Putts per Round, Tiger 5 Count, plus one player-specific metric from their profile.

**6. Practice Principles**
4 principles in a 2×2 card grid (LIGHT_BG background, gold top rule):
- Purpose over Repetition
- Routine on Every Shot
- Quality over Quantity
- Transfer to the Course

**7. Tiger 5 Tracking Grid**
Print-ready table. Rows: all 5 Tiger events. Columns: Week 1–6 (blank fill-in cells) + total row with ≤6 target noted. Student prints this and brings it to every session.

**8. Closing Commitment Block**
Full-width LIGHT_BG cell, gold top rule, italic navy text. Ryan's voice — personal, warm, direct. End with coach credentials line (CPGA Class A · TrackMan · TPI G3 · Vision54).

### Arc PDF Style Notes
- Same brand colours, header, footer as Session 1 plan
- Use `PageBreak()` before the Progress Markers section
- Week blocks use `KeepTogether()` to avoid mid-block page breaks
- Progress markers table uses alternating row backgrounds (WHITE / LIGHT_BG)
- Tiger 5 tracking grid has a `LINEAFTER` separator between the event name column and the week columns

### Arc PDF Reference Script
See `references/arc_template.py` for the working Python implementation. Adapt player data at the top of the file — do not rebuild the layout from scratch.

---

## PDF 3 — Complete Player Dossier

The dossier is the master document — the full picture of a player in one place. It combines the diagnostic, the plan, the Tiger 5 profile, and the goals contract into a single premium deliverable. Offer this after the Session 1 plan and Arc are built, or when a player is starting a full coaching engagement.

### Dossier PDF Contents (in order)

**1. Cover Page (print-friendly white background, drawn via canvas callback)**
- White background — keep it print-friendly, never full-bleed navy
- Navy header bar (0.75 in tall) at top with gold accent line underneath
- RR GOLF wordmark white in header; madriverpro.com right-aligned in grey
- PLAYER DOSSIER label in gold below header, with 1.5pt gold rule underneath
- Player name in large navy type (52pt), gold underline rule beneath name
- Sub-line in NAVY_LIGHT: handicap, goal, years playing
- Credentials badge top-right: LIGHT_BG rounded rect with navy border, listing all credentials
- Light RULE divider above bottom section
- Bottom: coach name (navy bold), club + date (grey), "Confidential" right-aligned
- No platypus content on this page — all drawn by `cover_page()` canvas callback
- Implementation: `on_page()` checks `doc.page == 1` and routes to `cover_page()` vs `inner_page()`
- **Critical:** Do NOT add a Spacer before the first PageBreak — the cover is canvas-only

**2. Player Identity**
- Section label + heading
- Two paragraphs: golf story + what the gap really is
- Quick-stat row: 5 metrics in a card strip (Current Handicap, Years Playing, Drive Distance, GIR, Target)
- Stat cards use large gold numbers (32pt) with small grey labels

**3. Skill Map**
- Radar chart (hexagon, 6 dimensions) drawn with `SkillRadar` Flowable using canvas paths
- Dimensions: Long Game, Approach, Short Game, Putting, Course Mgmt, Mental Game
- Scores 0–10 derived from profile data (not just raw slider values — interpreted)
- Right column: horizontal `RatingBar` flowables for each dimension with colour-coded score
  - ≤3 = red, ≤5 = amber, ≤7 = blue, 8+ = green
- Radar and rating table sit side-by-side in a 2-column layout

**4. Full Game Diagnostic**
- One block per questionnaire section (Long Game, Approach, Short Game, Putting, Course Mgmt, Mental Game)
- Each block: title bar (LIGHT_BG, gold top rule, flag label right-aligned) + body paragraph + 3 flag rows
- Flag rows use ⚠ (amber/red) and ✓ (green) with coloured text
- Use `KeepTogether()` on each block

**5. Priority Prescription**
- 7 ranked items connecting each priority directly to the player's stated goals
- Each item: large gold number (navy bg) | title + goal link (gold) + body (LIGHT_BG)
- Coloured top rule per item: red for top priorities, amber for medium, blue for lower

**6. Tiger 5 Personal Profile**
- Personalised interpretation of each of the 5 errors for this specific player
- Each row: navy number cell | title + diagnosis | risk badge (HIGH RISK/MODERATE/LOW RISK)
- Below each row: PRESCRIPTION strip (LIGHT_BG) with specific on-course action for this player

**7. 6-Week Arc Summary**
- 4 phases (Sessions 1–2, 3–4, 5, 6) — condensed version of the Arc document
- Each phase: navy header bar | bullet items (LIGHT_BG) | green "Ready When" checkpoint cell
- Reference the Arc PDF for full detail

**8. Goals Contract**
- Player's stated goals rewritten as specific, measurable commitments
- Each goal: navy number (navy bg) | title + context (LIGHT_BG) + metric/timeline/leading indicator/milestone rows
- Milestone rows have a thin RULE divider between each

**9. Coaching Commitment Close**
- Full-width LIGHT_BG block, 2pt gold top rule
- Italic navy-mid text in Ryan's voice — personal, warm, direct
- Coach credentials sign-off line

### Dossier PDF Style Notes
- Cover page uses a dedicated `cover_page()` canvas function — WHITE background, navy header bar only, print-friendly
- Arc section: `content_row` colWidths must be [3.75*inch, 3.45*inch]; inner `item_col` colWidths [0.18*inch, 3.2*inch] — keep tight to prevent right-side overflow
- Inner pages use the standard `inner_page()` header/footer (subtitle shows player name)
- `SkillRadar` is a custom `Flowable` subclass using `canvas.beginPath()` for the polygon
- `RatingBar` is a custom `Flowable` subclass using `canvas.roundRect()`
- Use `PageBreak()` before Full Game Diagnostic and before Goals Contract
- All `KeepTogether()` blocks should wrap title bar + body + flags together

### Dossier Filename Convention
`[firstname]_dossier.pdf` — e.g. `sunny_dossier.pdf`

### Dossier Reference Script
See `references/dossier_template.py` for the complete working implementation. Adapt the player data variables — do not rebuild the layout components from scratch.

---

## Delivery Sequence

When a profile is received, the standard deliverable set is:

1. **Session 1 Plan PDF** — `[name]_session1_plan.pdf` — immediate action plan
2. **Multi-Session Arc PDF** — `[name]_[N]week_arc.pdf` — the journey map
3. **Player Dossier PDF** — `[name]_dossier.pdf` — the complete master document

Offer all three together or in sequence based on context. For a first-time student, all three should be produced. For a returning student, update the relevant sections only.

---

## Key References (read if needed)

- `references/handicap-benchmarks.md` — detailed scoring stats by hdcp range
- `references/trackman-principles.md` — ball flight laws and miss pattern diagnosis
- `references/vision54-human-skills.md` — on-course mental/emotional framework
- `references/pdf_template.py` — Session 1 plan PDF script
- `references/arc_template.py` — multi-session arc PDF script
- `references/dossier_template.py` — complete player dossier PDF script

> The reference scripts are the fastest path to a new PDF — adapt the player data, never rebuild the layout from scratch.
