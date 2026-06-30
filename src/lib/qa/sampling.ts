/**
 * QA sampling-plan maths. Statistical attribute sampling (Cochran) with a
 * finite-population correction, plus a risk-weighted overlay. Used by the
 * Reviews & Sampling screen and the seed.
 */

const Z: Record<number, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

/** Cochran sample size for a proportion (worst-case p=0.5) with FPC. */
export function computeSampleSize(
  population: number,
  confidenceLevel = 95,
  marginErrorPct = 5
): number {
  const z = Z[confidenceLevel] ?? 1.96;
  const e = Math.max(marginErrorPct, 0.5) / 100;
  const p = 0.5;
  const n0 = (z * z * p * (1 - p)) / (e * e);
  if (!population || population <= 0) return Math.ceil(n0);
  const n = n0 / (1 + (n0 - 1) / population);
  return Math.min(population, Math.ceil(n));
}

/** Suggested calibration cadence: weekly until inter-rater reliability ≥ 85%, then monthly. */
export function calibrationCadence(irrScore: number): "weekly" | "monthly" {
  return irrScore >= 85 ? "monthly" : "weekly";
}
