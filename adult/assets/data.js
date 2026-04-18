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

/* ---------- Lesson packages ---------- */
/* Pricing is a placeholder \u2014 swap in your real numbers. */
RRG.PACKAGES = [
  {
    id: 'single',
    name: 'Single Lesson',
    lessons: 1,
    price: 125,            // placeholder
    bullets: [
      'One 60-minute on-range lesson',
      'TrackMan + video review',
      'Written Performance Doc',
      'Post-lesson portal access',
    ],
  },
  {
    id: 'p5',
    name: '5-Lesson Package',
    lessons: 5,
    price: 575,            // placeholder
    bullets: [
      'Five 60-minute on-range lessons',
      'Full TPI screen + baseline',
      'Video uploads for remote analysis',
      'Wedge Matrix + Bag Map tools',
      'Best for targeted game work',
    ],
  },
  {
    id: 'p10',
    name: '10-Lesson Package',
    lessons: 10,
    price: 1095,           // placeholder
    bullets: [
      'Ten 60-minute on-range lessons',
      'Full TPI screen + re-screen',
      'Video uploads + OnForm-ready review',
      'Season-long coaching relationship',
      'Most popular',
    ],
    recommended: true,
  },
  {
    id: 'p20',
    name: '20-Lesson Package',
    lessons: 20,
    price: 2095,           // placeholder
    bullets: [
      'Twenty 60-minute on-range lessons',
      'Full TPI + fall re-screen',
      'Unlimited video review',
      'Full game rebuild program',
      'Best for serious improvers',
    ],
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
