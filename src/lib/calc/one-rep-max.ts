// Estimated one-rep max, as Vector Lift computes it (lift-track src/lib/strength.ts e1rm): Epley, with reps left
// in reserve counted as reps that could have been done. Brzycki is here only for comparison, and the rep-max table
// runs Epley backwards. Loads are kg; every equation is linear in the load, so any unit gives the same answer in
// that unit.

/** Input limits for the calculator: reps done and reps left in reserve, whole numbers. */
export const ONE_REP_MAX_LIMITS = {
  reps: { min: 1, max: 20 },
  rir: { min: 0, max: 5 },
} as const;

/** Beyond this many reps to failure the estimate is rough (Vector Lift's docs/progression.md, Limits). */
export const ROUGH_BEYOND_REPS = 12;

/** Brzycki is shown for comparison up to this many reps to failure. */
export const BRZYCKI_MAX_REPS = 10;

/** Rows in the rep-max table: 1 to 12 reps. */
export const REP_MAX_ROWS = 12;

/** Reps done plus reps left in reserve. Unknown or negative reserve counts as 0, as in Vector Lift. */
export function repsToFailure(reps: number, rir?: number | null): number {
  return reps + Math.max(0, rir ?? 0);
}

/**
 * Epley estimate, exactly as Vector Lift's `e1rm`: at 1 rep to failure the weight itself, otherwise
 * weight × (1 + reps to failure / 30). 0 when the weight or reps are not positive (or NaN).
 */
export function e1rm(weightKg: number, reps: number, rir?: number | null): number {
  if (!(weightKg > 0) || !(reps > 0)) return 0;
  const toFailure = repsToFailure(reps, rir);
  return toFailure <= 1 ? weightKg : weightKg * (1 + toFailure / 30);
}

/**
 * Brzycki (1993): weight × 36 / (37 − reps to failure). The same weight at 1 rep. null when the inputs are not
 * positive or the reps are 37 or more, where the equation has no meaning.
 */
export function brzycki(weightKg: number, toFailure: number): number | null {
  if (!(weightKg > 0) || !(toFailure > 0) || toFailure >= 37) return null;
  return (weightKg * 36) / (37 - toFailure);
}

/**
 * The load for `reps` reps to failure at an e1RM: Epley inverted, e1RM / (1 + reps / 30), and the e1RM itself at
 * 1 rep (the same convention as the forward estimate, so load(e1rm(w, r), r) = w).
 */
export function repMaxLoad(e1rmKg: number, reps: number): number {
  return reps <= 1 ? e1rmKg : e1rmKg / (1 + reps / 30);
}

export type RepMaxRow = { reps: number; load: number; /** Share of the e1RM, 0 to 1. */ fraction: number };

/** Rep maxes for 1 to `rows` reps, heaviest first. */
export function repMaxTable(e1rmKg: number, rows = REP_MAX_ROWS): RepMaxRow[] {
  return Array.from({ length: rows }, (_, i) => {
    const reps = i + 1;
    const load = repMaxLoad(e1rmKg, reps);
    return { reps, load, fraction: e1rmKg > 0 ? load / e1rmKg : 0 };
  });
}
