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
RRG.WEDGE_SHOTS = ['Full', '¾ swing', '½ swing'];
