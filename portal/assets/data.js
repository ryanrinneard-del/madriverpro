/* ============================================================
   RR GOLF PERFORMANCE — Junior Elite Academy Portal
   data.js — single source of truth for curriculum content
   ============================================================ */

window.RRG = window.RRG || {};

/* ---------- 15-week curriculum ---------- */
RRG.WEEKS = [
  {
    n: 1, date: 'Sat May 23, 2026', phase: 'P1', open: '2026-05-16',
    title: 'Intake — TPI, Baseline, Ball Flight',
    codes: ['01', '02'],
    focus: 'Full TPI Level\u00a03 movement screen. TrackMan baseline for every club. Stack Golf System setup and first speed session. Miss-pattern audit and personal benchmarks set.',
    context: 'First Saturday — intake and onboarding. SCJGT Event #1 is Sunday May 24 for those already entered.',
    selfGuided: 'Play 18 holes. Log the full scorecard here on the portal: FIR, GIR, putts, 3-putts, up-and-down %, and a Tiger 5 tally.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 2, date: 'Sat May 30, 2026', phase: 'P1', open: '2026-05-23',
    title: 'Clubface Control',
    codes: ['03'],
    focus: 'Grip audit. Face-to-path relationship on TrackMan. Start-line drills through alignment stick gates. 15\u202fmin short-game block (up-and-down) + 10\u202fmin putting inside 6\u202fft.',
    context: 'Final tune-up before SCJGT Event #2 (Sun May 31) at Brooklea CC.',
    selfGuided: 'Play 18 holes. Commit to one clear start line on every full shot. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 3, date: 'Sat Jun 6, 2026', phase: 'P1', open: '2026-05-30',
    title: 'Low Point & Strike',
    codes: ['04'],
    focus: 'Divot-board work. Ball-first contact. Impact-bag drills. 15\u202fmin short game + 10\u202fmin inside-6\u202fft putting block. Stack speed session #2.',
    context: 'Debrief Event #2 — what did the miss pattern tell you?',
    selfGuided: 'Play 18 holes. Log a strike chart per iron shot: thin / fat / flush / toe / heel. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard', 'strikechart'],
  },
  {
    n: 4, date: 'Sat Jun 13, 2026', phase: 'P1', open: '2026-06-06',
    title: 'Sequence & Power',
    codes: ['05', '06'],
    focus: 'Kinematic sequence on video. Ground-force cues. Step-drills to rebuild transition. 15\u202fmin short game + 10\u202fmin inside-6\u202fft putting. Stack speed session #3.',
    context: 'Final session before SCJGT Event #3 (Sun Jun 14) at The Nest at Friday Harbour.',
    selfGuided: 'Play 18 holes. Attempt one committed draw and one committed fade with a full club. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 5, date: 'Sat Jun 20, 2026', phase: 'P1', open: '2026-06-13',
    title: 'Approach Precision + Wedge Matrix',
    codes: ['03', '09'],
    focus: 'Build the personal wedge matrix: full / three-quarter / half with each wedge. Landing-zone targeting. The filled matrix is saved and printable from the portal for the scorecard holder. 15\u202fmin short game + 10\u202fmin inside-6\u202fft putting.',
    context: 'Interior week — build the approach game ahead of the July tour stretch.',
    selfGuided: 'Play 18 holes. Log proximity to hole from every approach inside 150 yards. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard', 'wedgematrix'],
  },
  {
    n: 6, date: 'Sat Jun 27, 2026', phase: 'P1', open: '2026-06-20',
    title: 'Short Game Systems',
    codes: ['03', '04', '10'],
    focus: 'Chip / pitch / flop / bump system. Bunker setup — open face, open stance, shallow entry. 15\u202fmin up-and-down block expanded to 30\u202fmin this week. 10\u202fmin inside-6\u202fft putting.',
    context: 'School-end transition week. Tour debrief and goal reset for the summer block.',
    selfGuided: 'Play 18 holes. Up-and-down attempts tracked per hole. <i>Shortee</i> (executive / par-3) rounds also count as a submission.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 7, date: 'Tue Jul 7 / Thu Jul 9, 2026', phase: 'P2', open: '2026-07-04',
    title: 'Putting — Distance Control',
    codes: ['08', '09'],
    focus: 'Lag-ladder drills. 30 / 40 / 50\u202fft landing zones. Eliminate the 3-putt. Tue installs, Thu pressure-tests with a game. 15\u202fmin short game + inside-6\u202fft putting built into every session.',
    context: 'First week back after the Canada Day gap week. Re-establish the training rhythm.',
    selfGuided: 'Play 18 holes. Log every first-putt distance, ending distance, and 3-putt count. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 8, date: 'Tue Jul 14 / Thu Jul 16, 2026', phase: 'P2', open: '2026-07-11',
    title: 'On-Course Strategy & Playing Lesson',
    codes: ['10'],
    focus: '<b>Playing lesson</b> on Thursday — coach walks the round, narrates decisions, coaches in real time. Formats rotate across the summer: <b>par-3 scramble</b> (two balls, pick the best of each), <b>worst-ball 9</b> (play two balls, count the worst of each), <b>stroke-play with commentary</b> (real scores, running coaching dialogue).',
    context: 'Prep for SCJGT Event #4 (Sun Jul 19) at Shanty Bay — course strategy and club-off-tee plan on the portal.',
    selfGuided: 'Play Event #4 or a prep round. Carry the <b>Tiger 5 mental scorecard</b> — the printed card where the player tracks all 5 Tiger 5 events live, each hole. Full scorecard submitted after.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 9, date: 'Tue Jul 21 / Thu Jul 23, 2026', phase: 'P2', open: '2026-07-18',
    title: 'Speed Development — The Stack System',
    codes: ['07'],
    focus: 'Stack Golf System progressive protocols. Deliberate speed training across the week between sessions. 15\u202fmin short game + inside-6\u202fft putting remain.',
    context: 'Build speed window before the late-summer tournament stretch.',
    selfGuided: 'Play 18 holes. Record driver carry / total on at least three holes. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 10, date: 'Tue Jul 28 / Thu Jul 30, 2026', phase: 'P2', open: '2026-07-25',
    title: 'Tournament Week — Course Management',
    codes: ['10', '11'],
    focus: 'DECADE Golf framework. Shot-dispersion patterns. Fat-side misses. Full Tiger 5 review. Tuesday is the pre-tournament game plan session for Event #5 (Wed Jul 29, Orr Lake).',
    context: 'SCJGT Event #5 falls on the Wed of this week. Thursday is a decompression + debrief session.',
    selfGuided: 'Play Event #5 plus one more 18-hole round. Tiger 5 mental scorecard on both. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 11, date: 'Tue Aug 4 / Thu Aug 6, 2026', phase: 'P2', open: '2026-08-01',
    title: 'Mental Performance — Vision54',
    codes: ['11', '12'],
    focus: 'Vision54 Human Skills block: commitment cues, breath work, between-shot rituals, post-shot decompression. Individual routine built and rehearsed on camera.',
    context: 'Prep for SCJGT Event #6 (Mon Aug 10) at National Pines.',
    selfGuided: 'Play 18 holes with a single-word swing thought only. Full scorecard submitted with a routine-consistency self-rating.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 12, date: 'Tue Aug 11 / Thu Aug 13, 2026', phase: 'P2', open: '2026-08-08',
    title: 'On-Course Competition Simulation',
    codes: ['10'],
    focus: 'Pressure practice formats: <b>worst-ball 9</b>, <b>skins</b>, <b>one-ball matchplay</b>. Pre-shot-routine consistency tested under score-on-the-line conditions.',
    context: 'Event #6 debrief from the Monday before. Event #7 (Wed Aug 19) is the following week.',
    selfGuided: 'Play 18 holes under a competitive format (match or match-score) with another cohort member. Full scorecard submitted.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 13, date: 'Tue Aug 18 / Thu Aug 20, 2026', phase: 'P2', open: '2026-08-15',
    title: 'Tournament Week — Simplify Under Pressure',
    codes: ['12'],
    focus: 'Pre-tournament game plan Tuesday. Post-tournament debrief Thursday. One-swing-thought, one-target discipline. The mental scorecard is the focus of the week.',
    context: 'SCJGT Event #7 (Wed Aug 19) at Simoro Links falls mid-week — the heart of the championship run-up.',
    selfGuided: 'Play Event #7 plus one prep round. Tiger 5 mental scorecard on both rounds.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 14, date: 'Tue Aug 25 / Thu Aug 27, 2026', phase: 'P2', open: '2026-08-22',
    title: 'Championship Week — Peak Performance',
    codes: ['10', '11', '12'],
    focus: 'Tuesday is the championship game plan. Thursday is the full post-season review. Individual performance summary from the season\u2019s submitted scorecards.',
    context: 'SCJGT Tour Championship Major (Wed Aug 26) at Tangle Creek GC — the season\u2019s target event.',
    selfGuided: 'Play the Championship. Full scorecard, Tiger 5 mental scorecard, and emotional / process rating submitted after.',
    tools: ['tiger5', 'scorecard'],
  },
  {
    n: 15, date: 'Tue Sep 1 / Thu Sep 3, 2026', phase: 'P2', open: '2026-08-29',
    title: 'Season Review + Fall Arc Plan',
    codes: ['09', '11'],
    focus: 'Final TrackMan benchmarks. TPI re-screen. Full-season scorecard trend review. Individual player performance dossier built from the 15-week data set. Fall / winter arc plan set.',
    context: 'Graduation week. Player walks away with a written Season Review and a Fall Plan.',
    selfGuided: 'Self-selected 18-hole round as a season closer — played under tournament conditions, submitted with reflection notes.',
    tools: ['tiger5', 'scorecard'],
  },
];

