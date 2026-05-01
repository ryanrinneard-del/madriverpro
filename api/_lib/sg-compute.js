// =====================================================================
// Strokes Gained — compute logic
// =====================================================================
// Core math for the four-category SG framework. Lives in api/_lib/ so
// it's testable in isolation and re-usable from any server endpoint.
//
// Inputs come from the rounds row that the scorecard submits:
//   - hole_detail.rows[]: per-hole data (score, putts, tee_dir, first_putt,
//                         difficulty, approach_dist, scoring_club, fw_hit, par)
//   - drive_dist:         round-level average drive (yards)
//   - approach_data:      per-bucket {attempts, gir} rollup (already computed)
//
// Output shape (passed back to scorecard for the rounds.strokes_gained payload):
//   {
//     tier: 'single-digit' | '10-handicap' | ...,
//     total: <signed number, strokes vs tier baseline>,
//     categories: {
//       ott:  { value, components: {...} },
//       app:  { value, components: {...} },
//       arg:  { value, components: {...} },
//       putt: { value, components: {...} },
//     },
//     top_leak: { category: 'app', label: 'Approach', deficit: 2.1, narrative: '...' } | null,
//     prescription: { id, title, drill, goal } | null,
//   }
// (top_leak / prescription get filled in by sg-prescriptions.js.)

import * as B from './sg-baselines.js';
import { applyPrescription } from './sg-prescriptions.js';

// --- SG-Off-the-Tee -----------------------------------------------------
// Counts only par 4/5 tee shots. Components: FIR delta, penalty rate
// delta, distance delta. Sum is the SG-OTT for the round.
function computeSgOtt(round, tier) {
  const rows = ((round.hole_detail || {}).rows) || [];
  const teeShots = rows.filter(r => (r.par >= 4));
  const teeCount = teeShots.length;
  if (teeCount === 0) {
    return { value: null, components: { reason: 'no par 4/5 tee shots' } };
  }

  const firCount = teeShots.filter(r => r.tee_dir === 'F').length;
  const penaltyCount = teeShots.filter(r => r.tee_dir === 'X').length;

  const expected = B.OTT_EXPECTED[tier];
  const v = B.OTT_STROKE_VALUES;

  const expectedFir = teeCount * expected.firPct;
  const firDelta = firCount - expectedFir;

  const expectedPen = teeCount * expected.penaltyRate;
  const penDelta = penaltyCount - expectedPen;

  // Distance: round-level drive_dist if present; null if not entered
  const driveYards = round.drive_dist ? Number(round.drive_dist) : null;
  const distDelta = driveYards != null ? (driveYards - expected.driveYards) / 10 : 0;

  const sgFir = firDelta * v.perFirGain;
  // perPenaltyMiss is already negative (-0.65). Positive penDelta means more
  // penalties than expected, which directly multiplies to a negative SG.
  // (Earlier draft had a stray * -1 that flipped the sign — subtle bug.)
  const sgPen = penDelta * v.perPenaltyMiss;
  const sgDist = distDelta * v.perTenYards;

  const value = round2(sgFir + sgPen + sgDist);

  return {
    value,
    components: {
      tee_shots: teeCount,
      fir_count: firCount, fir_expected: round2(expectedFir),
      fir_pct: round2(firCount / teeCount * 100),
      fir_pct_expected: round2(expected.firPct * 100),
      penalty_count: penaltyCount, penalty_expected: round2(expectedPen),
      drive_yards: driveYards, drive_expected: expected.driveYards,
      sg_from_fir: round2(sgFir),
      sg_from_penalties: round2(sgPen),
      sg_from_distance: round2(sgDist),
    },
  };
}

