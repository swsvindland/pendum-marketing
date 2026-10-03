// Body mass index and the CDC adult screening categories. The category is chosen from the BMI rounded to one
// decimal, as CDC reports BMI and as its adult table places weights (at 5 ft 9 in: 125 lb healthy weight, 169 lb
// overweight, 203 lb obesity). Vector Body uses the same cutoffs on the unrounded value (body-track
// src/lib/metric-context.ts), so a BMI less than 0.05 below 18.5, 25 or 30 is in the band below there.

export type BmiCategory = "underweight" | "healthy" | "overweight" | "obesity";

/** CDC adult bands: under 18.5, 18.5 to under 25, 25 to under 30, 30 and over. Edges belong to the upper band. */
export const BMI_BANDS: { category: BmiCategory; label: string; from: number | null; to: number | null; range: string }[] = [
  { category: "underweight", label: "Underweight", from: null, to: 18.5, range: "< 18.5" },
  { category: "healthy", label: "Healthy weight", from: 18.5, to: 25, range: "18.5–24.9" },
  { category: "overweight", label: "Overweight", from: 25, to: 30, range: "25.0–29.9" },
  { category: "obesity", label: "Obesity", from: 30, to: null, range: "≥ 30.0" },
];

/** kg / m². */
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** BMI rounded to one decimal, the precision the CDC reports and categorises. */
export const roundBmi = (value: number) => Math.round(value * 10) / 10;

/** Category of a BMI, judged on the one-decimal value so the shown number and its word always agree. */
export function bmiCategory(value: number): BmiCategory {
  const v = roundBmi(value);
  if (v < 18.5) return "underweight";
  if (v < 25) return "healthy";
  if (v < 30) return "overweight";
  return "obesity";
}

/** How a weight is shown: kg itself, or a conversion (kg and lb). Shown weights have one decimal. */
export type MassScale = { toDisplay: (kg: number) => number; fromDisplay: (shown: number) => number };
const KG: MassScale = { toDisplay: (n) => n, fromDisplay: (n) => n };

// A conversion can land a hair off a tenth (lb to kg and back); the allowance keeps an exact tenth exact.
const EPS = 1e-9;
const tenth = (n: number) => Math.round(n * 10) / 10;
const ceilTenth = (n: number) => Math.ceil(n * 10 - EPS) / 10;
const floorTenth = (n: number) => Math.floor(n * 10 + EPS) / 10;

/**
 * The healthy-weight range for a height, in the shown unit at one decimal: the lightest and heaviest weights whose
 * BMI shows as 18.5 to 24.9 (unrounded, 18.45 up to but not including 24.95). Both ends are checked with
 * `bmiCategory` itself, so every one-decimal weight in the range is healthy weight and none outside it is. At
 * 5 ft 9 in it is 125.0–168.9 lb; CDC's table gives 125 to 168 lb in whole pounds.
 */
export function healthyWeightRange(heightCm: number, scale: MassScale = KG): { min: number; max: number } {
  const m2 = (heightCm / 100) ** 2;
  const healthy = (shown: number) => bmiCategory(bmi(scale.fromDisplay(shown), heightCm)) === "healthy";
  // The one-decimal BMI turns over half a display step below each edge.
  let min = ceilTenth(scale.toDisplay((18.5 - 0.05) * m2));
  if (!healthy(min)) min = tenth(min + 0.1);
  let max = floorTenth(scale.toDisplay((25 - 0.05) * m2));
  if (!healthy(max)) max = tenth(max - 0.1);
  return { min, max };
}

/**
 * The weight to gain (positive) or lose (negative) to reach the healthy range, in the shown unit at one decimal:
 * from the weight to the nearer end of `healthyWeightRange`, rounded up to the next tenth so that it is enough.
 * 0 whenever the BMI is already healthy weight, so the change never contradicts the category.
 */
export function changeToHealthy(weightKg: number, heightCm: number, scale: MassScale = KG): number {
  const category = bmiCategory(bmi(weightKg, heightCm));
  if (category === "healthy") return 0;
  const { min, max } = healthyWeightRange(heightCm, scale);
  const shown = scale.toDisplay(weightKg);
  // At least one step: a weight outside the category is never 0.0 away from it.
  return category === "underweight" ? Math.max(0.1, ceilTenth(min - shown)) : -Math.max(0.1, ceilTenth(shown - max));
}