/* ---------- 12 Performance Codes ---------- */
RRG.CODES = [
  { n: '01', title: 'Swing Within Your Body', desc: 'Train movements the athlete\u2019s body can actually produce. TPI-informed.' },
  { n: '02', title: 'Read Ball Flight as Feedback', desc: 'Use ball flight laws and TrackMan data to diagnose cause and effect.' },
  { n: '03', title: 'Control the Clubface', desc: 'Face-to-path awareness \u2014 the highest-leverage technical skill.' },
  { n: '04', title: 'Manage Low Point', desc: 'Consistent ball-first contact through divot and strike control.' },
  { n: '05', title: 'Move in the Right Sequence', desc: 'Kinematic sequencing \u2014 lower body leads, everything else follows.' },
  { n: '06', title: 'Use Ground Forces', desc: 'Push into and away from the ground to create speed and stability.' },
  { n: '07', title: 'Train Speed as a Skill', desc: 'Deliberate speed development separate from technique work.' },
  { n: '08', title: 'Learn Through Constraints', desc: 'Games and challenges beat mindless repetition every time.' },
  { n: '09', title: 'Practice With a Purpose', desc: 'Every session has a goal and a measure. Intent over volume.' },
  { n: '10', title: 'Train Competitive Skills', desc: 'Scoring ability is trained separately from mechanics.' },
  { n: '11', title: 'Own the Process', desc: 'Self-awareness, self-regulation, ownership of improvement.' },
  { n: '12', title: 'Simplify Under Pressure', desc: 'Fewer thoughts, clear target, committed routine when it matters.' },
];

