import { describe, expect, it } from "vitest";
import {
  ACTIVITY_LEVELS,
  PROFILE_LIMITS,
  activityLevel,
  isValidProfile,
  restingEnergy,
  tdee,
  tdeeByActivity,
  type Activity,
  type Profile,
} from "./tdee";

const man = { age: 30, heightCm: 180, weightKg: 80, sex: "male" as const };
const woman = { age: 30, heightCm: 165, weightKg: 60, sex: "female" as const };

describe("restingEnergy", () => {
  it("is the simplified Mifflin-St Jeor equation", () => {
    // 10 × 80 + 6.25 × 180 − 5 × 30 + 5 = 800 + 1125 − 150 + 5 = 1780.
    expect(restingEnergy(man)).toBe(1780);
    // 10 × 60 + 6.25 × 165 − 5 × 30 − 161 = 600 + 1031.25 − 150 − 161 = 1320.25.
    expect(restingEnergy(woman)).toBe(1320.25);
    // The male and female equations differ by 166 kcal at the same size and age.
    expect(restingEnergy(man) - restingEnergy({ ...man, sex: "female" })).toBe(166);
  });

  it("stays within 8 kcal of the full regression over the accepted inputs", () => {
    // Mifflin et al. 1990: 9.99 × kg + 6.25 × cm − 4.92 × years + 166 × (male) − 161.
    const published = (p: Profile) => 9.99 * p.weightKg + 6.25 * p.heightCm - 4.92 * p.age + (p.sex === "male" ? 166 : 0) - 161;
    expect(published(man)).toBeCloseTo(1781.6, 6);
    expect(Math.abs(restingEnergy(man) - published(man))).toBeLessThan(2);
    // The difference is −0.01 × kg + 0.08 × years (height and sex cancel), so it is largest at a corner of the range:
    // 35 kg at 100 years, −0.35 + 8 = 7.65 kcal.
    const { age, heightCm, weightKg } = PROFILE_LIMITS;
    const gaps: number[] = [];
    for (const a of [age.min, age.max])
      for (const h of [heightCm.min, heightCm.max])
        for (const w of [weightKg.min, weightKg.max])
          for (const sex of ["female", "male"] as const) {
            const p = { age: a, heightCm: h, weightKg: w, sex };
            gaps.push(published(p) - restingEnergy(p));
          }
    expect(Math.max(...gaps)).toBeCloseTo(7.65, 9);
    expect(Math.min(...gaps)).toBeCloseTo(-2.06, 9);
    expect(Math.max(...gaps.map(Math.abs))).toBeLessThan(8);
  });
});

describe("tdee", () => {
  it("matches the Vector Macros test vector", () => {
    // macro-track tests/nutrition.test.cjs: 30 y, 180 cm, 80 kg, male, Active → 2759 (1780 × 1.55 = 2759).
    expect(tdee({ ...man, activity: "moderate" })).toBe(2759);
  });

  it("multiplies resting energy and rounds half up to a whole kcal", () => {
    // 1780 × 1.375 = 2447.5 → 2448; 1780 × 1.725 = 3070.5 → 3071.
    expect(tdee({ ...man, activity: "light" })).toBe(2448);
    expect(tdee({ ...man, activity: "high" })).toBe(3071);
    expect(tdee({ ...man, activity: "low" })).toBe(2136);
    // 1320.25 × 1.2 = 1584.3; × 1.375 = 1815.34; × 1.55 = 2046.39; × 1.725 = 2277.43.
    expect(tdeeByActivity(woman).map((r) => r.kcal)).toEqual([1584, 1815, 2046, 2277]);
  });

  it("covers the input range edges", () => {
    // Smallest male profile: 350 + 750 − 90 + 5 = 1015; × 1.2 = 1218.
    expect(tdee({ age: 18, heightCm: 120, weightKg: 35, sex: "male", activity: "low" })).toBe(1218);
    // Oldest, smallest female profile: 350 + 750 − 500 − 161 = 439; × 1.2 = 526.8 → 527.
    expect(tdee({ age: 100, heightCm: 120, weightKg: 35, sex: "female", activity: "low" })).toBe(527);
    // Largest male profile: 3500 + 1437.5 − 90 + 5 = 4852.5; × 1.725 = 8370.56 → 8371.
    expect(tdee({ age: 18, heightCm: 230, weightKg: 350, sex: "male", activity: "high" })).toBe(8371);
  });

  it("lists every level in the app's order with its label and multiplier", () => {
    expect(ACTIVITY_LEVELS.map((l) => [l.label, l.multiplier])).toEqual([
      ["Mostly seated", 1.2],
      ["Lightly active", 1.375],
      ["Active", 1.55],
      ["Very active", 1.725],
    ]);
    expect(tdeeByActivity(man).map((r) => r.activity)).toEqual(["low", "light", "moderate", "high"]);
  });

  it("rejects an unknown activity level", () => {
    expect(() => activityLevel("extreme" as Activity)).toThrow(RangeError);
    expect(() => tdee({ ...man, activity: "extreme" as Activity })).toThrow(RangeError);
  });
});

describe("isValidProfile", () => {
  it("accepts the app's ranges, edges included", () => {
    expect(isValidProfile(man)).toBe(true);
    expect(isValidProfile({ age: 18, heightCm: 120, weightKg: 35, sex: "female" })).toBe(true);
    expect(isValidProfile({ age: 100, heightCm: 230, weightKg: 350, sex: "male" })).toBe(true);
  });

  it("rejects ages, heights and weights outside them, and fractional ages", () => {
    expect(isValidProfile({ ...man, age: 17 })).toBe(false);
    expect(isValidProfile({ ...man, age: 101 })).toBe(false);
    expect(isValidProfile({ ...man, age: 30.5 })).toBe(false);
    expect(isValidProfile({ ...man, heightCm: 119.9 })).toBe(false);
    expect(isValidProfile({ ...man, heightCm: 230.1 })).toBe(false);
    expect(isValidProfile({ ...man, weightKg: 34.9 })).toBe(false);
    expect(isValidProfile({ ...man, weightKg: 350.1 })).toBe(false);
    expect(isValidProfile({ ...man, weightKg: Number.NaN })).toBe(false);
    expect(isValidProfile({ ...man, sex: "none" as "male" })).toBe(false);
  });
});
