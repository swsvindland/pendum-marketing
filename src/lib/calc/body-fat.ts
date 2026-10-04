// US Navy circumference body-fat estimate, as Pendum Body computes it (body-track src/lib/metrics.ts bodyFat), and
// the ACE body-fat categories with Pendum Body's edges (src/lib/metric-context.ts). Lengths are cm here; the
// equations take inches, so each term is divided by 2.54 first, exactly as the app does. The category is judged on
// the one-decimal value shown, where the app judges the unrounded value, so a result less than 0.05 below an edge
// is in the band below there.

export type NavyEquation = "male" | "female";

/** The tape measurements in cm. Male uses abdomen; female uses waist and hips. */
export type NavyMeasurements = {
  heightCm: number;
  neckCm: number;
  abdomenCm?: number;
  waistCm?: number;
  hipsCm?: number;
};

/** The result is kept only inside this open interval (%), as in Pendum Body. */
export const NAVY_VALID = { min: 0, max: 75 } as const;

/**
 * The circumference term of the equation, in cm: abdomen − neck (male), waist + hips − neck (female). NaN when a
 * measurement the equation needs is missing.
 */
export function navyCircumference(equation: NavyEquation, m: NavyMeasurements): number {
  return equation === "male" ? (m.abdomenCm ?? NaN) - m.neckCm : (m.waistCm ?? NaN) + (m.hipsCm ?? NaN) - m.neckCm;
}

/**
 * The raw equation (Hodgdon & Beckett 1984; AR 600-9, 2019, Appendix B), log base 10, inches inside:
 *   male   %BF = 86.010 × log10(abdomen − neck) − 70.041 × log10(height) + 36.76
 *   female %BF = 163.205 × log10(waist + hips − neck) − 97.684 × log10(height) − 78.387
 * No range check: see `navyBodyFat`.
 */
export function navyEquation(equation: NavyEquation, circumferenceCm: number, heightCm: number): number {
  return equation === "male"
    ? 86.01 * Math.log10(circumferenceCm / 2.54) - 70.041 * Math.log10(heightCm / 2.54) + 36.76
    : 163.205 * Math.log10(circumferenceCm / 2.54) - 97.684 * Math.log10(heightCm / 2.54) - 78.387;
}

/**
 * Body-fat % from the Navy equation, or null when there is no estimate: height or neck missing or not positive,
 * a circumference term of 0 or less, or a result outside the open interval (0, 75).
 */
export function navyBodyFat(equation: NavyEquation, m: NavyMeasurements): number | null {
  if (!(m.heightCm > 0) || !(m.neckCm > 0)) return null;
  const circumference = navyCircumference(equation, m);
  if (!(circumference > 0)) return null;
  const result = navyEquation(equation, circumference, m.heightCm);
  return result > NAVY_VALID.min && result < NAVY_VALID.max ? result : null;
}

/** Body fat rounded to one decimal, the precision shown and categorised. */
export const roundBodyFat = (value: number) => Math.round(value * 10) / 10;

export type BodyFatCategory = "veryLow" | "lean" | "typical" | "elevated";

/**
 * ACE category edges [low, lean, high] by sex, as Pendum Body uses them. Below low is ACE's essential fat range and
 * anything under it; low to lean the athlete range; lean to high ACE's fitness and average ranges combined; high and
 * over ACE's obese range. Each edge belongs to the band above it.
 */
export const ACE_EDGES: Record<NavyEquation, readonly [number, number, number]> = {
  male: [6, 14, 25],
  female: [14, 21, 32],
};

/** ACE's essential fat range [from, to] by sex, %: the lower part of the very-low band, not all of it. */
export const ACE_ESSENTIAL: Record<NavyEquation, readonly [number, number]> = {
  male: [2, 5],
  female: [10, 13],
};

/** True when a body-fat % is below ACE's essential fat range, judged on the one-decimal value. */
export const belowEssentialFat = (value: number, equation: NavyEquation) =>
  roundBodyFat(value) < ACE_ESSENTIAL[equation][0];

/** Category of a body-fat %, judged on the one-decimal value so the shown number and its word always agree. */
export function bodyFatCategory(value: number, equation: NavyEquation): BodyFatCategory {
  const v = roundBodyFat(value);
  const [low, lean, high] = ACE_EDGES[equation];
  if (v < low) return "veryLow";
  if (v < lean) return "lean";
  if (v < high) return "typical";
  return "elevated";
}

export type BodyFatBand = { category: BodyFatCategory; label: string; from: number | null; to: number | null; range: string };

const LABEL: Record<BodyFatCategory, string> = {
  veryLow: "Very low",
  lean: "Lean",
  typical: "Typical",
  elevated: "Elevated",
};

const oneDecimal = (n: number) => n.toFixed(1);

/** The four bands for one sex, for a reference scale. Ranges are written on the one-decimal value. */
export function bodyFatBands(equation: NavyEquation): BodyFatBand[] {
  const [low, lean, high] = ACE_EDGES[equation];
  const upTo = (n: number) => oneDecimal(n - 0.1);
  return [
    { category: "veryLow", label: LABEL.veryLow, from: null, to: low, range: `< ${oneDecimal(low)}` },
    { category: "lean", label: LABEL.lean, from: low, to: lean, range: `${oneDecimal(low)}–${upTo(lean)}` },
    { category: "typical", label: LABEL.typical, from: lean, to: high, range: `${oneDecimal(lean)}–${upTo(high)}` },
    { category: "elevated", label: LABEL.elevated, from: high, to: null, range: `≥ ${oneDecimal(high)}` },
  ];
}

/** Fat mass in kg: weight × %BF / 100. */
export const fatMass = (weightKg: number, bodyFatPct: number) => (weightKg * bodyFatPct) / 100;

/** Lean (fat-free) mass in kg: weight × (1 − %BF / 100). */
export const leanMass = (weightKg: number, bodyFatPct: number) => weightKg * (1 - bodyFatPct / 100);
