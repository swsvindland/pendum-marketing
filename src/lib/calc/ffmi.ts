// Fat-free mass index, as Vector Body computes it (body-track src/lib/metrics.ts composition), the height-
// normalized FFMI of Kouri et al. (1995), and Vector Body's simplified comparison bands
// (src/lib/metric-context.ts). The band is judged on the one-decimal value shown, where the app judges the
// unrounded value, so the two differ for an FFMI from 16.95 to under 17 and from over 20 to under 20.05 for men
// (13.95 to under 14 and over 17 to under 17.05 for women).

export type Sex = "male" | "female";

/**
 * FFMI in kg/m²: lean mass / height², with lean mass = weight × (1 − body fat / 100). Computed as Vector Body does,
 * BMI × (1 − body fat / 100), which is the same quantity. Null when weight or height is not positive or body fat
 * is outside 0 to under 100 %.
 */
export function ffmi(weightKg: number, heightCm: number, bodyFatPct: number): number | null {
  if (!(weightKg > 0) || !(heightCm > 0) || !(bodyFatPct >= 0 && bodyFatPct < 100)) return null;
  const bmi = weightKg / (heightCm / 100) ** 2;
  return bmi * (1 - bodyFatPct / 100);
}

/** The reference height of the normalization, m. */
export const NORMAL_HEIGHT_M = 1.8;
/** kg/m² added per metre below the reference height (subtracted above it). */
export const NORMAL_SLOPE = 6.1;

/**
 * FFMI adjusted to a height of 1.8 m (Kouri et al. 1995): FFMI + 6.1 × (1.8 − height in m). FFMI rises slightly
 * with height, so this puts short and tall people on one scale. Vector Body does not show it.
 */
export function normalizedFfmi(ffmiValue: number, heightCm: number): number {
  return ffmiValue + NORMAL_SLOPE * (NORMAL_HEIGHT_M - heightCm / 100);
}

/** FFMI rounded to one decimal, the precision shown and categorised. */
export const roundFfmi = (value: number) => Math.round(value * 10) / 10;

export type FfmiCategory = "lower" | "typical" | "higher";

/** Vector Body's typical range [from, to] by sex, unadjusted FFMI. Both edges are typical. Not clinical cutoffs. */
export const FFMI_TYPICAL: Record<Sex, readonly [number, number]> = {
  male: [17, 20],
  female: [14, 17],
};

/**
 * Category of an FFMI, judged on the one-decimal value so the shown number and its word always agree. Vector Body
 * judges the unrounded value: 20.04 is typical here (shown 20.0) and higher there.
 */
export function ffmiCategory(value: number, sex: Sex): FfmiCategory {
  const v = roundFfmi(value);
  const [from, to] = FFMI_TYPICAL[sex];
  if (v < from) return "lower";
  if (v <= to) return "typical";
  return "higher";
}

/** The category in words, as Vector Body names it. */
export const FFMI_LABEL: Record<FfmiCategory, string> = {
  lower: "Lower lean mass",
  typical: "Typical lean mass",
  higher: "Higher lean mass",
};

export type FfmiBand = { category: FfmiCategory; label: string; from: number | null; to: number | null; range: string };

/**
 * The three bands for one sex, for a reference scale, named in one word each (the caption above the scale gives
 * the full name). A scale band includes its lower edge only, so the typical band ends half a display step (0.05)
 * above its upper edge: on one-decimal values, 20.0 stays typical and 20.1 is higher, as `ffmiCategory` says.
 */
export function ffmiBands(sex: Sex): FfmiBand[] {
  const [from, to] = FFMI_TYPICAL[sex];
  const edge = to + 0.05;
  return [
    { category: "lower", label: "Lower", from: null, to: from, range: `< ${from.toFixed(1)}` },
    { category: "typical", label: "Typical", from, to: edge, range: `${from.toFixed(1)}–${to.toFixed(1)}` },
    { category: "higher", label: "Higher", from: edge, to: null, range: `> ${to.toFixed(1)}` },
  ];
}
