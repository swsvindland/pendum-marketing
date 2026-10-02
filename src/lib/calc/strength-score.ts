// DOTS and Wilks (original, 1990s) points for a powerlifting total, exactly as OpenPowerlifting computes them
// (opl-data crates/coefficients/src/dots.rs and wilks.rs): the same coefficients, the same body-weight bounds and
// the same rounding to two decimals. Body weight and total are kg.

export type Sex = "male" | "female";

/** Input limits for the calculator, kg. */
export const STRENGTH_LIMITS = {
  bodyWeight: { min: 30, max: 250 },
  total: { min: 20, max: 1500 },
  squat: { min: 20, max: 700 },
  bench: { min: 20, max: 600 },
  deadlift: { min: 20, max: 600 },
} as const;

type Bounds = { min: number; max: number };

/**
 * DOTS (BVDK, Tim Konertz, 2019): denominator a·x⁴ + b·x³ + c·x² + d·x + e. Body weight outside the defined range
 * counts as the nearest bound: 40 to 210 kg for men, 40 to 150 kg for women.
 */
export const DOTS: Record<Sex, { a: number; b: number; c: number; d: number; e: number } & Bounds> = {
  male: { a: -0.000001093, b: 0.0007391293, c: -0.1918759221, d: 24.0900756, e: -307.75076, min: 40, max: 210 },
  female: { a: -0.0000010706, b: 0.0005158568, c: -0.1126655495, d: 13.6175032, e: -57.96288, min: 40, max: 150 },
};

/**
 * Wilks, original: denominator a + b·x + c·x² + d·x³ + e·x⁴ + f·x⁵. OpenPowerlifting bounds the body weight to
 * 40 to 201.9 kg for men and 26.51 to 154.53 kg for women, which keeps clear of the polynomial's asymptote.
 */
export const WILKS: Record<Sex, { a: number; b: number; c: number; d: number; e: number; f: number } & Bounds> = {
  male: {
    a: -216.0475144,
    b: 16.2606339,
    c: -0.002388645,
    d: -0.00113732,
    e: 7.01863e-6,
    f: -1.291e-8,
    min: 40,
    max: 201.9,
  },
  female: {
    a: 594.31747775582,
    b: -27.23842536447,
    c: 0.82112226871,
    d: -0.00930733913,
    e: 4.731582e-5,
    f: -9.054e-8,
    min: 26.51,
    max: 154.53,
  },
};

const bound = (x: number, { min, max }: Bounds) => Math.min(max, Math.max(min, x));

/** The body weight DOTS uses: clamped to its range. */
export const dotsBodyWeight = (sex: Sex, bodyWeightKg: number) => bound(bodyWeightKg, DOTS[sex]);

/** The body weight Wilks uses: clamped to OpenPowerlifting's range. */
export const wilksBodyWeight = (sex: Sex, bodyWeightKg: number) => bound(bodyWeightKg, WILKS[sex]);

/** DOTS multiplier: 500 / (a·x⁴ + b·x³ + c·x² + d·x + e), x the clamped body weight. */
export function dotsCoefficient(sex: Sex, bodyWeightKg: number): number {
  const { a, b, c, d, e } = DOTS[sex];
  const x = dotsBodyWeight(sex, bodyWeightKg);
  return 500 / (a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + e);
}

/** Wilks multiplier: 500 / (a + b·x + c·x² + d·x³ + e·x⁴ + f·x⁵), x the clamped body weight. */
export function wilksCoefficient(sex: Sex, bodyWeightKg: number): number {
  const { a, b, c, d, e, f } = WILKS[sex];
  const x = wilksBodyWeight(sex, bodyWeightKg);
  return 500 / (a + b * x + c * x ** 2 + d * x ** 3 + e * x ** 4 + f * x ** 5);
}

/** DOTS points: total × the DOTS multiplier. 0 when the body weight or total is not positive, as in OpenPowerlifting. */
export function dots(sex: Sex, bodyWeightKg: number, totalKg: number): number {
  if (!(bodyWeightKg > 0) || !(totalKg > 0)) return 0;
  return dotsCoefficient(sex, bodyWeightKg) * totalKg;
}

/** Wilks points: total × the Wilks multiplier. 0 when the body weight or total is not positive. */
export function wilks(sex: Sex, bodyWeightKg: number, totalKg: number): number {
  if (!(bodyWeightKg > 0) || !(totalKg > 0)) return 0;
  return wilksCoefficient(sex, bodyWeightKg) * totalKg;
}

/** Points to two decimals, half away from zero, as OpenPowerlifting stores and shows them. */
export const roundPoints = (points: number) => Math.round(points * 100) / 100;
