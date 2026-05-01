// =====================================================================
// Practice Prescription engine
// =====================================================================
// Given a player's SG breakdown for a round, generate a specific,
// time-boxed, measurable practice prescription targeting their biggest
// leak. Rules-based — 14 templates indexed by leak category + sub-pattern.
//
// Used by api/_lib/sg-compute.js to populate the `prescription` field on
// the strokes_gained payload. Player sees the output on their dashboard
// directly under the SG card.
//
// Each prescription has:
//   id     — stable identifier for tracking which prescriptions worked
//   title  — short headline (e.g. "Wedge zone, 100-125y")
//   drill  — exact drill description
//   goal   — measurable success criterion
//   why    — short coaching context tying it back to the SG number

function applyPrescription({ tier, ott, app, arg, putt, topLeak }) {
  if (!topLeak) {
    // No clear leak — give a maintenance prescription that consolidates a strength.
    return MAINTENANCE_PRESCRIPTION;
  }

  switch (topLeak.category) {
    case 'app':  return prescribeApp(app, topLeak);
    case 'putt': return prescribePutt(putt, topLeak);
    case 'arg':  return prescribeArg(arg, topLeak);
    case 'ott':  return prescribeOtt(ott, topLeak);
    default:     return MAINTENANCE_PRESCRIPTION;
  }
}

// --- Approach prescriptions --------------------------------------------
// Pick the sub-bucket where the player is leaking most. Time-box the
// prescription based on tier (juniors get shorter sessions).
function prescribeApp(app, topLeak) {
  const perBucket = (app.components && app.components.per_bucket) || {};
  let worstBucket = null;
  let worstSg = 0;
  Object.keys(perBucket).forEach(b => {
    const e = perBucket[b];
    if (!e || e.attempts < 1) return;
    if (e.sg < worstSg) { worstSg = e.sg; worstBucket = b; }
  });

  if (!worstBucket) {
    return {
      id: 'app-generic',
      title: 'Shots into the green — distance accuracy',
      drill: 'Spend 30 minutes on a TrackMan or marked range. Hit 8 balls each from 75 yards, 100 yards, 125 yards, and 150 yards. For each, see how close you get to the target on average and how spread out your shots are.',
      goal: 'Get inside 25 feet of the target on average from each distance, with shots no more than 15 yards apart side-to-side.',
      why: `You lost ${topLeak.deficit} strokes on your shots into the green this round. Practice the distances you actually face on the course.`,
    };
  }

  const bucketDrills = {
    '50-75':   { d: 'Hit 50 wedges from 60y to a target circle on the range.', g: '35 of 50 inside 20 feet of the pin.', focus: '60-yard wedges' },
    '75-100':  { d: 'Hit 50 wedges from 90y to a target on the range.',         g: '32 of 50 inside 25 feet.',           focus: '90-yard wedges' },
    '100-125': { d: 'Hit 50 wedges/PWs from 110y to a target on the range.',    g: '30 of 50 inside 25 feet.',           focus: '100–125y zone' },
    '125-150': { d: 'Hit 40 short irons from 135y to a target.',                g: '24 of 40 inside 30 feet.',           focus: '125–150y irons' },
    '150-175': { d: 'Hit 40 mid-irons from 165y to a target.',                  g: '20 of 40 inside 35 feet.',           focus: '150–175y irons' },
    '175-200': { d: 'Hit 30 mid/long irons from 185y to a target.',             g: '13 of 30 inside 40 feet.',           focus: '175–200y zone' },
    '200-225': { d: 'Hit 25 hybrids/long irons from 215y.',                     g: '10 of 25 inside 50 feet.',           focus: '200–225y long approach' },
    '225+':    { d: 'Hit 20 fairway woods/hybrids from 230y+.',                 g: '7 of 20 inside 60 feet.',            focus: '225+y long approach' },
  };
  const drill = bucketDrills[worstBucket] || bucketDrills['100-125'];

  return {
    id: `app-${worstBucket}`,
    title: `Shots into the green — ${drill.focus}`,
    drill: `30 minutes this week. ${drill.d}`,
    goal: drill.g,
    why: `You lost ${topLeak.deficit} strokes on your shots into the green this round, mostly from ${worstBucket} yards. Fix that one distance and the strokes come right back. Play another round and we'll see if the gap shrinks.`,
  };
}

// --- Putting prescriptions ---------------------------------------------
function prescribePutt(putt, topLeak) {
  const sgByDist = (putt.components && putt.components.sg_by_distance) || {};
  const threePutts = (putt.components && putt.components.three_putt_count) || 0;

  // If three-putts > 1, prescription is distance-control work on long putts.
  if (threePutts >= 2) {
    return {
      id: 'putt-lag-3putt',
      title: 'Putting — distance control on long putts',
      drill: '20 minutes. From 30 feet, hit 30 putts to a tee stuck in the green. Try to leave every putt within 3 feet for a tap-in.',
      goal: '24 of 30 putts end up inside 3 feet of the target.',
      why: `You three-putted ${threePutts} times this round. Three-putts are almost always about distance control on long putts, not your stroke. Build the touch.`,
    };
  }

  // Else find worst distance bucket
  let worstBucket = null;
  let worstSg = 0;
  Object.keys(sgByDist).forEach(b => {
    const e = sgByDist[b];
    if (!e || e.holes < 1) return;
    if (e.sg < worstSg) { worstSg = e.sg; worstBucket = b; }
  });

  const bucketDrills = {
    'inside-5': { d: 'Hit 50 putts from 4 feet around the cup. Build the muscle of "always make the short one."', g: '47 of 50 made.',  focus: 'short putts (inside 5 feet)' },
    '5-15':     { d: 'Hit 30 putts from 8 feet (3 from each side of the cup).',                                    g: '15 of 30 made.', focus: 'mid-range putts (5–15 feet)' },
    '15-30':    { d: 'Hit 20 putts from 20 feet to a 4-foot circle. Get the speed right first; line second.',     g: '14 of 20 putts end up inside the circle.', focus: 'long putts (15–30 feet)' },
    '30+':      { d: 'Hit 20 putts from 35 feet, focusing only on speed. Get every one to within 4 feet.',         g: '15 of 20 putts end up inside 4 feet.',     focus: 'really long putts (30 feet and longer)' },
  };
  const drill = bucketDrills[worstBucket] || bucketDrills['5-15'];

  return {
    id: `putt-${worstBucket || 'general'}`,
    title: `Putting — ${drill.focus}`,
    drill: `20 minutes this week. ${drill.d}`,
    goal: drill.g,
    why: `You lost ${topLeak.deficit} strokes putting this round. The biggest issue is in your ${drill.focus}.`,
  };
}

