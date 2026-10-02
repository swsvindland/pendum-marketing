// Body mass index and the CDC adult screening categories, as Vector Body shows them.

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

/** Weights (kg) at which BMI is 18.5 and 24.9 for this height: the healthy-weight range. */
export function healthyWeightRange(heightCm: number): { min: number; max: number } {
  const m = heightCm / 100;
  return { min: 18.5 * m * m, max: 24.9 * m * m };
}

/** kg to gain (positive) or lose (negative) to reach the healthy range; 0 when already in it. */
export function changeToHealthy(weightKg: number, heightCm: number): number {
  const { min, max } = healthyWeightRange(heightCm);
  if (weightKg < min) return min - weightKg;
  if (weightKg > max) return max - weightKg;
  return 0;
}
