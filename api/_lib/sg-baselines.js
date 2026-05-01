// =====================================================================
// Strokes Gained — baseline tables (β data, public-source bootstrap)
// =====================================================================
// Source: aggregated from publicly-available USGA / R&A / ARCCOS data
// dumps + PGA Tour SG distributions, normalized to per-round numbers.
// These are STARTING baselines. Once a tier accumulates ≥30 rounds in
// our own data, RRG.approach (and the future SG endpoints) auto-switch
// to cohort-driven baselines for that tier per `BASELINE_SOURCE` flag.
//
// All values are "expected for an average player at this handicap tier."
// SG vs tier = (player's actual) − (tier expected).
//   Positive SG → player gained strokes vs their tier
//   Negative SG → player lost strokes vs their tier
//
// Used by api/compute-sg.js. Mirror this shape if you ever add a
// client-side compute path.

// --- Handicap-tier classification ---------------------------------------
// Map a numeric handicap → tier key. Players without a recorded handicap
// default to '10-handicap' (the most common amateur tier).
function tierForHandicap(h) {
  const n = (h == null || h === '') ? null : Number(h);
  if (n == null || Number.isNaN(n)) return '10-handicap';
  if (n <= 9)  return 'single-digit';   // 0-9
  if (n <= 14) return '10-handicap';    // 10-14
  if (n <= 19) return '15-handicap';    // 15-19
  return '20-plus';                      // 20+
}

// --- SG-Approach: expected GIR% by distance bucket × tier ---------------
// Per-bucket expected GIR rate. Player's actual GIR% in that bucket is
// compared to expected; the delta × stroke value per GIR yields SG-App.
const APPROACH_EXPECTED_GIR = {
  'single-digit': {
    '50-75': 0.78, '75-100': 0.68, '100-125': 0.58, '125-150': 0.48,
    '150-175': 0.40, '175-200': 0.30, '200-225': 0.22, '225+': 0.15,
  },
  '10-handicap': {
    '50-75': 0.62, '75-100': 0.52, '100-125': 0.42, '125-150': 0.33,
    '150-175': 0.26, '175-200': 0.20, '200-225': 0.14, '225+': 0.10,
  },
  '15-handicap': {
    '50-75': 0.48, '75-100': 0.38, '100-125': 0.30, '125-150': 0.23,
    '150-175': 0.18, '175-200': 0.13, '200-225': 0.09, '225+': 0.06,
  },
  '20-plus': {
    '50-75': 0.34, '75-100': 0.26, '100-125': 0.20, '125-150': 0.15,
    '150-175': 0.11, '175-200': 0.08, '200-225': 0.05, '225+': 0.03,
  },
};

// PGA Tour comparison row (already in adult/portal app.js as TOUR_GIR_PCT
// for the spider chart — duplicated here as decimals so SG math is uniform).
const APPROACH_TOUR_GIR = {
  '50-75': 0.95, '75-100': 0.91, '100-125': 0.86, '125-150': 0.78,
  '150-175': 0.70, '175-200': 0.62, '200-225': 0.54, '225+': 0.45,
};

// --- SG-Off-the-Tee baselines ------------------------------------------
// Expected per-round on par 4/5 only.
//   firPct       = expected fairways-in-regulation rate
//   driveYards   = expected average carry (yards) for the tier
//   penaltyRate  = expected % of tee shots that result in 'X' (penalty/lost)
const OTT_EXPECTED = {
  'single-digit': { firPct: 0.62, driveYards: 245, penaltyRate: 0.04 },
  '10-handicap':  { firPct: 0.52, driveYards: 225, penaltyRate: 0.07 },
  '15-handicap':  { firPct: 0.42, driveYards: 205, penaltyRate: 0.11 },
  '20-plus':      { firPct: 0.32, driveYards: 185, penaltyRate: 0.16 },
};

// Stroke-value coefficients used to convert FIR/penalty/distance deltas
// into SG units. Calibrated so a typical par-4 hits ~0.5 SG impact.
const OTT_STROKE_VALUES = {
  perFirGain:     0.35,   // each "extra" fairway hit beyond expected = +0.35 strokes
  perPenaltyMiss: -0.65,  // each penalty/X miss above expected = -0.65 strokes
  perTenYards:    0.05,   // every 10 yards over/under expected drive = ±0.05 strokes
};