/* ---------- Tiger 5 events ---------- */
RRG.TIGER5 = [
  { n: 1, title: 'Bogey or worse on a par 5', desc: 'Par 5s are scoring holes, not par holes.' },
  { n: 2, title: 'Big number (double bogey or worse)', desc: 'Single biggest score differential between levels.' },
  { n: 3, title: 'Blown easy save', desc: 'Within 15 yards of the green in a good lie: on the green, always.' },
  { n: 4, title: 'Three-putt', desc: 'Wasted stroke from a position where two was fully achievable.' },
  { n: 5, title: 'Bogey with a scoring club (9-iron or shorter)', desc: 'Almost always a strategic mistake, not a technique one.' },
];

/* ---------- SCJGT 2026 ---------- */
RRG.SCJGT_EVENTS = [
  { n: '#1', date: 'Sun May 24, 2026', course: "Settlers' Ghost Golf Club", deadline: 'Sat May 23' },
  { n: '#2', date: 'Sun May 31, 2026', course: 'Brooklea CC', deadline: 'Sat May 30' },
  { n: '#3', date: 'Sun Jun 14, 2026', course: 'The Nest at Friday Harbour', deadline: 'Wed Jun 3' },
  { n: '#4', date: 'Sun Jul 19, 2026', course: 'Shanty Bay Golf Club', deadline: 'Thu Jul 16' },
  { n: '#5', date: 'Wed Jul 29, 2026', course: 'Orr Lake Golf Club', deadline: 'Fri Jul 10' },
  { n: '#6', date: 'Mon Aug 10, 2026', course: 'National Pines Golf Club', deadline: 'Fri Aug 7' },
  { n: '#7', date: 'Wed Aug 19, 2026', course: 'Simoro Golf Links', deadline: 'Mon Aug 17' },
  { n: 'CH', date: 'Wed Aug 26, 2026', course: 'Tangle Creek GC — Tour Championship Major', deadline: 'Mon Aug 17' },
];

