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
