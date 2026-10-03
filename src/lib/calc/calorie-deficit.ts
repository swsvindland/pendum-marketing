// Goal date: how long a weight change takes at a weekly pace set as a share of body weight, and the daily calorie
// change it needs. The projection is Vector Macros' goal date (macro-track src/lib/insights.ts goalProjection): it
// compounds week by week, adds a fractional final week, and shows nothing at 520 weeks or more. The weekly rate
// and calories are its goalRate and startingTargets (src/lib/program.ts): min(distance, weight × pace / 100), and
// rate × 7700 / 7 kcal a day.

export type Direction = "lose" | "gain";

/**
 * Weekly paces offered on the site, % of body weight a week. Vector Macros sets the pace on a slider (cut 0.1–1.5%,
 * bulk 0.05–0.5%, in 0.05 steps) with the same recommended bands; every pace here is a point on that slider.
 */
export const PACES: Record<Direction, readonly number[]> = {
  lose: [0.25, 0.5, 0.75, 1],
  gain: [0.1, 0.25, 0.5],
};

/** Vector Macros' starting pace: a cut at the low end of its recommended 0.5–1% band, a bulk at the top of 0.1–0.25%. */
export const DEFAULT_PACE: Record<Direction, number> = { lose: 0.5, gain: 0.25 };

/** The band Vector Macros marks as recommended, % a week. */
export const RECOMMENDED_PACE: Record<Direction, readonly [number, number]> = { lose: [0.5, 1], gain: [0.1, 0.25] };

/** Vector Macros' slider range, % a week (macro-track src/lib/program.ts PACES). */
export const APP_PACE_RANGE: Record<Direction, readonly [number, number]> = { lose: [0.1, 1.5], gain: [0.05, 0.5] };

/** Energy in a kilogram of body-weight change, kcal (the 3,500 kcal/lb rule of thumb, 32.2 MJ/kg). */
export const KCAL_PER_KG = 7700;

/** At this many weeks or more, no goal date is shown. */
export const MAX_WEEKS = 520;

/** The lowest daily calorie target Vector Macros sets (its programMacros refuses less), kcal. */
export const MIN_INTAKE_KCAL = 1500;

const valid = (n: number) => Number.isFinite(n) && n > 0;

/** lose or gain to go from current to goal; null when they are the same or either weight is not positive. */
export function direction(currentKg: number, goalKg: number): Direction | null {
  if (!valid(currentKg) || !valid(goalKg) || currentKg === goalKg) return null;
  return goalKg < currentKg ? "lose" : "gain";
}

/**
 * The week's change in kg, negative when losing: weight × pace / 100, but never more than the distance left.
 * 0 when there is nothing to change or the input is not usable.
 */
export function weeklyRate(currentKg: number, goalKg: number, pacePct: number): number {
  const dir = direction(currentKg, goalKg);
  if (!dir || !valid(pacePct)) return 0;
  return Math.min(Math.abs(goalKg - currentKg), (currentKg * pacePct) / 100) * (dir === "lose" ? -1 : 1);
}

/** Daily calorie change for a weekly rate (kg/week), whole kcal: rate × 7700 / 7. Negative is a deficit. */
export function dailyCalorieChange(rateKgPerWeek: number): number {
  return Math.round((rateKgPerWeek * KCAL_PER_KG) / 7);
}

/**
 * The maintenance a deficit needs for intake to stay at MIN_INTAKE_KCAL or more: 1,500 − change. The site has no
 * expenditure, so it states this instead of applying Vector Macros' floor. null for a surplus or no change.
 */
export function maintenanceFloor(dailyChangeKcal: number): number | null {
  if (!Number.isFinite(dailyChangeKcal) || dailyChangeKcal >= 0) return null;
  return MIN_INTAKE_KCAL - dailyChangeKcal;
}

export type Projection = {
  /** Weeks to the goal, with a fractional final week; null at 520 or more. */
  weeks: number | null;
  /** Weight at the end of each whole week (1, 2, …), then the goal at `weeks`. Empty when weeks is null. */
  path: { week: number; kg: number }[];
};

/**
 * Steps a week at a time. Each week's step is the current weight × pace / 100, so a cut's steps shrink and a
 * bulk's grow. When the distance left is no more than one step, the final week counts as left / step.
 */
export function projectGoal(currentKg: number, goalKg: number, pacePct: number): Projection {
  const dir = direction(currentKg, goalKg);
  if (!valid(currentKg) || !valid(goalKg) || !valid(pacePct)) return { weeks: null, path: [] };
  if (!dir) return { weeks: 0, path: [] };
  let kg = currentKg;
  let weeks = 0;
  const path: { week: number; kg: number }[] = [];
  while (weeks < MAX_WEEKS) {
    const step = (kg * pacePct) / 100;
    const left = Math.abs(goalKg - kg);
    if (step > 0 && left <= step) {
      weeks += left / step;
      break;
    }
    weeks++;
    kg += dir === "lose" ? -step : step;
    path.push({ week: weeks, kg });
  }
  if (weeks >= MAX_WEEKS) return { weeks: null, path: [] };
  path.push({ week: weeks, kg: goalKg });
  return { weeks, path };
}

/** Days from today to the goal: ceil(weeks × 7). */
export const daysToGoal = (weeks: number) => Math.ceil(weeks * 7);

/** The local calendar date `ceil(weeks × 7)` days after `today` (time of day dropped). */
export function goalDate(today: Date, weeks: number): Date {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysToGoal(weeks));
}

/**
 * Rows for a projection table: the weight every `every` weeks, then the goal week. At most `max` rows; the goal
 * row is always last, so a long projection keeps its end and drops the middle weeks past the cap.
 */
export function checkpoints(projection: Projection, every = 4, max = 26): { week: number; kg: number; goal: boolean }[] {
  const { weeks, path } = projection;
  if (weeks === null || path.length === 0) return [];
  const steps = path
    .filter((p) => Number.isInteger(p.week) && p.week % every === 0 && p.week < weeks)
    .slice(0, max - 1)
    .map((p) => ({ ...p, goal: false }));
  const end = path[path.length - 1];
  return [...steps, { ...end, goal: true }];
}