/* ---------- Wedge Matrix default template ---------- */
RRG.WEDGE_CLUBS = ['PW', 'GW / 52°', 'SW / 56°', 'LW / 60°'];
RRG.WEDGE_SHOTS = ['Full', '¾ swing', '½ swing', 'Knockdown'];

/* =============================================================================
   ELITE TIER DATA — sections imported from adult/assets/data.js so the Elite
   junior pages (Mad River scorecard, TrackMan, handicap, Path widget) work the
   same as the adult versions. Single source of truth: adult/data.js. Sync if
   you change benchmarks or course data there.
============================================================================= */
RRG.BENCHMARKS = {
  //              35     30     25     20     15     10      5      0
  avg_score:    [108,   105,    99,    94,    89,    84,    79,    74.5],
  drive_dist:   [185,   190,   210,   219,   231,   247,   258,   275],
  fairways_pct: [35,    38,    43,    43,    47,    49,    51,    58],   // %
  gir_pct:      [6,     9,     18,    22,    26,    37,    46,    58],   // %
  putts_rd:     [40,    38.5,  37,    36,    34.5,  33.5,  32,    30.5],
  scrambling:   [8,     12,    20,    22,    25,    32,    38,    53],   // %
  sand_save:    [5,     7,     10,    13,    17,    22,    30,    45],   // % (approx)
  birdies_rd:   [0,     0,     0.2,   0.3,   0.5,   0.7,   1.3,   2.3],
  doubles_rd:   [9.5,   7.5,   6.5,   5.5,   4.5,   2.9,   1.5,   0.8],
  penalties_rd: [5.5,   4.5,   4.7,   3.0,   2.5,   1.6,   0.9,   0.5],
};

/* Handicap brackets that align with the arrays above. Index-aligned. */
RRG.BENCHMARK_BRACKETS = [35, 30, 25, 20, 15, 10, 5, 0];

/* Bracket-to-bracket coaching focus — what the player should work on to move
   from their CURRENT bracket (the one they're leaving) down to the next bracket.
   Key = current handicap bracket; value = focus object.
   Used by the gap widget and the coach-view path modal. */
RRG.BRACKET_FOCUS = {
  35: {
    goal: 'Keep the ball in play. Eliminate disaster holes.',
    next: 30,
    bullets: [
      'Penalty strokes are likely 5+ per round. Club down off the tee to keep it in bounds.',
      'Get putts under 40 per round — focus on speed, not line, to kill 3-putts.',
      'The target isn\'t more greens yet. It\'s fewer triples and quads.',
    ],
  },
  30: {
    goal: 'Break 100 consistently. Basic contact and alignment.',
    next: 25,
    bullets: [
      'Drive the ball past 200 yards. You can\'t score if you can\'t reach the fairway.',
      'Reduce 3-putts — GIR is still low (3 greens/round), so two-putting for bogey is your path.',
      'Get to bogey golf one hole at a time.',
    ],
  },
  25: {
    goal: 'Break 95. Eliminate penalty strokes.',
    next: 20,
    bullets: [
      'Cut penalties from ~4.7 to ~3.0 per round. OB and water are the killers.',
      'You don\'t need many more greens (one more per round). Stop losing balls.',
      'Improve scrambling to save bogey more often.',
    ],
  },
  20: {
    goal: 'Break 90. Driving distance and lag putting.',
    next: 15,
    bullets: [
      'Driving distance jump to 225+ yards. Approach game lives or dies on where you hit your drive.',
      'Putts under 34 per round. You\'re giving strokes away on the green.',
      'From 150+ yards, hit more greens — 13% → 24% success is the break-through.',
    ],
  },
  15: {
    goal: 'Break 85. The ball-striking leap.',
    next: 10,
    bullets: [
      'Biggest GIR jump — from ~5 greens to ~7 greens per round. Develop a reliable shot shape.',
      'Doubles per round must drop from ~4.5 to ~2.9. One disaster hole a round, tops.',
      'Fairways up to 49%. Your ball needs to be findable.',
    ],
  },
  10: {
    goal: 'Break 80. Scrambling and mistake avoidance.',
    next: 5,
    bullets: [
      '~8 greens per round is the target. Approach game is now the scoring engine.',
      'Penalties under 1 per round. Doubles to ~1.5. Mistakes define you here.',
      'Short game saves par 38% of the time. The wedges become a weapon.',
    ],
  },
  5: {
    goal: 'Par or better. Elite consistency and putting.',
    next: 0,
    bullets: [
      '10–11 greens per round. Scrambling 50%+. Every miss is savable.',
      '~2.3 birdies per round to offset the inevitable bogeys.',
      'Driving distance 275+. Short irons into greens, more birdie looks.',
    ],
  },
  0: {
    goal: 'Scratch. Maintain and refine.',
    next: null,
    bullets: [
      'The game is now about removing the last few leaks.',
      'Putting becomes the biggest variance killer at this level.',
      'Course management and mental game separate 0 from +2.',
    ],
  },
};

