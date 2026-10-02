// Daily calorie and macro targets for a cut, maintenance or a bulk, as Vector Macros generates a program's starting
// targets (macro-track src/lib/program.ts: goalRate, startingTargets, programMacros). The calculator has no goal
// weight, so the weekly rate is the pace alone and maintenance is a rate of 0.

export type Goal = "cut" | "maintain" | "bulk";
export type DietStyle = "balanced" | "more-carbs" | "more-fat";
export type Targets = { calories: number; protein: number; fat: number; carbs: number };

/** kcal per kg of body-weight change: the app's short-term approximation (3,500 kcal per lb). */
export const KCAL_PER_KG = 7700;
/** Fat never goes below 0.6 g per kg of body weight. */
export const FAT_FLOOR_G_PER_KG = 0.6;
/** Atwater factors, kcal per gram. */
export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

/** The protein levels the app offers, g per kg of body weight. 1.6 is its default. */
export const PROTEIN_LEVELS = [1.4, 1.6, 2, 2.2] as const;
export const DEFAULT_PROTEIN = 1.6;

/** Macro preference: the share of the calories left after protein that goes to fat. Balanced is the default. */
export const DIET_STYLES: readonly { value: DietStyle; label: string; fatShare: number }[] = [
  { value: "balanced", label: "Balanced", fatShare: 0.4 },
  { value: "more-carbs", label: "More carbs", fatShare: 0.25 },
  { value: "more-fat", label: "More fat", fatShare: 0.6 },
];

/**
 * Weekly paces offered here, % of body weight a week, with the default and the band the app recommends. The app's
 * slider reaches 1.5% for a cut; above 1% suits only a mini-cut of 2–4 weeks, so this list stops at 1%. Above 0.25%,
 * a bulk adds more fat alongside the muscle.
 */
export const PACES = {
  cut: { options: [0.25, 0.5, 0.75, 1], default: 0.5, recommended: [0.5, 1] },
  bulk: { options: [0.1, 0.25, 0.5], default: 0.25, recommended: [0.1, 0.25] },
} as const;

/** Targets the app will coach, kcal/day. */
export const CALORIE_LIMITS = { min: 1500, max: 5000 } as const;
/** Maintenance (expenditure) the app accepts, kcal/day. */
export const EXPENDITURE_LIMITS = { min: 1200, max: 5000 } as const;
/** No cut is generated below this BMI. */
export const MIN_CUT_BMI = 18.5;

/** Weekly weight change in kg: weight × pace / 100, negative for a cut, 0 for maintenance. */
export function weeklyRate(goal: Goal, weightKg: number, pacePercent: number): number {
  if (goal === "maintain") return 0;
  return ((weightKg * pacePercent) / 100) * (goal === "cut" ? -1 : 1);
}

/** Daily calories for a weekly rate: maintenance + rate × 7,700 / 7, rounded to a whole kcal. */
export function targetCalories(expenditure: number, rateKgPerWeek: number): number {
  return Math.round(expenditure + (rateKgPerWeek * KCAL_PER_KG) / 7);
}

const fatShare = (diet: DietStyle) => {
  const style = DIET_STYLES.find((d) => d.value === diet);
  if (!style) throw new RangeError(`Unknown diet style: ${diet}`);
  return style.fatShare;
};

/**
 * Splits calories into grams, as the app's programMacros does (without its range check, which `macroPlan` applies):
 * protein = round(kg × g/kg); fat = round(max(0.6 × kg, (calories − 4 × protein) × fat share / 9));
 * carbs = round((calories − 4 × protein − 9 × fat) / 4). Carbs can come out negative; `macroPlan` rejects that.
 */
export function splitMacros(calories: number, weightKg: number, proteinPerKg: number, diet: DietStyle): Targets {
  const protein = Math.round(weightKg * proteinPerKg);
  const remaining = calories - protein * 4;
  const fat = Math.round(Math.max(weightKg * FAT_FLOOR_G_PER_KG, (remaining * fatShare(diet)) / 9));
  // + 0 turns a rounded −0 into 0, so it never prints as "−0".
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4) + 0;
  return { calories: Math.round(calories), protein, fat, carbs };
}

export type MacroInput = {
  goal: Goal;
  /** % of body weight a week; ignored for maintenance. */
  pace: number;
  weightKg: number;
  heightCm: number;
  proteinPerKg: number;
  diet: DietStyle;
  /** Maintenance calories, kcal/day: the Mifflin-St Jeor estimate or the visitor's own figure. */
  expenditure: number;
};

/**
 * Why no targets are generated, in the order the app checks: maintenance outside 1,200–5,000 kcal; a cut at a BMI
 * under 18.5; calories outside 1,500–5,000 kcal; carbs below zero.
 */
export type MacroBlock = "expenditure-low" | "expenditure-high" | "underweight" | "calories-low" | "calories-high" | "carbs";

export type MacroPlan = {
  expenditure: number;
  /** kg a week, signed. */
  rateKgPerWeek: number;
  /** Rounded daily calories, also when blocked (so the message can state them). */
  calories: number;
  bmi: number;
  targets: Targets | null;
  blocked: MacroBlock | null;
};

/** Starting targets as the app generates them, or the reason it would not. */
export function macroPlan(input: MacroInput): MacroPlan {
  const { goal, pace, weightKg, heightCm, proteinPerKg, diet, expenditure } = input;
  const rateKgPerWeek = weeklyRate(goal, weightKg, pace);
  const bmi = weightKg / (heightCm / 100) ** 2;
  const calories = targetCalories(expenditure, rateKgPerWeek);
  const plan = { expenditure, rateKgPerWeek, calories, bmi };
  const blocked = (reason: MacroBlock): MacroPlan => ({ ...plan, targets: null, blocked: reason });

  if (expenditure < EXPENDITURE_LIMITS.min) return blocked("expenditure-low");
  if (expenditure > EXPENDITURE_LIMITS.max) return blocked("expenditure-high");
  // The app checks the unrounded BMI, and only when the rate is a loss.
  if (rateKgPerWeek < 0 && bmi < MIN_CUT_BMI) return blocked("underweight");
  if (calories < CALORIE_LIMITS.min) return blocked("calories-low");
  if (calories > CALORIE_LIMITS.max) return blocked("calories-high");
  const targets = splitMacros(calories, weightKg, proteinPerKg, diet);
  if (targets.carbs < 0) return blocked("carbs");
  return { ...plan, targets, blocked: null };
}

/** kcal from each macro (4, 4 and 9 kcal per gram). */
export function macroEnergy(t: Targets): { protein: number; carbs: number; fat: number } {
  return { protein: t.protein * KCAL_PER_G.protein, carbs: t.carbs * KCAL_PER_G.carbs, fat: t.fat * KCAL_PER_G.fat };
}

/**
 * Each macro's share of the energy the three provide, in whole percent that add up to 100 (largest remainder), so
 * the shown split never reads 99% or 101%.
 */
export function macroShares(t: Targets): { protein: number; carbs: number; fat: number } {
  const energy = macroEnergy(t);
  const keys = ["protein", "carbs", "fat"] as const;
  const total = energy.protein + energy.carbs + energy.fat;
  if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
  const exact = keys.map((k) => (energy[k] / total) * 100);
  const floors = exact.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  // Hand the remaining points to the largest remainders; ties go to the earlier macro (P · C · F order).
  const order = keys.map((_, i) => i).sort((a, b) => exact[b] - floors[b] - (exact[a] - floors[a]) || a - b);
  for (const i of order) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return { protein: floors[0], carbs: floors[1], fat: floors[2] };
}