// --- SG-Approach --------------------------------------------------------
// Uses the per-bucket {attempts, gir} rollup already on the round.
// For each bucket: actual GIR% vs expected. Delta × stroke value.
function computeSgApp(round, tier) {
  const ad = round.approach_data || {};
  const expected = B.APPROACH_EXPECTED_GIR[tier];
  const buckets = Object.keys(expected);

  let totalAttempts = 0;
  let totalDeltaGirs = 0;
  const perBucket = {};

  buckets.forEach(b => {
    const e = ad[b] || { attempts: 0, gir: 0 };
    const a = e.attempts || 0;
    const g = e.gir || 0;
    totalAttempts += a;
    if (a === 0) {
      perBucket[b] = { attempts: 0, gir: 0, expected_gir_pct: round2(expected[b] * 100), sg: 0 };
      return;
    }
    const expGirs = a * expected[b];
    const deltaGirs = g - expGirs;
    totalDeltaGirs += deltaGirs;
    // Each "extra" GIR vs expected ≈ 0.5 strokes saved (typical par/bogey delta)
    const sg = deltaGirs * 0.5;
    perBucket[b] = {
      attempts: a, gir: g, gir_pct: round2(g / a * 100),
      expected_gir_pct: round2(expected[b] * 100),
      sg: round2(sg),
    };
  });

  if (totalAttempts === 0) {
    return { value: null, components: { reason: 'no approach distances entered', per_bucket: perBucket } };
  }

  const value = round2(totalDeltaGirs * 0.5);

  return {
    value,
    components: {
      total_attempts: totalAttempts,
      total_delta_girs: round2(totalDeltaGirs),
      per_bucket: perBucket,
    },
  };
}

// --- SG-Around-the-Green ------------------------------------------------
// Pulls every hole where GIR was missed. Expected save% from the lie type
// vs actual saves. Uses round.up_down ("X / Y") for actual scramble totals
// where possible; falls back to per-hole derivation.
function computeSgArg(round, tier) {
  const rows = ((round.hole_detail || {}).rows) || [];
  // A hole counts as "missed green" if (score - putts) > par - 2 (i.e., not GIR).
  // We then look at the scramble outcome: did they make par or better?
  const scrambleHoles = rows.filter(r => {
    if (r.score == null || r.putts == null || r.par == null) return false;
    const reach = r.score - r.putts;
    return reach > (r.par - 2);  // missed green
  });

  if (scrambleHoles.length === 0) {
    return { value: null, components: { reason: 'no missed greens with full data' } };
  }

  const expected = B.ARG_EXPECTED[tier];

  let easyAttempts = 0, easySaves = 0;
  let hardAttempts = 0, hardSaves = 0;
  let skippedNoDifficulty = 0;   // missed greens where the kid didn't mark E/H — excluded from SG to avoid penalizing data laziness

  scrambleHoles.forEach(r => {
    const saved = r.score <= r.par;
    if (r.difficulty === 'S') {           // 'Esy' = simple chip
      easyAttempts++; if (saved) easySaves++;
    } else if (r.difficulty === 'T') {    // 'Hrd' = tough/short-sided
      hardAttempts++; if (saved) hardSaves++;
    } else {
      skippedNoDifficulty++;
    }
  });

  // If they marked NO difficulties at all, don't fabricate an ARG number.
  if (easyAttempts === 0 && hardAttempts === 0) {
    return {
      value: null,
      components: {
        reason: 'no chip-difficulty marks on missed greens',
        missed_greens: scrambleHoles.length,
        skipped_no_difficulty: skippedNoDifficulty,
      },
    };
  }

  const easyExp = easyAttempts * expected.easyPct;
  const hardExp = hardAttempts * expected.hardPct;

  const totalDeltaSaves =
    (easySaves - easyExp) +
    (hardSaves - hardExp);

  const value = round2(totalDeltaSaves * B.ARG_STROKE_VALUES.perSaveDelta);

  return {
    value,
    components: {
      missed_greens: scrambleHoles.length,
      scored_attempts: easyAttempts + hardAttempts,
      easy: { attempts: easyAttempts, saves: easySaves, expected: round2(easyExp), expected_pct: round2(expected.easyPct * 100) },
      hard: { attempts: hardAttempts, saves: hardSaves, expected: round2(hardExp), expected_pct: round2(expected.hardPct * 100) },
      skipped_no_difficulty: skippedNoDifficulty,
      total_delta_saves: round2(totalDeltaSaves),
    },
  };
}

