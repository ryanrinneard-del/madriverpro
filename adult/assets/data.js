/* ============================================================
   RR GOLF PERFORMANCE — Adult Coaching Portal
   data.js — single source of truth for curriculum content
   ============================================================ */

window.RRG = window.RRG || {};

/* ---------- Program metadata ---------- */
RRG.PROGRAM = {
  name: 'Adult Coaching',
  year: '2026',
  tagline: 'Private 1-on-1 coaching for adult players.',
  description:
    'Lesson-package coaching for adults who want to get better. Every lesson is 1-on-1 with Ryan, built around your game, tracked in your private portal, and backed up with video review.',
};

/* ---------- Acuity booking URLs ---------- */
RRG.ACUITY = {
  // Buy packages (5 / 10 / 20 lessons, Season Starters) from the catalog
  catalog: 'https://app.acuityscheduling.com/catalog.php?owner=25734550',
  // Book an individual adult private lesson slot (1 hr / 2 hr / 1/2 day)
  bookAdultPrivate: 'https://madriverpro.as.me/?appointmentType=category:Adult%20Private%20Lessons',
};

/* ---------- Lesson packages (CAD pricing pulled from Ryan's Acuity catalog) ---------- */
RRG.PACKAGES = [
  {
    id: 'single',
    name: 'Single Lesson',
    lessons: 1,
    price: 130,                    // starting price
    priceLabel: 'From $130',
    buyUrl: RRG.ACUITY.bookAdultPrivate,
    tiers: [
      { duration: '1 hour',  price: 130, desc: 'The most focused hour you\u2019ll spend on your game. TrackMan data, real solution, no guesswork.' },
      { duration: '2 hours', price: 245, desc: 'Deeper work. Properly diagnose, build the changes, and lock them in before you leave.' },
      { duration: '3 hours (1/2 day)', price: 355, desc: 'Three focused hours entirely around your game \u2014 the most thorough option for transformation.' },
    ],
    bullets: [
      'TrackMan data + video review',
      'Written takeaways in your portal',
      'Three durations to fit your goal',
    ],
  },
  {
    id: 'p5',
    name: 'Series of 5 Lessons',
    lessons: 5,
    price: 595,
    buyUrl: 'https://app.acuityscheduling.com/catalog.php?owner=25734550',
    bullets: [
      'Five private lessons, booked on your schedule',
      'TrackMan + video review every session',
      'Portal tracking: every lesson logged',
      'Best for targeted game work',
    ],
  },
  {
    id: 'p10',
    name: 'Series of 10 Lessons',
    lessons: 10,
    price: 1150,
    buyUrl: 'https://app.acuityscheduling.com/catalog.php?owner=25734550',
    bullets: [
      'Ten private lessons across the season',
      'Full TPI screen + mid-season re-screen',
      'Video uploads + remote analysis',
      'Most popular \u2014 season-long coaching',
    ],
  },
  {
    id: 'p20',
    name: 'Series of 20 Lessons',
    lessons: 20,
    price: 2200,
    buyUrl: 'https://app.acuityscheduling.com/catalog.php?owner=25734550',
    bullets: [
      'Twenty private lessons \u2014 full-season commitment',
      'Full TPI + fall re-screen',
      'Unlimited video review',
      'Best for serious improvers',
    ],
  },
];

/* Season Starter bundles (displayed separately on the landing / signup pages) */
RRG.SEASON_STARTERS = [
  {
    id: 'adult_starter',
    name: 'Season Starter \u2014 Adult',
    price: 649,
    retailValue: '$800+',
    description: '90-min Performance Assessment (TrackMan + TPI) + written prescription + 5 private lessons built around your results.',
    buyUrl: 'https://app.acuityscheduling.com/catalog.php?owner=25734550',
  },
  {
    id: 'junior_starter',
    name: 'Season Starter \u2014 Junior (Ages 7\u201317)',
    price: 549,
    retailValue: '$800+',
    description: '60-min Junior Performance Assessment + written Player Development Profile + 5 structured lessons including one on-course session.',
    buyUrl: 'https://app.acuityscheduling.com/catalog.php?owner=25734550',
  },
];

/* ---------- 12 Performance Codes (shared framework) ---------- */
RRG.CODES = [
  { n: '01', title: 'Swing Within Your Body', desc: 'Train movements your body can actually produce. TPI-informed.' },
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

/* ---------- Tiger 5 events (universal) ---------- */
RRG.TIGER5 = [
  { n: 1, title: 'Bogey or worse on a par 5', desc: 'Par 5s are scoring holes, not par holes.' },
  { n: 2, title: 'Big number (double bogey or worse)', desc: 'Single biggest score differential between levels.' },
  { n: 3, title: 'Blown easy save', desc: 'Within 15 yards of the green in a good lie: on the green, always.' },
  { n: 4, title: 'Three-putt', desc: 'Wasted stroke from a position where two was fully achievable.' },
  { n: 5, title: 'Bogey with a scoring club (9-iron or shorter)', desc: 'Almost always a strategic mistake, not a technique one.' },
];

/* ---------- Focus areas for multi-choice chips ---------- */
RRG.FOCUS_AREAS = [
  'Grip', 'Setup / Posture', 'Takeaway', 'Transition', 'Impact', 'Finish',
  'Ball flight', 'Clubface', 'Low point', 'Sequencing',
  'Driver', 'Irons', 'Wedges', 'Short game', 'Bunker', 'Putting',
  'Course strategy', 'Pre-shot routine', 'Mental game', 'Pressure performance',
];

/* ---------- Wedge Matrix defaults (universal) ---------- */
RRG.WEDGE_CLUBS = ['PW', 'GW / 52°', 'SW / 56°', 'LW / 60°'];
RRG.WEDGE_SHOTS = ['Full', '¾ swing', '½ swing', 'Knockdown'];

/* =============================================================================
   PATH TO GOAL — benchmarks
   Average performance metrics per handicap bracket, based on shot-tracked data
   aggregates. Used by the Gap Analysis widget on Dashboard / My Plan / History
   to compare a player's rolling averages against their TARGET handicap
   benchmarks (not scratch — their actual goal). Brackets are in 5-stroke steps
   from 35 to Scratch. Values at arbitrary handicaps are linearly interpolated
   between the two nearest brackets via RRG.path.interpolate().

   Stat direction matters: some are "higher is better" (GIR, FW, scrambling,
   sand saves, birdies, driving distance), others are "lower is better" (avg
   score, putts, doubles+, penalties). Direction is declared in RRG.STATS.
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
  { key: 'birdies_rd',   label: 'Birdies per Round',      unit: '',        higherBetter: true,  bench: 'birdies_rd' },
  { key: 'doubles_rd',   label: 'Doubles+ per Round',     unit: '',        higherBetter: false, bench: 'doubles_rd' },
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