// --- SG-Around-the-Green baselines -------------------------------------
// Save% (up-and-down rate) per tier, split by chip difficulty.
//   easyPct = expected save% from "Easy" lies (open chip, simple shot)
//   hardPct = expected save% from "Hard" lies (short-sided, awkward)
const ARG_EXPECTED = {
  'single-digit': { easyPct: 0.62, hardPct: 0.38 },
  '10-handicap':  { easyPct: 0.50, hardPct: 0.28 },
  '15-handicap':  { easyPct: 0.38, hardPct: 0.20 },
  '20-plus':      { easyPct: 0.28, hardPct: 0.13 },
};

const ARG_STROKE_VALUES = {
  perSaveDelta: 0.55,   // each save above (or below) expected = ±0.55 strokes
};

// --- SG-Putting baselines ----------------------------------------------
// Expected putts from a given first-putt distance for the tier.
// First putt distance buckets in feet.
// Source: amateur-tier extrapolation from PGA Tour make% data.
const PUTTING_EXPECTED_PUTTS = {
  // distance bucket (ft) → expected putts (1.0 = always make first try)
  // tier-aware via multiplier below
};

// We use a smooth-ish formula instead of a giant table:
// expected putts from D feet (single-digit baseline) ≈
//   1 + (1 - makeRateFromDistance(D))
// where makeRateFromDistance comes from a tier curve.
function makeRateFromDistance(distanceFt, tier) {
  // Single-digit make-rate baseline (logistic-ish curve). At 3 feet ~92%,
  // 8 ft ~50%, 15 ft ~25%, 30 ft ~7%, 40+ ~3%.
  const baseRate = (() => {
    if (distanceFt <= 2)  return 0.98;
    if (distanceFt <= 3)  return 0.92;
    if (distanceFt <= 5)  return 0.78;
    if (distanceFt <= 8)  return 0.50;
    if (distanceFt <= 12) return 0.30;
    if (distanceFt <= 15) return 0.22;
    if (distanceFt <= 20) return 0.15;
    if (distanceFt <= 25) return 0.10;
    if (distanceFt <= 30) return 0.07;
    if (distanceFt <= 40) return 0.04;
    return 0.02;
  })();
  // Tier penalty multiplier — non-single-digit players miss more.
  const tierMult = {
    'single-digit': 1.00,
    '10-handicap':  0.85,
    '15-handicap':  0.70,
    '20-plus':      0.55,
  }[tier] || 0.85;
  return Math.max(0.01, Math.min(0.99, baseRate * tierMult));
}

// Expected putts from D feet given tier. Used by SG-Putting compute.
function expectedPuttsFromDistance(distanceFt, tier) {
  if (distanceFt == null || distanceFt < 0) return null;
  const make1 = makeRateFromDistance(distanceFt, tier);
  // Approximation: if you don't make the first putt (1 - make1 chance),
  // you typically two-putt from this distance. Three-putt rate climbs at
  // longer distances; folded into the second-putt make rate.
  const expected = 1 + (1 - make1) + threePuttRate(distanceFt, tier);
  return Math.round(expected * 100) / 100;
}

function threePuttRate(distanceFt, tier) {
  // Rough 3-putt rate from this distance (probability of 3+ putts).
  const base = (() => {
    if (distanceFt <= 10) return 0.01;
    if (distanceFt <= 20) return 0.05;
    if (distanceFt <= 30) return 0.12;
    if (distanceFt <= 40) return 0.20;
    return 0.30;
  })();
  const tierMult = {
    'single-digit': 0.7,
    '10-handicap':  1.0,
    '15-handicap':  1.4,
    '20-plus':      1.8,
  }[tier] || 1.0;
  return Math.min(0.45, base * tierMult);
}

export {
  tierForHandicap,
  APPROACH_EXPECTED_GIR,
  APPROACH_TOUR_GIR,
  OTT_EXPECTED,
  OTT_STROKE_VALUES,
  ARG_EXPECTED,
  ARG_STROKE_VALUES,
  expectedPuttsFromDistance,
  makeRateFromDistance,
  threePuttRate,
};
