// Resting energy (Mifflin-St Jeor) and total daily energy expenditure, as Vector Macros makes a program's
// starting estimate (macro-track src/lib/program.ts, initialExpenditure).

export type Sex = "female" | "male";
export type Activity = "low" | "light" | "moderate" | "high";

/**
 * Vector Macros' activity levels: its labels and multipliers. The descriptions are the conventional ones that go
 * with these factors (the app shows the labels only). "Lightly active" is the app's default.
 */
export const ACTIVITY_LEVELS: readonly { value: Activity; label: string; multiplier: number; description: string }[] = [
  { value: "low", label: "Mostly seated", multiplier: 1.2, description: "Desk work and little or no exercise." },
  { value: "light", label: "Lightly active", multiplier: 1.375, description: "Light exercise or sport 1–3 days a week." },
  { value: "moderate", label: "Active", multiplier: 1.55, description: "Moderate exercise or sport 3–5 days a week." },
  { value: "high", label: "Very active", multiplier: 1.725, description: "Hard exercise or sport 6–7 days a week." },
];

export const DEFAULT_ACTIVITY: Activity = "light";

/** The inputs Vector Macros accepts for the estimate: whole years 18–100, 120–230 cm, 35–350 kg. */
export const PROFILE_LIMITS = {
  age: { min: 18, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 35, max: 350 },
} as const;

export type Profile = { age: number; heightCm: number; weightKg: number; sex: Sex };

/** The level's entry; throws on an unknown level, so a typo never falls back to a multiplier silently. */
export function activityLevel(activity: Activity) {
  const level = ACTIVITY_LEVELS.find((l) => l.value === activity);
  if (!level) throw new RangeError(`Unknown activity level: ${activity}`);
  return level;
}

/**
 * Resting energy in kcal/day, unrounded: the simplified Mifflin-St Jeor equation the app uses,
 * 10 × kg + 6.25 × cm − 5 × years, plus 5 for the male equation or minus 161 for the female one.
 */
export function restingEnergy(p: Profile): number {
  return 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);
}

/** Total daily energy expenditure in kcal/day: resting energy × the activity multiplier, rounded to a whole kcal. */
export function tdee(p: Profile & { activity: Activity }): number {
  return Math.round(restingEnergy(p) * activityLevel(p.activity).multiplier);
}

/** TDEE at every activity level, in the app's order (least to most active). */
export function tdeeByActivity(p: Profile): { activity: Activity; label: string; multiplier: number; kcal: number }[] {
  return ACTIVITY_LEVELS.map((l) => ({
    activity: l.value,
    label: l.label,
    multiplier: l.multiplier,
    kcal: tdee({ ...p, activity: l.value }),
  }));
}

/** True when the profile is one Vector Macros accepts (its validateProgram rules for these fields). */
export function isValidProfile(p: Profile): boolean {
  const { age, heightCm, weightKg } = PROFILE_LIMITS;
  return (
    Number.isInteger(p.age) &&
    p.age >= age.min &&
    p.age <= age.max &&
    Number.isFinite(p.heightCm) &&
    p.heightCm >= heightCm.min &&
    p.heightCm <= heightCm.max &&
    Number.isFinite(p.weightKg) &&
    p.weightKg >= weightKg.min &&
    p.weightKg <= weightKg.max &&
    (p.sex === "female" || p.sex === "male")
  );
}