// --- Around-the-Green prescriptions ------------------------------------
function prescribeArg(arg, topLeak) {
  const c = arg.components || {};
  const easyShortfall = c.easy ? (c.easy.expected - c.easy.saves) : 0;
  const hardShortfall = c.hard ? (c.hard.expected - c.hard.saves) : 0;

  if (easyShortfall > 0.5 && easyShortfall >= hardShortfall) {
    return {
      id: 'arg-easy-saves',
      title: 'Short game — make the easy chips count',
      drill: '25 minutes. Find a flat spot 10 yards off the green. Hit 30 chips with your 56-degree wedge. Focus on solid contact and the right distance — don\'t try to hole every one, just leave each one close to the pin.',
      goal: 'Every chip lands on the line you picked; 20 of 30 finish within 6 feet of the pin.',
      why: `You missed about ${easyShortfall.toFixed(1)} chip saves you should have made this round. Those are easy strokes you're giving away on chips that aren't even hard.`,
    };
  }

  if (hardShortfall > 0.5) {
    return {
      id: 'arg-hard-saves',
      title: 'Short game — getting out of trouble',
      drill: '25 minutes. Drop balls in tough spots: short-sided to a tight pin, deep greenside rough, soft sand. Hit 5 from each of 4 different bad lies.',
      goal: 'Get every shot to within 8 feet of the pin. The goal is "never make a double bogey from a tough spot."',
      why: 'Tough chips aren\'t about getting them in the hole — they\'re about damage control. The goal is bogey at worst, not double or triple.',
    };
  }

  return {
    id: 'arg-general',
    title: 'Short game — different shots from different spots',
    drill: '20 minutes. Drop 10 balls around the green in different spots and from different distances. Hit each one to a target on the green.',
    goal: '7 of 10 finish inside 8 feet of the pin.',
    why: `You lost ${topLeak.deficit} strokes around the green this round. The course gives you different chips every round — practice that variety.`,
  };
}

// --- Off-the-Tee prescriptions -----------------------------------------
function prescribeOtt(ott, topLeak) {
  const c = ott.components || {};
  const penalties = c.penalty_count || 0;
  const firPct = c.fir_pct || 0;
  const firExpected = c.fir_pct_expected || 0;

  if (penalties >= 2) {
    return {
      id: 'ott-penalties',
      title: 'Driver — stop the OB and lost-ball tee shots',
      drill: '20 minutes on the range. 30 swings with the driver, but slow tempo — 80% effort. Count one number: how many of those swings would have stayed in play on a 30-yard-wide fairway.',
      goal: '25 of 30 swings would stay in play.',
      why: `You hit ${penalties} tee shots that went out of bounds or got lost this round. That's ${(penalties * 0.65).toFixed(1)} strokes you handed back. Tempo before power until the big miss is gone.`,
    };
  }

  if (firPct < firExpected - 5) {
    return {
      id: 'ott-fir',
      title: 'Driver — accuracy off the tee',
      drill: '20 minutes. 40 tee shots, aiming at a 30-yard-wide corridor. Use a 3-wood or 5-wood for half the swings if the driver is the problem.',
      goal: '28 of 40 tee shots stay in the corridor.',
      why: `You hit ${firPct}% of fairways this round, vs about ${firExpected}% expected for golfers at your level. Accuracy first — distance comes once the ball is in play.`,
    };
  }

  return {
    id: 'ott-general',
    title: 'Driver — consistency',
    drill: '20 minutes. 30 driver swings with one focus point (either your alignment or your ball position). Same swing thought, every swing.',
    goal: '24 of 30 swings feel exactly the same to you.',
    why: `You lost ${topLeak.deficit} strokes off the tee. Your swing's there; the consistency isn't yet.`,
  };
}

// --- Maintenance (no clear leak) ---------------------------------------
const MAINTENANCE_PRESCRIPTION = {
  id: 'maintenance',
  title: 'Stay sharp — keep what\'s working',
  drill: '30 minutes. 50 balls split evenly across driver, 8-iron, and wedge. Same swing thought through all three clubs.',
  goal: 'Solid contact and shot shape on all three clubs.',
  why: 'Your round was balanced — no one part of your game cost you more than the others. Don\'t go fixing things that aren\'t broken. Just keep what\'s working sharp.',
};

export { applyPrescription, MAINTENANCE_PRESCRIPTION };
