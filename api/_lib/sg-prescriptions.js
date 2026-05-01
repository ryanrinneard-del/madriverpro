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
      title: 'Approach work — distance accuracy',
      drill: 'Spend 30 minutes on a TrackMan or marked range hitting 8 balls each from 75y, 100y, 125y, 150y. Track average distance and dispersion.',
      goal: 'Average distance to a target inside 25 feet for each station; dispersion under 15 yards.',
      why: `You lost ${topLeak.deficit} strokes on approach this round. Practice the distances you actually face.`,
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
    title: `Approach — ${drill.focus}`,
    drill: `30 minutes this week. ${drill.d}`,
    goal: drill.g,
    why: `You lost ${topLeak.deficit} strokes on approach this round, mostly from ${worstBucket}y. That's the single highest-leverage zone to attack. Re-submit your next round and watch this number narrow.`,
  };
}

// --- Putting prescriptions ---------------------------------------------
function prescribePutt(putt, topLeak) {
  const sgByDist = (putt.components && putt.components.sg_by_distance) || {};
  const threePutts = (putt.components && putt.components.three_putt_count) || 0;

  // If three-putts > 1, prescription is lag-distance work.
  if (threePutts >= 2) {
    return {
      id: 'putt-lag-3putt',
      title: 'Putting — lag distance control',
      drill: '20 minutes. From 30 feet, hit 30 putts to a tee in the green. Try to leave every putt within 3 feet for a tap-in.',
      goal: '24 of 30 inside 3 feet of the target.',
      why: `You three-putted ${threePutts}x this round. Three-putts are almost always a lag-distance issue, not a stroke issue. Build the touch.`,
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
    'inside-5': { d: 'Hit 50 putts from 4 feet around the cup. Build the muscle of "always make the short one."', g: '47 of 50 made.',  focus: 'short putts (inside 5\')' },
    '5-15':     { d: 'Hit 30 putts from 8 feet (3 from each compass direction around the cup).',                  g: '15 of 30 made.', focus: 'mid-range (5–15\')' },
    '15-30':    { d: 'Hit 20 putts from 20 feet to a 4-foot circle. Distance control before line.',               g: '14 of 20 inside the circle.', focus: 'lag (15–30\')' },
    '30+':      { d: 'Hit 20 putts from 35 feet, focusing only on speed. Get every one to within 4 feet.',         g: '15 of 20 inside 4 feet.',     focus: 'long lag (30\'+)' },
  };
  const drill = bucketDrills[worstBucket] || bucketDrills['5-15'];

  return {
    id: `putt-${worstBucket || 'general'}`,
    title: `Putting — ${drill.focus}`,
    drill: `20 minutes this week. ${drill.d}`,
    goal: drill.g,
    why: `You lost ${topLeak.deficit} strokes putting this round. The leak is in ${drill.focus}.`,
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
      title: 'Short game — convert the easy ones',
      drill: '25 minutes. Find a flat spot 10 yards off the green. Hit 30 chips with a 56°. Goal is repeatable contact and distance, not flag-hunting.',
      goal: 'All 30 within 6 feet of the target line; 20 of 30 within 6 feet of the pin.',
      why: `You missed ${easyShortfall.toFixed(1)} expected easy saves this round. The strokes are hiding in the simple chips you should be making.`,
    };
  }

  if (hardShortfall > 0.5) {
    return {
      id: 'arg-hard-saves',
      title: 'Short game — short-sided recovery',
      drill: '25 minutes. Drop balls in tough spots: short-sided to a tight pin, in long greenside rough, or in soft sand. Hit 5 from each of 4 different lies.',
      goal: 'Get every shot to within 8 feet — the goal is "no double bogey from a tough lie."',
      why: 'Tough saves are about damage limitation, not heroics. The goal is bogey at worst.',
    };
  }

  return {
    id: 'arg-general',
    title: 'Short game — variability',
    drill: '20 minutes. Drop 10 balls greenside in different lies and distances. Hit each to a target.',
    goal: '7 of 10 inside 8 feet.',
    why: `You lost ${topLeak.deficit} strokes around the green. Build the variability your rounds demand.`,
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
      title: 'Driver — eliminate the X miss',
      drill: '20 minutes on the range. 30 swings with the driver, but slow tempo — 80% effort. Track only one number: number of swings that would have been in play on a 30-yard-wide fairway.',
      goal: '25 of 30 in play.',
      why: `You hit ${penalties} penalty/lost-ball tee shots this round. That's ${(penalties * 0.65).toFixed(1)} strokes you handed back. Tempo over power until the X miss is gone.`,
    };
  }

  if (firPct < firExpected - 5) {
    return {
      id: 'ott-fir',
      title: 'Driver — accuracy',
      drill: '20 minutes. 40 swings off a tee, target a 30-yard-wide corridor. Use a 3-wood or 5-wood for half the swings if driver is the issue.',
      goal: '28 of 40 in the corridor.',
      why: `Your FIR was ${firPct}% vs your tier baseline of ${firExpected}%. Accuracy first; you'll find distance once the ball is in play.`,
    };
  }

  return {
    id: 'ott-general',
    title: 'Driver — consistency',
    drill: '20 minutes. 30 swings with the driver focusing on a single setup checkpoint (alignment or ball position). One swing thought, repeated.',
    goal: '24 of 30 swings feel "the same" to you.',
    why: `You lost ${topLeak.deficit} strokes off the tee. The swing's there; the consistency isn't yet.`,
  };
}

// --- Maintenance (no clear leak) ---------------------------------------
const MAINTENANCE_PRESCRIPTION = {
  id: 'maintenance',
  title: 'Maintenance round — protect your strengths',
  drill: '30 minutes. 50 balls split equally across driver, 8-iron, wedge. Same swing thought across all three.',
  goal: 'Consistent contact across all three clubs. No technical work this week.',
  why: 'Your round was balanced — no big leak. Don\'t fix what isn\'t broken. Maintain.',
};

export { applyPrescription, MAINTENANCE_PRESCRIPTION };