// --- SG-Putting ---------------------------------------------------------
// For each hole with a recorded first putt distance + putts count:
//   expected putts from that distance for the tier
//   actual putts = r.putts
//   SG per hole = expected - actual (positive = gained)
function computeSgPutt(round, tier) {
  const rows = ((round.hole_detail || {}).rows) || [];
  const puttHoles = rows.filter(r => r.first_putt != null && r.putts != null && r.putts > 0);

  if (puttHoles.length === 0) {
    return { value: null, components: { reason: 'no first-putt distances entered' } };
  }

  let totalDelta = 0;
  let totalExpected = 0;
  let totalActual = 0;
  let threePuttCount = 0;
  const byBucket = { 'inside-5': { holes: 0, sg: 0 }, '5-15': { holes: 0, sg: 0 }, '15-30': { holes: 0, sg: 0 }, '30+': { holes: 0, sg: 0 } };

  puttHoles.forEach(r => {
    const d = Number(r.first_putt);
    const exp = B.expectedPuttsFromDistance(d, tier);
    if (exp == null) return;
    const act = Number(r.putts);
    const delta = exp - act;  // positive = gained strokes
    totalDelta += delta;
    totalExpected += exp;
    totalActual += act;
    if (act >= 3) threePuttCount++;
    const bk = d <= 5 ? 'inside-5' : d <= 15 ? '5-15' : d <= 30 ? '15-30' : '30+';
    byBucket[bk].holes++;
    byBucket[bk].sg += delta;
  });

  Object.keys(byBucket).forEach(k => { byBucket[k].sg = round2(byBucket[k].sg); });

  return {
    value: round2(totalDelta),
    components: {
      putt_holes: puttHoles.length,
      total_putts_actual: totalActual,
      total_putts_expected: round2(totalExpected),
      three_putt_count: threePuttCount,
      sg_by_distance: byBucket,
    },
  };
}

// --- Top-level orchestrator --------------------------------------------
function computeStrokesGained(round, profile) {
  const tier = B.tierForHandicap(profile && profile.handicap);

  const ott  = computeSgOtt(round, tier);
  const app  = computeSgApp(round, tier);
  const arg  = computeSgArg(round, tier);
  const putt = computeSgPutt(round, tier);

  // Total SG: sum of categories (treat null as 0 so sparse rounds still produce a number).
  const total = round2(
    (ott.value  ?? 0) +
    (app.value  ?? 0) +
    (arg.value  ?? 0) +
    (putt.value ?? 0)
  );

  // Top leak: category with the most-negative SG (only consider ones that actually have data).
  const cats = [
    { key: 'ott',  label: 'Off the Tee',     value: ott.value },
    { key: 'app',  label: 'Approach',        value: app.value },
    { key: 'arg',  label: 'Around the Green', value: arg.value },
    { key: 'putt', label: 'Putting',         value: putt.value },
  ];
  const withData = cats.filter(c => c.value != null);
  let topLeak = null;
  if (withData.length > 0) {
    const worst = withData.reduce((min, c) => c.value < min.value ? c : min, withData[0]);
    if (worst.value < -0.3) {  // threshold so we don't flag noise
      topLeak = {
        category: worst.key,
        label: worst.label,
        deficit: round2(Math.abs(worst.value)),
      };
    }
  }

  // Prescription — pulled from sg-prescriptions.js based on top leak + components.
  const prescription = applyPrescription({ tier, ott, app, arg, putt, topLeak });

  return {
    tier,
    total,
    categories: { ott, app, arg, putt },
    top_leak: topLeak,
    prescription,
    computed_at: new Date().toISOString(),
  };
}

function round2(n) {
  if (n == null || Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}

export {
  computeStrokesGained,
  computeSgOtt,
  computeSgApp,
  computeSgArg,
  computeSgPutt,
};