/* Stat metadata for the Path widget. key = the function name in RRG.path.stats,
   used both for rolling-average computation and for benchmark comparison. */
RRG.STATS = [
  { key: 'avg_score',    label: 'Avg Score',              unit: '',        higherBetter: false, bench: 'avg_score' },
  { key: 'drive_dist',   label: 'Driving Distance',       unit: 'yd',      higherBetter: true,  bench: 'drive_dist' },
  { key: 'fairways_pct', label: 'Fairways Hit',           unit: '%',       higherBetter: true,  bench: 'fairways_pct' },
  { key: 'gir_pct',      label: 'Greens in Regulation',   unit: '%',       higherBetter: true,  bench: 'gir_pct' },
  { key: 'putts_rd',     label: 'Putts per Round',        unit: '',        higherBetter: false, bench: 'putts_rd' },
  { key: 'scrambling',   label: 'Scrambling',             unit: '%',       higherBetter: true,  bench: 'scrambling' },
  { key: 'sand_save',    label: 'Sand Saves',             unit: '%',       higherBetter: true,  bench: 'sand_save' },
  { key: 'birdies_rd',   label: 'Birdies or Better',      unit: '',        higherBetter: true,  bench: 'birdies_rd' },
  { key: 'doubles_rd',   label: 'Doubles or Worse',       unit: '',        higherBetter: false, bench: 'doubles_rd' },
  { key: 'penalties_rd', label: 'Penalties per Round',    unit: '',        higherBetter: false, bench: 'penalties_rd' },
];

