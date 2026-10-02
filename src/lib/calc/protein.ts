// Daily protein for adults who train: a range per kilogram of body weight for each goal, a target inside it, and
// the same numbers per meal and against the RDA. Grams round to whole numbers, as Vector Macros rounds protein
// (round(weight × g/kg)), and every per-kg value below is one of its protein settings (1.4 / 1.6 / 2.0 / 2.2) or a
// published bound.

export type ProteinGoal = "maintain" | "build" | "lose";

export type ProteinGoalSpec = {
  label: string;
  /** Range, g per kg of body weight per day. */
  min: number;
  max: number;
  /** The one daily number inside the range, g/kg. */
  target: number;
};

/**
 * Per goal, g per kg of body weight per day:
 * - maintain 1.4–2.0 (ISSN 2017, enough for most exercising people), target 1.6 (Morton et al. 2018: past about
 *   1.6 g/kg, added protein gave no further average gain in lean mass; Vector Macros' default);
 * - build 1.6–2.2 (Morton et al. 2018: breakpoint 1.62, upper 95% CI 2.20), target 2.0 (the Vector Macros setting
 *   nearest the middle of that range);
 * - lose 1.6–2.4 (Hector and Phillips 2018, energy restriction with training), target 2.2 (the upper part, since
 *   needs rise with a bigger deficit and with leanness; Helms et al. 2014).
 */
export const PROTEIN_GOALS: Record<ProteinGoal, ProteinGoalSpec> = {
  maintain: { label: "Maintain", min: 1.4, max: 2.0, target: 1.6 },
  build: { label: "Build muscle", min: 1.6, max: 2.2, target: 2.0 },
  lose: { label: "Lose fat", min: 1.6, max: 2.4, target: 2.2 },
};

/** Lean, resistance-trained people in a deficit: 2.3–3.1 g per kg of fat-free mass (Helms et al. 2014). */
export const LEAN_MASS_DEFICIT = { min: 2.3, max: 3.1 } as const;

/** Recommended dietary allowance for adults, g/kg/day (IOM 2005). A floor against deficiency, not a training target. */
export const RDA_G_PER_KG = 0.8;

/** About 0.4 g/kg a meal over at least four meals reaches 1.6 g/kg a day (Schoenfeld and Aragon 2018). */
export const PER_MEAL_G_PER_KG = 0.4;

/** The meal counts the per-meal split is shown for. */
export const MEAL_COUNTS = [3, 4, 5] as const;

/** Whole grams for a body weight and a g/kg rate. */
export const grams = (weightKg: number, gPerKg: number) => Math.round(weightKg * gPerKg);

const valid = (n: number) => Number.isFinite(n) && n > 0;

export type ProteinResult = {
  /** Daily range, whole grams. */
  min: number;
  max: number;
  /** Daily target, whole grams. */
  target: number;
  /** RDA for this body weight, whole grams. */
  rda: number;
  /** The range as multiples of the RDA (unrounded). */
  rdaMultiple: { min: number; max: number };
};

/** The day's range, target and RDA for a body weight (kg) and goal. null for a weight that is not positive. */
export function proteinRange(weightKg: number, goal: ProteinGoal): ProteinResult | null {
  if (!valid(weightKg)) return null;
  const g = PROTEIN_GOALS[goal];
  return {
    min: grams(weightKg, g.min),
    max: grams(weightKg, g.max),
    target: grams(weightKg, g.target),
    rda: grams(weightKg, RDA_G_PER_KG),
    rdaMultiple: { min: g.min / RDA_G_PER_KG, max: g.max / RDA_G_PER_KG },
  };
}

/** Fat-free (lean) mass, kg: weight × (1 − body fat / 100). null outside 0 < body fat < 100. */
export function leanMass(weightKg: number, bodyFatPct: number): number | null {
  if (!valid(weightKg) || !Number.isFinite(bodyFatPct) || bodyFatPct <= 0 || bodyFatPct >= 100) return null;
  return weightKg * (1 - bodyFatPct / 100);
}

export type LeanMassResult = {
  leanKg: number;
  /** The body-weight range in grams, expressed per kg of lean mass (unrounded). */
  perLeanKg: { min: number; max: number };
  /** Helms et al. 2014 range for a deficit, whole grams. Only for the lose goal. */
  deficit: { min: number; max: number } | null;
};

/**
 * The lean-mass view of a result: lean mass, the gram range per kg of it, and for a fat-loss goal the
 * 2.3–3.1 g/kg lean-mass range in grams. null when the body fat is not usable.
 */
export function leanMassView(weightKg: number, bodyFatPct: number, goal: ProteinGoal): LeanMassResult | null {
  const lean = leanMass(weightKg, bodyFatPct);
  const range = proteinRange(weightKg, goal);
  if (lean === null || range === null) return null;
  return {
    leanKg: lean,
    perLeanKg: { min: range.min / lean, max: range.max / lean },
    deficit: goal === "lose" ? { min: grams(lean, LEAN_MASS_DEFICIT.min), max: grams(lean, LEAN_MASS_DEFICIT.max) } : null,
  };
}

/** The target split evenly over `meals`: whole grams a meal and g per kg of body weight a meal (unrounded). */
export function perMeal(targetG: number, weightKg: number, meals: number): { grams: number; perKg: number } | null {
  if (!valid(targetG) || !valid(weightKg) || !Number.isInteger(meals) || meals < 1) return null;
  return { grams: Math.round(targetG / meals), perKg: targetG / meals / weightKg };
}
