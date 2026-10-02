// A daily fluid estimate from drinks: a body-weight baseline kept within the published reference intakes, plus
// exercise and heat. No app implements this: Vector Hydration's goal is a fixed 2,500 mL default the user edits
// (water-track src/db/schema.ts, goalMl), and the app says it is not a personal recommendation.

import { mlToFlOz } from "@/lib/units";

export type Sex = "female" | "male";
export type ReferenceBody = "nasem" | "efsa";

/**
 * Adequate intakes for adults, mL/day. `total` is all water, food included; `drinks` is the part from drinking
 * water and beverages.
 * - NASEM (IOM 2005): 3.7 L men, 2.7 L women total; drinks gave 3.0 L and 2.2 L, about 81 % (the report's figures).
 * - EFSA (2010): 2.5 L men, 2.0 L women total, for moderate temperatures and activity (PAL 1.6). EFSA assumes food
 *   gives 20–30 %, and sets no drinks figure; the one here is 80 % of the total.
 */
export const WATER_REFERENCES: Record<ReferenceBody, { label: string; year: number } & Record<Sex, { total: number; drinks: number }>> = {
  nasem: { label: "NASEM", year: 2005, male: { total: 3700, drinks: 3000 }, female: { total: 2700, drinks: 2200 } },
  efsa: { label: "EFSA", year: 2010, male: { total: 2500, drinks: 2000 }, female: { total: 2000, drinks: 1600 } },
};

/** D-A-CH guide value for total water, adults 19 to 50 (30 mL/kg from 51). */
export const TOTAL_ML_PER_KG = 35;
/** The share of total water that comes from drinks: about 80 % (NASEM; EFSA 70–80 %). */
export const DRINK_SHARE = 0.8;
/** 35 mL/kg × 80 %: the drinks baseline per kg of body weight. */
export const DRINKS_ML_PER_KG = 28;
/** ACSM's 0.4–0.8 L an hour starting point, at its middle: 0.6 L an hour, 10 mL a minute. */
export const EXERCISE_ML_PER_MIN = 10;
/** Sedentary needs rise from about 3 L a day in temperate climates to about 4 L in hot ones (IOM 2005). */
export const HOT_CLIMATE_ML = 1000;
/** Vector Hydration's default serving. */
export const GLASS_ML = 250;
/** A US cup. */
export const CUP_FL_OZ = 8;

/** Accepted inputs: adult body weights and up to five hours of exercise a day. */
export const WATER_LIMITS = {
  weightKg: { min: 35, max: 350 },
  exerciseMin: { min: 0, max: 300 },
} as const;

export type Baseline = {
  /** The drinks baseline before it is kept within the references: 28 mL × kg. */
  perKg: number;
  /** mL/day from drinks, between the EFSA and NASEM drinks figures for this sex. */
  ml: number;
  /** Which reference bounds the baseline, when the per-kg figure falls outside the two; null when it does not. */
  bound: ReferenceBody | null;
};

/**
 * The drinks baseline for a sedentary day in a temperate climate: 28 mL per kg (35 mL/kg of total water, 80 % from
 * drinks), kept between EFSA's figure (the lower) and NASEM's (the higher) for this sex. The per-kg rule is not built
 * for very small or very large bodies, so the references bound it.
 */
export function baselineDrinks(sex: Sex, weightKg: number): Baseline {
  const perKg = DRINKS_ML_PER_KG * weightKg;
  const lo = WATER_REFERENCES.efsa[sex].drinks;
  const hi = WATER_REFERENCES.nasem[sex].drinks;
  if (perKg < lo) return { perKg, ml: lo, bound: "efsa" };
  if (perKg > hi) return { perKg, ml: hi, bound: "nasem" };
  return { perKg, ml: perKg, bound: null };
}

/** mL to drink for this many minutes of exercise a day, at 0.6 L an hour. */
export const exerciseDrinks = (minutes: number) => minutes * EXERCISE_ML_PER_MIN;

export type WaterEstimate = Baseline & {
  /** mL/day added for exercise. */
  exercise: number;
  /** mL/day added for a hot climate (0 or 1,000). */
  heat: number;
  /** mL/day from drinks: baseline + exercise + heat. */
  total: number;
};

/**
 * The daily estimate from drinks, in mL. Null when an input is outside WATER_LIMITS or not a number, so a typo never
 * turns into a result.
 */
export function waterEstimate({
  sex,
  weightKg,
  exerciseMin = 0,
  hot = false,
}: {
  sex: Sex;
  weightKg: number;
  exerciseMin?: number;
  hot?: boolean;
}): WaterEstimate | null {
  const { weightKg: w, exerciseMin: e } = WATER_LIMITS;
  if (sex !== "female" && sex !== "male") return null;
  if (!Number.isFinite(weightKg) || weightKg < w.min || weightKg > w.max) return null;
  if (!Number.isFinite(exerciseMin) || exerciseMin < e.min || exerciseMin > e.max) return null;
  const baseline = baselineDrinks(sex, weightKg);
  const exercise = exerciseDrinks(exerciseMin);
  const heat = hot ? HOT_CLIMATE_ML : 0;
  return { ...baseline, exercise, heat, total: baseline.ml + exercise + heat };
}

/** 250 mL glasses in this many mL. */
export const glasses = (ml: number) => ml / GLASS_ML;

/** 8 fl oz cups in this many mL (US fluid ounces). */
export const cups = (ml: number) => mlToFlOz(ml) / CUP_FL_OZ;