/* =============================================================================
   MAD RIVER GOLF CLUB — course data
   Used by the scorecard feature (Phase 2) to build a hole-by-hole entry form
   with the correct tee yardage, par, and stroke index per hole. Bob Cupp design,
   established 1991, Creemore Ontario. Par 72 (36 / 36).

   Tees (7 total): Gold, Blue, Green, White, Purple, Red, Yellow.
   Hybrid combo tees also exist (Gold/Blue, Blue/Green, Green/White, White/Purple,
   Purple/Red, Red/Yellow) for setup variety — added in Phase 2.
============================================================================= */
RRG.COURSES = RRG.COURSES || {};
RRG.COURSES.madriver = {
  name: 'Mad River Golf Club',
  short: 'Mad River',
  url: 'https://www.madriver.ca',
  city: 'Creemore, Ontario',
  architect: 'Bob Cupp',
  established: 1991,

  par:           [5, 4, 3, 5, 4, 4, 3, 4, 4,   4, 3, 4, 5, 3, 5, 3, 5, 4],
  mens_si:       [5, 7, 13, 1, 11, 15, 17, 9, 3,   12, 18, 2, 6, 14, 10, 16, 4, 8],
  womens_si:     [7, 5, 15, 1, 11, 13, 17, 9, 3,   10, 16, 6, 8, 18, 2, 14, 4, 12],

  /* Yardages per tee, hole 1 through 18. OUT and IN totals are computed. */
  tees: [
    { key: 'gold',   label: 'Gold',   mens_rating: 74.8, mens_slope: 141, womens_rating: null,  womens_slope: null,
      yards: [564, 444, 187, 567, 411, 287, 136, 424, 455,   386, 201, 442, 515, 200, 544, 233, 603, 459] },
    { key: 'blue',   label: 'Blue',   mens_rating: 72.4, mens_slope: 133, womens_rating: 78.5, womens_slope: 142,
      yards: [533, 414, 170, 541, 383, 267, 136, 392, 425,   343, 180, 423, 476, 180, 515, 215, 577, 438] },
    { key: 'green',  label: 'Green',  mens_rating: 70.7, mens_slope: 128, womens_rating: 76.3, womens_slope: 137,
      yards: [500, 396, 159, 522, 373, 259, 121, 370, 394,   311, 159, 380, 455, 180, 479, 190, 550, 425] },
    { key: 'white',  label: 'White',  mens_rating: 67.8, mens_slope: 123, womens_rating: 73.0, womens_slope: 131,
      yards: [455, 367, 130, 474, 341, 245, 103, 348, 373,   294, 138, 334, 382, 157, 446, 169, 491, 343] },
    { key: 'purple', label: 'Purple', mens_rating: 67.1, mens_slope: 120, womens_rating: 72.3, womens_slope: 128,
      yards: [427, 337, 118, 474, 297, 245, 103, 303, 353,   294, 138, 334, 382, 157, 410, 169, 491, 343] },
    { key: 'red',    label: 'Red',    mens_rating: 64.5, mens_slope: 118, womens_rating: 69.4, womens_slope: 122,
      yards: [385, 286,  90, 434, 264, 225,  79, 270, 353,   266, 122, 295, 348, 143, 410, 126, 459, 318] },
    { key: 'yellow', label: 'Yellow', mens_rating: 61.3, mens_slope: 114, womens_rating: 65.3, womens_slope: 114,
      yards: [339, 231,  90, 325, 231, 150,  79, 235, 276,   217, 122, 222, 348, 143, 330, 126, 325, 237] },
  ],

  /* Hybrid / combo tees from Mad River's "Hybrid Scorecard". Alternates tee
     boxes per hole to vary length and challenge. Used in Phase 2.
     Ratings are as published on Mad River's hybrid scorecard. */
  hybrids: [
    { key: 'gold_blue',   label: 'Gold/Blue',   mens_rating: 73.3, mens_slope: 136, womens_rating: null,  womens_slope: null },
    { key: 'blue_green',  label: 'Blue/Green',  mens_rating: 71.4, mens_slope: 130, womens_rating: 77.3, womens_slope: 138 },
    { key: 'green_white', label: 'Green/White', mens_rating: 69.7, mens_slope: 126, womens_rating: 74.8, womens_slope: 134 },
    { key: 'white_purple',label: 'White/Purple',mens_rating: 67.2, mens_slope: 121, womens_rating: 72.5, womens_slope: 129 },
    { key: 'purple_red',  label: 'Purple/Red',  mens_rating: 65.3, mens_slope: 119, womens_rating: 70.5, womens_slope: 126 },
    { key: 'red_yellow',  label: 'Red/Yellow',  mens_rating: 63.2, mens_slope: 116, womens_rating: 67.6, womens_slope: 119 },
  ],
};

/* =============================================================================
   TRACKMAN BENCHMARKS & METADATA
   Reference data for the TrackMan session logger. Values are approximate —
   published PGA/LPGA Tour averages shift year to year and specific sources vary.
   These are directional benchmarks, not absolute targets. The Scratch and Bogey
   tiers are coaching-world approximations anchored on PGA Tour offsets.

   For every club/tier combo: clubhead speed (mph), ball speed (mph), smash
   factor, launch angle (degrees), spin rate (rpm), carry distance (yds).
   Higher-is-better: CHS / ball / smash / carry. Launch + spin are contextual
   (too high OR too low = bad) — the UI uses a ±range comparison there.
============================================================================= */

/* Club list — the keys used as lookup in RRG.TRACKMAN_BENCHMARKS[tier] */
RRG.TRACKMAN_CLUBS = [
  { key: 'driver',  label: 'Driver' },
  { key: '3w',      label: '3-wood' },
  { key: '5w',      label: '5-wood' },
  { key: 'hybrid',  label: 'Hybrid' },
  { key: '3i',      label: '3-iron' },
  { key: '4i',      label: '4-iron' },
  { key: '5i',      label: '5-iron' },
  { key: '6i',      label: '6-iron' },
  { key: '7i',      label: '7-iron' },
  { key: '8i',      label: '8-iron' },
  { key: '9i',      label: '9-iron' },
  { key: 'pw',      label: 'PW' },
  { key: 'gw',      label: 'GW (52°)' },
  { key: 'sw',      label: 'SW (56°)' },
  { key: 'lw',      label: 'LW (60°)' },
];

