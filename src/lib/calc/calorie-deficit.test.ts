import { describe, expect, it } from "vitest";
import {
  APP_PACE_RANGE,
  DEFAULT_PACE,
  MAX_WEEKS,
  PACES,
  checkpoints,
  dailyCalorieChange,
  daysToGoal,
  direction,
  goalDate,
  maintenanceFloor,
  projectGoal,
  weeklyRate,
} from "./calorie-deficit";

/**
 * An independent reference for the app's loop: after n whole weeks the weight is c × (1 ± p)^n, and the final
 * week is the distance left over that week's step.
 */
function closedForm(current: number, goal: number, pct: number) {
  const p = pct / 100;
  const f = goal < current ? 1 - p : 1 + p;
  let n = Math.floor(Math.log(goal / current) / Math.log(f));
  let kg = current * f ** n;
  if (Math.abs(goal - kg) > kg * p) {
    n++;
    kg = current * f ** n;
  }
  return n + Math.abs(goal - kg) / (kg * p);
}

describe("goal date", () => {
  it("offers paces on Pendum Macros' slider, with its defaults", () => {
    expect(PACES.lose).toEqual([0.25, 0.5, 0.75, 1]);
    expect(PACES.gain).toEqual([0.1, 0.25, 0.5]);
    expect(PACES.lose).toContain(DEFAULT_PACE.lose);
    expect(PACES.gain).toContain(DEFAULT_PACE.gain);
    // The slider runs cut 0.1–1.5% and bulk 0.05–0.5% in 0.05 steps; every pace offered is a stop on it.
    for (const dir of ["lose", "gain"] as const) {
      const [min, max] = APP_PACE_RANGE[dir];
      for (const p of PACES[dir]) {
        expect(p).toBeGreaterThanOrEqual(min);
        expect(p).toBeLessThanOrEqual(max);
        expect(Math.abs(p / 0.05 - Math.round(p / 0.05))).toBeLessThan(1e-9);
      }
    }
  });

  it("finds the direction", () => {
    expect(direction(80, 75)).toBe("lose");
    expect(direction(80, 85)).toBe("gain");
    expect(direction(80, 80)).toBeNull();
    expect(direction(0, 75)).toBeNull();
  });

  it("projects a cut with a fractional final week", () => {
    // 80 → 75 kg at 0.5% a week. By hand: 80 × 0.995^12 = 75.3298 kg after 12 weeks; week 13's step is
    // 75.3298 × 0.005 = 0.37665 kg and 0.32982 kg is left, so 12 + 0.32982 / 0.37665 = 12.8757 weeks.
    const { weeks, path } = projectGoal(80, 75, 0.5);
    expect(weeks).toBeCloseTo(12.875681, 6);
    expect(weeks).toBeCloseTo(closedForm(80, 75, 0.5), 9);
    // The continuous log formula ln(75/80) / ln(0.995) = 12.8754 agrees to within a hundredth.
    expect(Math.abs(weeks! - Math.log(75 / 80) / Math.log(0.995))).toBeLessThan(0.01);
    expect(path).toHaveLength(13);
    expect(path[0]).toEqual({ week: 1, kg: 79.6 });
    expect(path[11].kg).toBeCloseTo(75.329825, 6);
    expect(path[12]).toEqual({ week: weeks, kg: 75 });
    // ceil(12.8757 × 7) = ceil(90.13) = 91 days.
    expect(daysToGoal(weeks!)).toBe(91);
  });

  it("projects a bulk, whose steps grow", () => {
    // 80 → 85 kg at 0.25%: 80 × 1.0025^24 = 84.9406 kg; step 0.21235, left 0.05944 → 24.2799 weeks.
    // ln(85/80) / ln(1.0025) = 24.2801.
    const { weeks } = projectGoal(80, 85, 0.25);
    expect(weeks).toBeCloseTo(24.279897, 6);
    expect(weeks).toBeCloseTo(closedForm(80, 85, 0.25), 9);
    expect(daysToGoal(weeks!)).toBe(170);
    expect(projectGoal(60, 70, 0.1).weeks).toBeCloseTo(closedForm(60, 70, 0.1), 9);
    expect(projectGoal(100, 90, 1).weeks).toBeCloseTo(closedForm(100, 90, 1), 9);
  });

  it("finishes inside the first week when the goal is closer than one step", () => {
    // 80 → 79.8 at 0.5%: the step is 0.4 kg, 0.2 kg is left: half a week, 4 days.
    const { weeks, path } = projectGoal(80, 79.8, 0.5);
    expect(weeks).toBeCloseTo(0.5, 10);
    expect(path).toEqual([{ week: weeks, kg: 79.8 }]);
    expect(daysToGoal(weeks!)).toBe(4);
  });

  it("shows nothing at 520 weeks or more", () => {
    // 350 → 35 kg at 0.25%: ln(0.1) / ln(0.9975) = 920 weeks.
    expect(projectGoal(350, 35, 0.25)).toEqual({ weeks: null, path: [] });
    // 200 → 60 kg at 0.25% is 480.99 weeks, under the cap.
    expect(projectGoal(200, 60, 0.25).weeks).toBeCloseTo(closedForm(200, 60, 0.25), 9);
    expect(projectGoal(200, 60, 0.25).weeks!).toBeLessThan(MAX_WEEKS);
  });

  it("has nothing to project for the same weight or unusable input", () => {
    expect(projectGoal(80, 80, 0.5)).toEqual({ weeks: 0, path: [] });
    expect(projectGoal(80, 75, 0)).toEqual({ weeks: null, path: [] });
    expect(projectGoal(80, 75, Number.NaN)).toEqual({ weeks: null, path: [] });
    expect(projectGoal(-80, 75, 0.5)).toEqual({ weeks: null, path: [] });
  });

  it("matches Pendum Macros' weekly rate and calories", () => {
    // goalRate: min(distance, weight × pace / 100), signed.
    expect(weeklyRate(80, 75, 0.5)).toBeCloseTo(-0.4, 12);
    expect(weeklyRate(80, 85, 0.25)).toBeCloseTo(0.2, 12);
    expect(weeklyRate(80, 79.8, 0.5)).toBeCloseTo(-0.2, 12); // capped at the distance left
    expect(weeklyRate(75, 75, 0.5)).toBe(0);
    expect(weeklyRate(85, 85, 0.25)).toBe(0);
    // Pendum Macros test vectors with a starting expenditure of 2,600 kcal: lose 0.5% to 75 kg → 2,160 kcal;
    // gain 0.25% to 85 kg → 2,820 kcal. So the changes are −440 and +220 kcal a day (0.4 × 7700 / 7 = 440).
    expect(2600 + dailyCalorieChange(weeklyRate(80, 75, 0.5))).toBe(2160);
    expect(2600 + dailyCalorieChange(weeklyRate(80, 85, 0.25))).toBe(2820);
    expect(dailyCalorieChange(0)).toBe(0);
  });

  it("states the maintenance a deficit needs above Pendum Macros' 1,500 kcal floor", () => {
    // −440 kcal a day needs a maintenance of 1,940 kcal for intake to stay at 1,500.
    expect(maintenanceFloor(dailyCalorieChange(weeklyRate(80, 75, 0.5)))).toBe(1940);
    // 350 kg at 1%: 3.5 kg a week is −3,850 kcal a day, so 5,350 kcal.
    expect(dailyCalorieChange(weeklyRate(350, 300, 1))).toBe(-3850);
    expect(maintenanceFloor(-3850)).toBe(5350);
    // A surplus or no change has no floor to state.
    expect(maintenanceFloor(220)).toBeNull();
    expect(maintenanceFloor(0)).toBeNull();
    expect(maintenanceFloor(Number.NaN)).toBeNull();
  });

  it("dates the goal in local calendar days", () => {
    // 2 Oct 2026 + 91 days = 1 Jan 2027.
    const d = goalDate(new Date(2026, 9, 2, 18, 30), 12.875681);
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2027, 0, 1]);
    expect(d.getHours()).toBe(0);
    // Whole weeks land on the same weekday: 2 weeks is 14 days.
    const two = goalDate(new Date(2026, 1, 20), 2);
    expect([two.getMonth(), two.getDate()]).toEqual([2, 6]);
  });

  it("lists every fourth week, then the goal", () => {
    const rows = checkpoints(projectGoal(80, 75, 0.5));
    expect(rows.map((r) => r.week)).toEqual([4, 8, 12, projectGoal(80, 75, 0.5).weeks]);
    // Week 4 by hand: 0.995^4 = 0.9801495, × 80 = 78.4120 kg.
    expect(rows[0].kg).toBeCloseTo(78.412, 3);
    expect(rows.at(-1)).toMatchObject({ kg: 75, goal: true });
    // A goal under four weeks away has only the goal row.
    expect(checkpoints(projectGoal(80, 79, 0.5)).map((r) => r.goal)).toEqual([true]);
    expect(checkpoints({ weeks: null, path: [] })).toEqual([]);
  });

  it("caps the table at 26 rows and keeps the goal", () => {
    // 200 → 60 kg at 0.25% is 481 weeks: 25 rows to week 100, then the goal.
    const rows = checkpoints(projectGoal(200, 60, 0.25));
    expect(rows).toHaveLength(26);
    expect(rows[24].week).toBe(100);
    expect(rows[25]).toMatchObject({ kg: 60, goal: true });
  });

  it("does not repeat a goal that lands on a whole week", () => {
    // 100 → 99 at 1%: the first step is exactly 1 kg, so the goal is week 1.
    const rows = checkpoints(projectGoal(100, 99, 1), 1);
    expect(rows).toEqual([{ week: 1, kg: 99, goal: true }]);
  });
});
