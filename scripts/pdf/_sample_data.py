"""
Sample payload matching api/_lib/schema.js (PDF_DATA_SCHEMA).
Used for standalone testing of the three ReportLab templates:

    python3 session1_plan_template.py
    python3 arc_template.py
    python3 dossier_template.py

Each template falls back to SAMPLE_DATA when build_pdf is called without a
data dict. The production pipeline supplies the analysis.json payload
produced by /api/process-profile.
"""

SAMPLE_DATA = {
    "student": {
        "name": "Sunny Sample",
        "first_name": "Sunny",
        "handicap": "8",
        "goal": "Scratch handicap by end of season",
        "experience": "3-5 years playing",
        "drive_distance": "240–270",
    },
    "date_label": "April 2026",
    "arc_date_label": "April – May 2026",

    "snapshot": (
        "Sunny is a 30–45 year old player sitting at an 8 handicap after just 3–5 years in the game — "
        "rare for his time on the course. His foundation is real: consistent iron play, solid short "
        "game, and a clear scoring mindset (\"pars all day, no blowups\"). What's leaking strokes is "
        "a handful of specific, fixable things — an unreliable driver, inconsistent routines, and the "
        "3–5 avoidable errors per round that separate an 8 from a scratch. Over the next six weeks we "
        "close that gap systematically — not by overhauling the game, but by sharpening the edges of "
        "what's already working."
    ),

    "identity_paragraphs": [
        "Sunny is a 30–45 year old male who has been playing golf for 3–5 years and already sits at an "
        "8 handicap — a genuinely rare achievement for his time in the game. He has had one previous "
        "lesson, is actively working on swing changes (upright backswing, front-side loading, hands "
        "higher), and brings strong self-awareness to his coaching. He knows what he wants: scratch "
        "handicap this year, consistent iron striking with the ability to shape the ball both ways, "
        "and a controlled power fade off the tee.",
        "His ideal round tells you everything about his mindset — no OB, no blowup holes, pars all "
        "day. That's not a beginner's goal. That's a scratch player's goal. The gap between where he "
        "is and where he wants to go is not about talent or work ethic. It's about cleaning up 3–5 "
        "specific, fixable things that are costing him strokes every round.",
    ],

    "stat_strip": [
        {"value": "8",        "label": "Current Handicap"},
        {"value": "3–5",      "label": "Years Playing"},
        {"value": "240–270",  "label": "Drive Distance"},
        {"value": "4–6",      "label": "GIR per Round"},
        {"value": "Scratch",  "label": "Target"},
    ],

    "priorities": [
        {"title": "Driver Accuracy",
         "desc":  "Fairways hit 30–50% is the single biggest scoring leak. Fix the face/path "
                  "relationship to unlock the power fade and stop starting holes in trouble."},
        {"title": "Routine Under Pressure",
         "desc":  "No consistent pre-shot or pre-putt routine is the clearest separator from "
                  "scratch. One locked-in routine improves execution everywhere at once."},
        {"title": "Putting Start Line",
         "desc":  "Consistent left miss + inconsistent routine = preventable 3-putts every round. "
                  "Fixable in a single session with alignment + gate work."},
        {"title": "Toe Contact on Irons",
         "desc":  "Toe miss costs GIR and blocks the shot-shaping goal. Impact tape + hip-clear "
                  "work moves GIR from 4–6 toward 7–9."},
    ],

    "focuses": [
        {"title": "Driver Face/Path + Power Fade",
         "why":   "Direction is the leak, not distance. A reliable, repeatable fade off the tee is "
                  "the single biggest stroke unlock available.",
         "drill": "TrackMan baseline + gate drill at the range: 20 driver swings focused on exit "
                  "direction with tees 3 feet in front on the fade line.",
         "cue":   "Cover the ball, finish tall.",
         "tag":   "LONG GAME"},
        {"title": "Pre-Shot Routine Lock-In",
         "why":   "Your routine is the container for commitment. Inconsistent routine = "
                  "inconsistent execution under pressure.",
         "drill": "Write your 5-step routine on paper. Use it on every single range ball. If you "
                  "skip a step, restart the ball.",
         "cue":   "See it, feel it, trust it.",
         "tag":   "MENTAL GAME"},
        {"title": "Iron Contact — Toe Miss",
         "why":   "Toe contact is costing GIR and feeding the left approach miss. Fix this and the "
                  "shot-shaping toolkit opens up naturally.",
         "drill": "Impact tape on 7-iron, 15 swings per session — check contact location, focus on "
                  "hip clearance through impact.",
         "cue":   "Clear the left hip.",
         "tag":   "BALL STRIKING"},
        {"title": "Putting Alignment + Start Line",
         "why":   "Left miss + no routine = a preventable 3-putt every round. Alignment line on "
                  "the ball solves 80% of this immediately.",
         "drill": "Gate drill from 6 feet: two tees just wider than the putter, 10 in a row before "
                  "leaving the practice green.",
         "cue":   "Start line, then speed.",
         "tag":   "PUTTING"},
    ],

    "tiger5_session1": [
        {"num": "#1", "title": "Bogey or worse on a par 5",
         "desc": "Errant tee shots put you in recovery mode on holes you should score on.",
         "risk": "HIGH RISK"},
        {"num": "#2", "title": "Big number (double bogey or worse)",
         "desc": "OB tee shots are the primary trigger. One double costs two recoveries.",
         "risk": "HIGH RISK"},
        {"num": "#3", "title": "Blown easy save inside 15 yards",
         "desc": "Short game is a strength — protect it. Main risk is deceleration on short chips.",
         "risk": "MANAGEABLE"},
        {"num": "#4", "title": "Three-putt",
         "desc": "Inconsistent routine + consistent left miss = preventable 3-putts every round.",
         "risk": "HIGH RISK"},
        {"num": "#5", "title": "Bogey with 9-iron or shorter",
         "desc": "Solid wedge confidence. Risk is aiming at tucked pins with scoring clubs.",
         "risk": "MANAGEABLE"},
    ],

    "probes": [
        {"label": "Practice routine",
         "text":  "What does a typical range session look like — structure, targets, duration?"},
        {"label": "Pressure response",
         "text":  "On a hole you'd typically par, what changes when it's for a personal-best round?"},
        {"label": "Previous coaching",
         "text":  "What exactly changed after the last lesson? Which cues stuck, which didn't?"},
        {"label": "Equipment check",
         "text":  "When was the last lie/loft check? Any club you avoid pulling in competition?"},
        {"label": "Physical limits",
         "text":  "Any mobility or injury history that affects rotation or finish position?"},
    ],

    "session1_closing": (
        "Sunny, the gap to scratch is narrower than it feels. You already have the ball-striking, "
        "the short game, and the right mindset. Session 1 is about diagnosing the driver, locking "
        "in the routine, and giving you the first real piece of the scratch framework. Bring the "
        "Tiger 5 scorecard to Session 2. Let's go to work."
    ),

    "arc_intro": (
        "You're 8 shots away from scratch with 3–5 years in the game — genuinely rare. The foundation "
        "is already there. What's leaking strokes is a handful of specific, fixable things: an "
        "unreliable driver, inconsistent routines, and the 3–5 avoidable errors per round that "
        "separate an 8 from a scratch. This arc is about closing that gap systematically."
    ),

    "arc_themes": [
        {"label": "Theme 1", "title": "Technical Precision",
         "body":  "Driver shape, iron contact, distance gapping — build the reliable ball-striking "
                  "that scratch demands."},
        {"label": "Theme 2", "title": "Routine & Mental Game",
         "body":  "Lock in a pre-shot and pre-putt routine that holds under pressure and stops the "
                  "dwell pattern."},
        {"label": "Theme 3", "title": "Course Management",
         "body":  "Tiger 5 tracking, par 5 strategy, miss direction awareness — score with the "
                  "swing you already have."},
    ],

    "sessions": [
        {"week": "1",
         "theme": "Diagnose & Lock In the Foundation",
         "subtitle": "Session 1 of 6 — Assessment + Fundamentals",
         "primary": "Driver face/path — TrackMan baseline, gate drill, shape the fade",
         "secondary": "Toe contact on irons — impact tape, hip clearance drill",
         "practice": [
             "Gate drill: 20 driver swings daily, focus on exit direction",
             "Impact tape on 7-iron: 15 swings, check contact location",
             "Pre-shot routine: write it down, use every range ball",
         ],
         "tiger5": "Track all 5 events in one round. No pressure to fix — observe and record.",
         "ready_when": "Fairway contact improving. Can describe the correct exit path feel.",
         "measure": "Fairways hit, Tiger 5 count from one round"},
        {"week": "2",
         "theme": "Routine Under Pressure",
         "subtitle": "Session 2 of 6 — Mental Game + Putting",
         "primary": "Pre-shot and pre-putt routine — lock it in, pressure-test it",
         "secondary": "Putting alignment + start line gate drill",
         "practice": [
             "Every practice putt uses the full routine — no exceptions",
             "Gate drill from 6 feet: 10 in a row to finish each session",
             "On course: count shots you execute the full routine vs. shortcut",
         ],
         "tiger5": "Focus on Tiger 5 #4 (3-putts) and #5 (bogey with scoring club).",
         "ready_when": "Routine automatic on range. Left putting miss reducing.",
         "measure": "3-putts per round, inside-6-feet make %"},
        {"week": "3",
         "theme": "Iron Precision",
         "subtitle": "Session 3 of 6 — Ball Striking + Distance Gapping",
         "primary": "TrackMan gap session — dial in exact carry distances",
         "secondary": "Shot shaping introduction — controlled fade with mid-irons",
         "practice": [
             "Write down your 10 carry distances and keep them with you",
             "Range: 5 shots to a specific yardage target per iron, note dispersion",
             "On course: commit to a specific yardage target every approach",
         ],
         "tiger5": "Focus on Tiger 5 #5 — confirm the yardage is the reason when you miss.",
         "ready_when": "Can recite carry distances. Toe miss largely eliminated.",
         "measure": "GIR per round (target: 7+ from 4–6)"},
        {"week": "4",
         "theme": "Short Game Sharpening",
         "subtitle": "Session 4 of 6 — Chipping + Bunkers",
         "primary": "Bunker technique — setup, shallow entry, acceleration, commitment",
         "secondary": "Chipping distance control — landing zone targeting",
         "practice": [
             "Bunker: 20 practice splashes per session, spot 2 inches behind ball",
             "Chipping: pick a landing spot (not the hole) on every chip",
             "Track Tiger 5 #3: up-and-down from every easy lie inside 15 yards",
         ],
         "tiger5": "Tiger 5 #3 is the focus this week. Every blown easy save gets noted.",
         "ready_when": "Bunker confidence 7/10+. Chips landing within 3 feet of spot.",
         "measure": "Up-and-down % from easy lies, bunker saves per round"},
        {"week": "5",
         "theme": "On-Course Integration",
         "subtitle": "Session 5 of 6 — Playing Lesson",
         "primary": "Play 9 holes together — observe routine, decision-making, recovery",
         "secondary": "Course management: par 5 strategy, miss direction, pin vs. fat of green",
         "practice": [
             "Full round with complete Tiger 5 tracking — all 5 events",
             "Before each tee shot: name the miss, aim away from it",
             "After any bad shot: breath + feel feet reset cue before next shot",
         ],
         "tiger5": "Full Tiger 5 tracking round. Bring the scorecard to Session 6.",
         "ready_when": "Tiger 5 count under 8 per round. Routine holding under pressure.",
         "measure": "Full Tiger 5 scorecard, overall score vs. baseline"},
        {"week": "6",
         "theme": "Reassess & Set the Next Arc",
         "subtitle": "Session 6 of 6 — Measurement + Planning",
         "primary": "TrackMan re-baseline — compare driver and iron data to Session 1",
         "secondary": "Review Tiger 5 trend, GIR trend, putts per round trend",
         "practice": [
             "Continue all routines — they are permanent habits now",
             "Identify the one area that still needs the most work",
             "Book the next arc or graduate to competitive prep",
         ],
         "tiger5": "Review the full 6-week trend. Where did you improve most?",
         "ready_when": "Handicap trending toward single digits. Tiger 5 average under 6.",
         "measure": "Handicap index, Tiger 5 avg, GIR avg, putts per round vs. baseline"},
    ],

    "progress_markers": [
        {"metric": "Fairways Hit",       "now": "30–50%",         "target": "55–65%",       "why": "Controlled fade, no OB"},
        {"metric": "GIR per Round",      "now": "4–6",            "target": "7–9",          "why": "Better contact + distance gapping"},
        {"metric": "Putts per Round",    "now": "Unknown",        "target": "30 or fewer",  "why": "Routine + start line fix"},
        {"metric": "3-Putts per Round",  "now": "Frequent",       "target": "1 or fewer",   "why": "Distance control + alignment"},
        {"metric": "Tiger 5 Count",      "now": "Unknown",        "target": "6 or fewer",   "why": "Decision quality improving"},
        {"metric": "Bunker Saves",       "now": "5/10 confidence","target": "7/10+",        "why": "Setup and commitment fix"},
    ],

    "practice_principles": [
        {"title": "Purpose over Repetition",
         "body":  "Every range session needs a goal. \"Hit balls\" is not a session. Pick one thing, "
                  "measure it, stop when you've got it."},
        {"title": "Routine on Every Shot",
         "body":  "The range is where you train the routine, not just the swing. If you wouldn't "
                  "skip it on the course, don't skip it here."},
        {"title": "Quality over Quantity",
         "body":  "30 focused swings beats 150 mindless ones. When you stop feeling the target, stop "
                  "hitting."},
        {"title": "Transfer to the Course",
         "body":  "The skills you build here only count if they show up in your scorecard. One "
                  "Tiger 5 tracking round per week minimum."},
    ],

    "arc_closing": (
        "Scratch is not a swing overhaul. For you, it's a handful of specific fixes applied with "
        "consistency and intention. You already have the ball-striking to get there — the iron play "
        "is real, the short game is real, and the mindset (pars all day, no blowups) is exactly "
        "right. My job over these six weeks is to give you the tools, the data, and the framework. "
        "Your job is to show up with the tracking numbers, trust the process between sessions, and "
        "compete with yourself — not your scorecard. Let's go get it."
    ),

    "skill_radar": {
        "labels": ["Long Game", "Approach", "Short Game", "Putting", "Course Mgmt", "Mental Game"],
        "scores": [7.5, 6.5, 7.5, 6.0, 5.5, 5.0],
    },
    "skill_notes": [
        {"area": "Long Game",   "score": 7.5,
         "note": "Solid distance, manageable miss. Driver accuracy is the key gap.",   "level": "BLUE"},
        {"area": "Approach",    "score": 6.5,
         "note": "Good confidence but toe miss and GIR below potential.",              "level": "BLUE"},
        {"area": "Short Game",  "score": 7.5,
         "note": "Genuine strength. Pitching and chipping are reliable assets.",       "level": "BLUE"},
        {"area": "Putting",     "score": 6.0,
         "note": "Functional but leaking strokes. Left miss and no routine.",          "level": "AMBER"},
        {"area": "Course Mgmt", "score": 5.5,
         "note": "Strategy present \"usually\" — needs to be always at scratch.",      "level": "AMBER"},
        {"area": "Mental Game", "score": 5.0,
         "note": "Dwells on bad shots. Routine inconsistent. Biggest growth area.",    "level": "AMBER"},
    ],

    "diagnostic_sections": [
        {"title": "Long Game — Driver, Fairway Woods, Long Irons",
         "flag_label": "WARNING: PRIMARY LEAK", "flag_level": "AMBER",
         "body": ("Sunny carries 240–270 yards — right in the low-handicap range — so distance is "
                  "not the issue. Direction is. A slice/fade miss with varying face contact and only "
                  "30–50% fairways hit means he's starting too many holes in trouble. Long iron "
                  "confidence at 3/10 is a significant red flag — at scratch level these need to be "
                  "a reliable weapon, not avoided."),
         "flags": [
             {"prefix": "WARNING", "text": "Fairways 30–50% — accuracy before distance", "level": "AMBER"},
             {"prefix": "WARNING", "text": "Long iron confidence 3/10 — scratch barrier", "level": "RED"},
             {"prefix": "GOOD",    "text": "Distance in low-hdcp range — no work needed here", "level": "GREEN"},
         ]},
        {"title": "Approach Game — Mid Irons, Short Irons, Wedges",
         "flag_label": "MODERATE — IMPROVABLE", "flag_level": "BLUE",
         "body": ("7/10 confidence across 6-iron through wedges is solid — data backs up the "
                  "self-identified strength. However, the consistent toe miss and left approach "
                  "direction are connected: toe contact typically produces a weak, left-biased "
                  "flight. \"Rough idea\" of carry distances will be a scratch barrier — TrackMan "
                  "gap mapping is a priority."),
         "flags": [
             {"prefix": "WARNING", "text": "Toe miss costing GIR — address in Session 1", "level": "AMBER"},
             {"prefix": "WARNING", "text": "Distances \"rough idea\" only — gap mapping needed", "level": "AMBER"},
             {"prefix": "GOOD",    "text": "Confidence consistent across all iron lengths", "level": "GREEN"},
         ]},
        {"title": "Short Game — Chipping, Pitching, Bunkers",
         "flag_label": "GENUINE STRENGTH", "flag_level": "GREEN",
         "body": ("Short game is a real asset. Bump-and-run 7/10, high loft 7/10, pitching 8/10. "
                  "Uses multiple wedges by shot — not a one-club player. The 5/10 bunker comfort is "
                  "the only weak spot. Leaving chips short is the stated struggle — almost always "
                  "deceleration, not technique."),
         "flags": [
             {"prefix": "WARNING", "text": "Bunker 5/10 — setup and commitment fix needed", "level": "AMBER"},
             {"prefix": "WARNING", "text": "Chips leaving short — deceleration pattern", "level": "AMBER"},
             {"prefix": "GOOD",    "text": "Pitching 8/10 — protect this strength", "level": "GREEN"},
         ]},
        {"title": "Putting",
         "flag_label": "LEAKING STROKES", "flag_level": "AMBER",
         "body": ("Raw numbers look decent — 7/10 under 5 feet, 6/10 from 6–15 feet, 7/10 lag. But "
                  "the consistent left miss and \"sometimes\" routine is the story. Left miss is "
                  "almost certainly alignment or face-at-impact — fixable in one session. Lag is a "
                  "strength and should be protected."),
         "flags": [
             {"prefix": "WARNING", "text": "Consistent left miss — alignment issue", "level": "AMBER"},
             {"prefix": "WARNING", "text": "No consistent pre-putt routine", "level": "RED"},
             {"prefix": "GOOD",    "text": "Lag putting 7/10 — distance control is good", "level": "GREEN"},
         ]},
        {"title": "Course Management & Strategy",
         "flag_label": "MODERATE LEAK", "flag_level": "AMBER",
         "body": ("Has a course strategy \"usually\" — better than most, but not consistent enough "
                  "for scratch. Risk/reward managed \"sometimes\". Most frequent mistakes are "
                  "errant tee shots and putt misses — both feeding from the technical leaks above. "
                  "Iron play holds under pressure — big asset to build around."),
         "flags": [
             {"prefix": "WARNING", "text": "Strategy \"usually\" — needs to be always at scratch", "level": "AMBER"},
             {"prefix": "WARNING", "text": "No framework for uneven lies or narrow fairways", "level": "AMBER"},
             {"prefix": "GOOD",    "text": "Iron play under pressure — protect and leverage", "level": "GREEN"},
         ]},
        {"title": "Mental Game & On-Course Behaviour",
         "flag_label": "SIGNIFICANT GROWTH AREA", "flag_level": "RED",
         "body": ("This is where the scratch gap lives more than anywhere else. Sunny dwells on bad "
                  "shots — his words. \"Sometimes\" pre-shot routines and a \"short\" warm-up. "
                  "These are not small details at 8 hdcp — they are the difference. The good news: "
                  "his stated ideal round shows he already has the right model. He just needs the "
                  "process to execute it."),
         "flags": [
             {"prefix": "WARNING", "text": "Dwells on bad shots — Vision54 reset cue needed", "level": "RED"},
             {"prefix": "WARNING", "text": "Pre-shot routine inconsistent across all shots", "level": "RED"},
             {"prefix": "GOOD",    "text": "Correct scoring mindset already in place", "level": "GREEN"},
         ]},
    ],

    "prescriptions": [
        {"num": "1", "title": "Driver Accuracy",
         "goal_link": "Scratch Goal → No OB",
         "body": "OB tee shots are your Tiger 5 #2 trigger. Fixing the face/path relationship "
                  "unlocks the power fade goal and eliminates round-killers.",
         "level": "RED"},
        {"num": "2", "title": "Pre-Shot & Pre-Putt Routine",
         "goal_link": "Scratch Goal → No Blowups",
         "body": "Inconsistent routines across every part of the game. At 8 hdcp this is the "
                  "clearest separator from scratch. One locked-in routine improves everything.",
         "level": "RED"},
        {"num": "3", "title": "Putting Start Line & Alignment",
         "goal_link": "Scratch Goal → Fewer 3-Putts",
         "body": "Consistent left miss + no reliable routine = preventable strokes every round. "
                  "Fixable in one session. Directly addresses Tiger 5 #4.",
         "level": "AMBER"},
        {"num": "4", "title": "Toe Contact on Irons",
         "goal_link": "Scratch Goal → Consistent Ball Striking",
         "body": "Toe miss is costing GIR and blocking the shot-shaping goal. Fix this and the "
                  "fade/draw toolkit opens. GIR should move from 4–6 toward 7–9.",
         "level": "AMBER"},
        {"num": "5", "title": "Distance Gapping via TrackMan",
         "goal_link": "Scratch Goal → Consistent Irons",
         "body": "\"Rough idea\" of distances is a scratch barrier. One TrackMan session produces "
                  "exact carry numbers — fastest approach-decision improvement available.",
         "level": "AMBER"},
        {"num": "6", "title": "Bunker Play",
         "goal_link": "Scratch Goal → Short Game Completeness",
         "body": "5/10 is the only real short game weakness. 20-minute setup correction (open "
                  "face, shallow entry, commit through) moves this to 7/10 quickly.",
         "level": "BLUE"},
    ],

    "tiger5_dossier": [
        {"num": "#1", "title": "Bogey or worse on a par 5",
         "diag": "Errant tee shots put you in recovery mode on scorable holes.",
         "risk_label": "HIGH RISK", "risk_level": "RED",
         "rx": "Play for position off the tee on par 5s. Driver only when the fairway is wide. "
                "Layup to your best wedge distance. Par is the minimum acceptable."},
        {"num": "#2", "title": "Big number (double bogey or worse)",
         "diag": "OB tee shots are the primary trigger. One double costs two good holes.",
         "risk_label": "HIGH RISK", "risk_level": "RED",
         "rx": "Identify OB before the tee shot, aim away. When in trouble, take the medicine and "
                "move on. Never compound a mistake."},
        {"num": "#3", "title": "Blown easy save inside 15 yards",
         "diag": "Short game is a strength — this should be rare. Main risk is deceleration on "
                 "short chips.",
         "risk_label": "LOW RISK", "risk_level": "GREEN",
         "rx": "Landing zone targeting on every chip. Accelerate through impact. Middle of the "
                "green is always a success from this range."},
        {"num": "#4", "title": "Three-putt",
         "diag": "Inconsistent routine + consistent left miss = preventable 3-putts every round.",
         "risk_label": "HIGH RISK", "risk_level": "RED",
         "rx": "Full pre-putt routine every time. Alignment line on the ball. For long putts: "
                "target a 3-foot circle, not the hole."},
        {"num": "#5", "title": "Bogey with 9-iron or shorter",
         "diag": "7/10 wedge confidence is solid. Risk is aiming at tucked pins with scoring clubs.",
         "risk_label": "MODERATE", "risk_level": "AMBER",
         "rx": "Never aim at a tucked pin with a scoring club. Centre of the green — make the putt."},
    ],

    "arc_phases": [
        {"title": "Sessions 1–2", "name": "Foundation",
         "items": ["Driver face/path diagnosis + gate drill",
                   "Toe contact fix — impact tape + hip clearance",
                   "Pre-shot routine build and lock-in",
                   "Putting alignment + start line gate drill"],
         "checkpoint": "Routine consistent. Driver path improving. Left miss reducing."},
        {"title": "Sessions 3–4", "name": "Precision",
         "items": ["TrackMan gap session — all clubs mapped",
                   "Shot shaping introduction — controlled fade",
                   "Bunker technique — setup, entry, commitment",
                   "Chipping distance control — landing zone targeting"],
         "checkpoint": "Exact carry distances known. GIR trending 7+. Bunker confidence 7/10."},
        {"title": "Session 5", "name": "Integration",
         "items": ["Playing lesson — 9 holes together",
                   "Course management: par 5 strategy, miss direction",
                   "Pressure routine — holds under course conditions",
                   "Full Tiger 5 tracking round"],
         "checkpoint": "Tiger 5 count under 8. Routine holding on course."},
        {"title": "Session 6", "name": "Reassess",
         "items": ["TrackMan re-baseline vs. Session 1",
                   "Review all Tiger 5 and stat trends",
                   "Handicap index review",
                   "Plan the next arc or graduate to competitive prep"],
         "checkpoint": "Handicap trending single digits. Tiger 5 average under 6."},
    ],

    "goals": [
        {"num": "01", "title": "Reach Scratch Handicap",
         "context": "Everything in this plan serves this target.",
         "metrics": [
             {"label": "Metric",            "value": "Handicap index at or below 0.0"},
             {"label": "Timeline",          "value": "End of 2026 season"},
             {"label": "Leading indicator", "value": "Tiger 5 average ≤6 per round by Week 6"},
             {"label": "Milestone",         "value": "Single-digit handicap by mid-season"},
         ]},
        {"num": "02", "title": "Consistent Iron Striking + Shot Shaping",
         "context": "Pure contact, correct distances, ability to work the ball both ways.",
         "metrics": [
             {"label": "Metric",            "value": "GIR 9+ per round / toe miss eliminated"},
             {"label": "Timeline",          "value": "Sessions 3–4 (gap mapping + shaping intro)"},
             {"label": "Leading indicator", "value": "TrackMan: strike consistent, carry ±3 yards of target"},
             {"label": "Milestone",         "value": "Controlled fade and draw on demand with 7-iron"},
         ]},
        {"num": "03", "title": "Reliable Power Fade Off the Tee",
         "context": "A trusted, repeatable driver flight. No more \"spicy\".",
         "metrics": [
             {"label": "Metric",            "value": "Fairways hit 60%+ / zero OB rounds"},
             {"label": "Timeline",          "value": "Sessions 1–2 (face/path work)"},
             {"label": "Leading indicator", "value": "TrackMan path/face delta within 3° of target fade"},
             {"label": "Milestone",         "value": "One full round with zero OB tee shots"},
         ]},
    ],

    "dossier_closing": (
        "Scratch is not a swing overhaul. For you, it's a handful of specific fixes applied with "
        "consistency and intention. You already have the ball-striking, the short game, and — most "
        "importantly — the mindset. Pars all day, no blowups. That's exactly right. My commitment "
        "is to give you the tools, the data, and the framework to make it real. Yours is to show "
        "up with the tracking numbers, trust the process between sessions, and compete with "
        "yourself — not your scorecard. This dossier is our shared blueprint. Let's go get it."
    ),
}