/* Metric metadata for comparison UI. direction:
     'higher'  → higher is better (CHS, ball, smash, carry)
     'range'   → context-dependent (launch, spin) — near the benchmark is best */
RRG.TRACKMAN_METRICS = [
  { key: 'clubhead_speed', label: 'Clubhead Speed', unit: ' mph', direction: 'higher' },
  { key: 'ball_speed',     label: 'Ball Speed',     unit: ' mph', direction: 'higher' },
  { key: 'smash',          label: 'Smash Factor',   unit: '',     direction: 'higher', precision: 2 },
  { key: 'launch_angle',   label: 'Launch Angle',   unit: '°',    direction: 'range' },
  { key: 'spin',           label: 'Spin Rate',      unit: ' rpm', direction: 'range' },
  { key: 'carry',          label: 'Carry',          unit: ' yd',  direction: 'higher' },
];

/* Benchmark tiers — pick one per session for the comparison. The UI surfaces
   a "choose your tier" dropdown so each player can pick the reference that
   makes sense for them. */
RRG.TRACKMAN_TIERS = [
  { key: 'pga',      label: 'PGA Tour (Men)' },
  { key: 'lpga',     label: 'LPGA Tour (Women)' },
  { key: 'scratch_m',label: 'Scratch / Elite Amateur (Men)' },
  { key: 'scratch_w',label: 'Scratch / Elite Amateur (Women)' },
  { key: 'bogey_m',  label: 'Mid-Handicap (Men, ~15)' },
  { key: 'bogey_w',  label: 'Mid-Handicap (Women, ~15)' },
];

