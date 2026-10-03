// A daily fluid estimate from drinks: a body-weight baseline kept within the published reference intakes, plus
// exercise and heat. No app implements this: Vector Hydration's goal is a fixed 2,500 mL default the user edits
// (water-track src/db/schema.ts, goalMl), and the app says it is not a personal recommendation.

import { ML_PER_FL_OZ, mlToFlOz } from "@/lib/units";

export type Sex = "female" | "male";
export type ReferenceBody = "nasem" | "efsa";

/**
 * Adequate intakes for adults, mL/day. `total` is all water, food included; `drinks` is the part from drinking
 * water and beverages.
 * - NASEM (IOM 2005): 3.7 L men, 2.7 L women total; drinks gave 3.0 L and 2.2 L, about 81 % (the report's figures).
 * - EFSA (2010): 2.5 L men, 2.0 L women total, for moderate temperatures and activity (PAL 1.6). EFSA assumes food
 *   gives 20–30 %, and sets no drinks figure; the one here is 80 % of the total (EFSA_DRINK_SHARE).
 */
export const WATER_REFERENCES: Record<ReferenceBody, { label: string; year: number } & Record<Sex, { total: number; drinks: number }>> = {
  nasem: { label: "NASEM", year: 2005, male: { total: 3700, drinks: 3000 }, female: { total: 2700, drinks: 2200 } },
  efsa: { label: "EFSA", year: 2010, male: { total: 2500, drinks: 2000 }, female: { total: 2000, drinks: 1600 } },
};

/**
 * D-A-CH (DGE, ÖGE, SGE) guide value for total water, adults 19 to under 51: 35 mL per kg of body weight a day. D-A-CH
 * counts oxidation water (made as the body burns food) in the total, which NASEM and EFSA do not. Its value from 51
 * is 30 mL/kg; the calculator asks no age and uses the 19–50 value for every adult.
 */
export const TOTAL_ML_PER_KG = 35;
/**
 * D-A-CH's own split of the total for adults 25 to under 51, mL/day: 1,410 from drinks, 860 from food and 330 of
 * oxidation water, 2,600 in all (54 % from drinks). Ages 19 to under 25: 1,470 of 2,700, also 54 %.
 */
export const DACH_ADULT = { drinks: 1410, food: 860, oxidation: 330, total: 2600 } as const;
/** 35 mL/kg × 1,410 / 2,600 = 18.98: D-A-CH's drinks per kg of body weight, to a whole mL. */
export const DRINKS_ML_PER_KG = 19;
/** EFSA sets total water only and assumes food gives 20–30 %; its drinks figure here is 80 % of the total. */
export const EFSA_DRINK_SHARE = 0.8;
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
  /** The drinks baseline before it is kept within the references: 19 mL × kg. */
  perKg: number;
  /** mL/day from drinks, between the EFSA and NASEM drinks figures for this sex. */
  ml: number;
  /** Which reference bounds the baseline, when the per-kg figure falls outside the two; null when it does not. */
  bound: ReferenceBody | null;
};

/**
 * The drinks baseline for a sedentary day in a temperate climate: 19 mL per kg (D-A-CH's 35 mL/kg of total water at
 * its own 54 % from drinks), kept between EFSA's figure (the lower) and NASEM's (the higher) for this sex. That is
 * EFSA's figure for men below 2,000 / 19 = 105.26 kg and women below 1,600 / 19 = 84.21 kg, and NASEM's for men above
 * 3,000 / 19 = 157.89 kg and women above 2,200 / 19 = 115.79 kg.
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

/** Metric shows mL and L; US shows US fluid ounces. */
export type WaterUnits = "metric" | "us";

/**
 * Display precision: the step in mL and the shown number for a count of steps. A part (baseline, exercise, heat) is
 * shown to 10 mL, or 0.1 fl oz. A daily amount (the estimate, a reference, a difference) is shown to ten parts: 0.1 L,
 * or a whole fl oz. The note under the parts gives the per-kg figure to 1 mL, or 0.1 fl oz.
 */
const SHOWN: Record<
  WaterUnits,
  { part: number; note: number; toPart: (n: number) => number; toDaily: (n: number) => number; toNote: (n: number) => number }
> = {
  metric: { part: 10, note: 1, toPart: (n) => n * 10, toDaily: (n) => n / 10, toNote: (n) => n },
  us: { part: ML_PER_FL_OZ / 10, note: ML_PER_FL_OZ / 10, toPart: (n) => n / 10, toDaily: (n) => n, toNote: (n) => n / 10 },
};

/** Whole steps of `step` mL in `ml`, halves up. */
const steps = (ml: number, step: number) => Math.round(ml / step);

export type WaterReadout = {
  /** mL (to 10) or fl oz (to 0.1). */
  baseline: number;
  exercise: number;
  heat: number;
  /** L (to 0.1) or fl oz (whole): the sum of the three parts as shown, rounded. */
  total: number;
  /** 250 mL glasses, or 8 fl oz cups, in the shown total. */
  servings: number;
  /** Each reference in L (to 0.1) or fl oz (whole), and the shown total minus the shown drinks figure. */
  references: Record<ReferenceBody, { total: number; drinks: number; difference: number }>;
  /**
   * The per-kg figure and the bound that replaced it, in mL (whole) or fl oz (to 0.1), when the bound changes what is
   * shown; null when the per-kg figure is the baseline, or rounds to the same number as the bound.
   */
  note: { perKg: number; bound: number } | null;
};

/**
 * The estimate as the tool shows it, worked from the shown values so the numbers on screen agree with one another:
 * each part rounded, the total rounded from the sum of the shown parts, glasses or cups counted from the shown total,
 * and each difference taken between the shown total and the shown reference. Steps stay whole numbers until the end,
 * so a sum that lands on a half rounds up and never drifts below it.
 */
export function waterReadout(estimate: WaterEstimate, sex: Sex, units: WaterUnits): WaterReadout {
  const shown = SHOWN[units];
  const daily = shown.part * 10;
  const parts = [estimate.ml, estimate.exercise, estimate.heat].map((ml) => steps(ml, shown.part));
  const total = Math.round((parts[0] + parts[1] + parts[2]) / 10);
  const reference = (body: ReferenceBody) => {
    const ref = WATER_REFERENCES[body][sex];
    const drinks = steps(ref.drinks, daily);
    return {
      total: shown.toDaily(steps(ref.total, daily)),
      drinks: shown.toDaily(drinks),
      difference: shown.toDaily(total - drinks),
    };
  };
  const perKg = steps(estimate.perKg, shown.note);
  const bound = steps(estimate.ml, shown.note);
  return {
    baseline: shown.toPart(parts[0]),
    exercise: shown.toPart(parts[1]),
    heat: shown.toPart(parts[2]),
    total: shown.toDaily(total),
    servings: units === "metric" ? glasses(total * daily) : total / CUP_FL_OZ,
    references: { nasem: reference("nasem"), efsa: reference("efsa") },
    note: estimate.bound && perKg !== bound ? { perKg: shown.toNote(perKg), bound: shown.toNote(bound) } : null,
  };
}