RRG.TRACKMAN_BENCHMARKS = {
  // PGA Tour averages (approx, 2020-2023 composite)
  pga: {
    driver: { clubhead_speed: 113, ball_speed: 167, smash: 1.48, launch_angle: 10.9, spin: 2686, carry: 275 },
    '3w':   { clubhead_speed: 107, ball_speed: 158, smash: 1.48, launch_angle: 9.2,  spin: 3655, carry: 243 },
    '5w':   { clubhead_speed: 103, ball_speed: 152, smash: 1.47, launch_angle: 9.4,  spin: 4350, carry: 230 },
    hybrid: { clubhead_speed: 100, ball_speed: 146, smash: 1.46, launch_angle: 10.2, spin: 4437, carry: 225 },
    '3i':   { clubhead_speed: 98,  ball_speed: 142, smash: 1.45, launch_angle: 10.4, spin: 4630, carry: 212 },
    '4i':   { clubhead_speed: 96,  ball_speed: 137, smash: 1.43, launch_angle: 11.0, spin: 4836, carry: 203 },
    '5i':   { clubhead_speed: 94,  ball_speed: 132, smash: 1.41, launch_angle: 12.1, spin: 5361, carry: 194 },
    '6i':   { clubhead_speed: 92,  ball_speed: 127, smash: 1.38, launch_angle: 14.1, spin: 6231, carry: 183 },
    '7i':   { clubhead_speed: 90,  ball_speed: 120, smash: 1.33, launch_angle: 16.3, spin: 7097, carry: 172 },
    '8i':   { clubhead_speed: 87,  ball_speed: 115, smash: 1.32, launch_angle: 18.1, spin: 7998, carry: 160 },
    '9i':   { clubhead_speed: 85,  ball_speed: 109, smash: 1.28, launch_angle: 20.4, spin: 8647, carry: 148 },
    pw:     { clubhead_speed: 83,  ball_speed: 102, smash: 1.23, launch_angle: 24.2, spin: 9304, carry: 136 },
    gw:     { clubhead_speed: 80,  ball_speed: 95,  smash: 1.19, launch_angle: 25.6, spin: 9500, carry: 120 },
    sw:     { clubhead_speed: 78,  ball_speed: 90,  smash: 1.15, launch_angle: 28,   spin: 10000, carry: 100 },
    lw:     { clubhead_speed: 75,  ball_speed: 85,  smash: 1.12, launch_angle: 30,   spin: 10500, carry: 80 },
  },
  // LPGA Tour averages (approx)
  lpga: {
    driver: { clubhead_speed: 94, ball_speed: 139, smash: 1.48, launch_angle: 13.2, spin: 2611, carry: 220 },
    '3w':   { clubhead_speed: 90, ball_speed: 132, smash: 1.47, launch_angle: 11.2, spin: 3300, carry: 195 },
    '5w':   { clubhead_speed: 87, ball_speed: 126, smash: 1.45, launch_angle: 11.8, spin: 3900, carry: 185 },
    hybrid: { clubhead_speed: 84, ball_speed: 120, smash: 1.43, launch_angle: 12.6, spin: 4200, carry: 178 },
    '5i':   { clubhead_speed: 79, ball_speed: 108, smash: 1.37, launch_angle: 14.5, spin: 5100, carry: 158 },
    '7i':   { clubhead_speed: 76, ball_speed: 102, smash: 1.34, launch_angle: 17.5, spin: 6600, carry: 140 },
    pw:     { clubhead_speed: 70, ball_speed: 88,  smash: 1.26, launch_angle: 25,   spin: 8600, carry: 107 },
  },
  // Scratch / elite amateur men (~3% below PGA)
  scratch_m: {
    driver: { clubhead_speed: 107, ball_speed: 158, smash: 1.47, launch_angle: 11.5, spin: 2800, carry: 255 },
    '3w':   { clubhead_speed: 101, ball_speed: 148, smash: 1.46, launch_angle: 10.2, spin: 3800, carry: 225 },
    hybrid: { clubhead_speed: 95,  ball_speed: 138, smash: 1.45, launch_angle: 11.0, spin: 4500, carry: 210 },
    '5i':   { clubhead_speed: 88,  ball_speed: 122, smash: 1.38, launch_angle: 13.5, spin: 5500, carry: 178 },
    '7i':   { clubhead_speed: 84,  ball_speed: 110, smash: 1.30, launch_angle: 17.0, spin: 7200, carry: 156 },
    pw:     { clubhead_speed: 78,  ball_speed: 95,  smash: 1.21, launch_angle: 25,   spin: 9200, carry: 122 },
  },
  // Scratch / elite amateur women
  scratch_w: {
    driver: { clubhead_speed: 88, ball_speed: 129, smash: 1.46, launch_angle: 13.8, spin: 2750, carry: 200 },
    '3w':   { clubhead_speed: 84, ball_speed: 122, smash: 1.45, launch_angle: 12.0, spin: 3500, carry: 180 },
    hybrid: { clubhead_speed: 80, ball_speed: 114, smash: 1.42, launch_angle: 13.2, spin: 4400, carry: 165 },
    '7i':   { clubhead_speed: 72, ball_speed: 96,  smash: 1.33, launch_angle: 18.0, spin: 6800, carry: 130 },
    pw:     { clubhead_speed: 65, ball_speed: 82,  smash: 1.25, launch_angle: 26,   spin: 8800, carry: 95 },
  },
  // Mid-handicap men (~15 hdcp)
  bogey_m: {
    driver: { clubhead_speed: 93,  ball_speed: 135, smash: 1.45, launch_angle: 12.5, spin: 3000, carry: 215 },
    '3w':   { clubhead_speed: 89,  ball_speed: 128, smash: 1.44, launch_angle: 11.0, spin: 3900, carry: 195 },
    hybrid: { clubhead_speed: 85,  ball_speed: 120, smash: 1.41, launch_angle: 12.0, spin: 4600, carry: 180 },
    '7i':   { clubhead_speed: 78,  ball_speed: 100, smash: 1.28, launch_angle: 18.0, spin: 7500, carry: 138 },
    pw:     { clubhead_speed: 72,  ball_speed: 86,  smash: 1.19, launch_angle: 25,   spin: 9500, carry: 105 },
  },
  // Mid-handicap women (~15 hdcp)
  bogey_w: {
    driver: { clubhead_speed: 75, ball_speed: 108, smash: 1.44, launch_angle: 14.5, spin: 3200, carry: 165 },
    '3w':   { clubhead_speed: 72, ball_speed: 102, smash: 1.42, launch_angle: 13.0, spin: 4000, carry: 148 },
    hybrid: { clubhead_speed: 68, ball_speed: 95,  smash: 1.40, launch_angle: 14.0, spin: 4800, carry: 135 },
    '7i':   { clubhead_speed: 63, ball_speed: 82,  smash: 1.30, launch_angle: 19.0, spin: 7000, carry: 110 },
    pw:     { clubhead_speed: 58, ball_speed: 70,  smash: 1.21, launch_angle: 26,   spin: 9000, carry: 82 },
  },
};

