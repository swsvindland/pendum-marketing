import { describe, expect, it } from "vitest";
import { macroEnergy, macroPlan, macroShares, splitMacros, targetCalories, weeklyRate, type DietStyle, type MacroInput } from "./macros";
import { tdee } from "./tdee";

/** The profile in Vector Macros' tests: 180 cm, 80 kg, 1.6 g/kg, balanced. */
const base: MacroInput = {
  goal: "maintain",
  pace: 0,
  weightKg: 80,
  heightCm: 180,
  proteinPerKg: 1.6,
  diet: "balanced",
  expenditure: 2600,
};

describe("weeklyRate", () => {
  it("is weight × pace / 100, negative for a cut and 0 for maintenance", () => {
    expect(weeklyRate("cut", 80, 0.5)).toBeCloseTo(-0.4, 12);
    expect(weeklyRate("bulk", 80, 0.25)).toBeCloseTo(0.2, 12);
    expect(weeklyRate("maintain", 80, 0.5)).toBe(0);
  });
});

describe("targetCalories", () => {
  it("adds rate × 7,700 / 7 to maintenance", () => {
    // −0.4 kg × 7700 / 7 = −440; 2600 − 440 = 2160.
    expect(targetCalories(2600, -0.4)).toBe(2160);
    // +0.2 kg × 7700 / 7 = +220.
    expect(targetCalories(2600, 0.2)).toBe(2820);
    // 1 lb a week (0.45359237 kg) is the familiar 500 kcal a day: 0.45359237 × 7700 / 7 = 498.95.
    expect(targetCalories(2500, -0.45359237)).toBe(2001);
  });
});

describe("splitMacros", () => {
  it("matches the Vector Macros test vectors", () => {
    // macro-track tests/coaching.test.cjs: programMacros(2400, 80, balanced, 1.6).
    // P = 80 × 1.6 = 128; F = max(48, (2400 − 512) × 0.40 / 9 = 83.9) → 84; C = (2400 − 512 − 756) / 4 = 283.
    expect(splitMacros(2400, 80, 1.6, "balanced")).toEqual({ calories: 2400, protein: 128, fat: 84, carbs: 283 });
    // programMacros(2000, 80, More carbs, 1.6): (2000 − 512) × 0.25 / 9 = 41.3 is under the floor 0.6 × 80 = 48.
    // C = (2000 − 512 − 432) / 4 = 264.
    expect(splitMacros(2000, 80, 1.6, "more-carbs")).toEqual({ calories: 2000, protein: 128, fat: 48, carbs: 264 });
  });

  it("gives fat its share of the calories after protein", () => {
    // More fat: (2400 − 512) × 0.60 / 9 = 125.9 → 126; C = (2400 − 512 − 1134) / 4 = 188.5 → 189 (half up).
    expect(splitMacros(2400, 80, 1.6, "more-fat")).toEqual({ calories: 2400, protein: 128, fat: 126, carbs: 189 });
    // 2.2 g/kg: P = 176; F = (2400 − 704) × 0.40 / 9 = 75.4 → 75; C = (2400 − 704 − 675) / 4 = 255.25 → 255.
    expect(splitMacros(2400, 80, 2.2, "balanced")).toEqual({ calories: 2400, protein: 176, fat: 75, carbs: 255 });
  });

  it("never returns −0 carbs", () => {
    // 106 kg at 2.2 g/kg: P = 233 (932 kcal), fat floor 63.6 → 64 (576 kcal); (1507 − 1508) / 4 = −0.25 → 0.
    expect(Object.is(splitMacros(1507, 106, 2.2, "more-fat").carbs, 0)).toBe(true);
  });

  it("rejects an unknown diet style", () => {
    expect(() => splitMacros(2400, 80, 1.6, "keto" as DietStyle)).toThrow(RangeError);
  });
});

describe("macroPlan", () => {
  it("matches Vector Macros' starting targets", () => {
    // startingTargets(lose 0.5%, 80 kg, expenditure 2600) → 2160 kcal, 128 g protein.
    const cut = macroPlan({ ...base, goal: "cut", pace: 0.5 });
    expect(cut.blocked).toBeNull();
    expect(cut.targets).toMatchObject({ calories: 2160, protein: 128 });
    // F = (2160 − 512) × 0.40 / 9 = 73.2 → 73; C = (2160 − 512 − 657) / 4 = 247.75 → 248.
    expect(cut.targets).toEqual({ calories: 2160, protein: 128, fat: 73, carbs: 248 });
    // startingTargets(gain 0.25%) → 2820 kcal.
    expect(macroPlan({ ...base, goal: "bulk", pace: 0.25 }).targets?.calories).toBe(2820);
    expect(macroPlan(base).targets?.calories).toBe(2600);
  });

  it("chains with the Mifflin-St Jeor estimate", () => {
    const expenditure = tdee({ age: 30, heightCm: 180, weightKg: 80, sex: "male", activity: "moderate" });
    // 2759 − 440 = 2319.
    expect(macroPlan({ ...base, goal: "cut", pace: 0.5, expenditure }).calories).toBe(2319);
  });

  it("does not generate a cut below a BMI of 18.5", () => {
    // 59.9 kg at 180 cm is BMI 18.49; 60 kg is 18.52.
    expect(macroPlan({ ...base, goal: "cut", pace: 0.5, weightKg: 59.9, expenditure: 2200 }).blocked).toBe("underweight");
    expect(macroPlan({ ...base, goal: "cut", pace: 0.5, weightKg: 60, expenditure: 2200 }).blocked).toBeNull();
    // Maintenance and a bulk stay open at the same weight.
    expect(macroPlan({ ...base, weightKg: 59.9, expenditure: 2200 }).blocked).toBeNull();
    expect(macroPlan({ ...base, goal: "bulk", pace: 0.25, weightKg: 59.9, expenditure: 2200 }).blocked).toBeNull();
  });

  it("keeps calories within 1,500–5,000 kcal, edges included", () => {
    expect(macroPlan({ ...base, expenditure: 1500 }).blocked).toBeNull();
    expect(macroPlan({ ...base, expenditure: 1499 }).blocked).toBe("calories-low");
    expect(macroPlan({ ...base, expenditure: 5000 }).blocked).toBeNull();
    // 1600 − 0.8 × 1100 = 720.
    const low = macroPlan({ ...base, goal: "cut", pace: 1, expenditure: 1600 });
    expect(low).toMatchObject({ blocked: "calories-low", calories: 720, targets: null });
    // 100 kg bulk at 0.5%: 5000 + 0.5 × 1100 = 5550.
    expect(macroPlan({ ...base, goal: "bulk", pace: 0.5, weightKg: 100, expenditure: 5000 }).blocked).toBe("calories-high");
  });

  it("checks maintenance first: 1,200–5,000 kcal", () => {
    expect(macroPlan({ ...base, expenditure: 1199 }).blocked).toBe("expenditure-low");
    expect(macroPlan({ ...base, expenditure: 5001 }).blocked).toBe("expenditure-high");
    // 1,200 is accepted as maintenance but is below the 1,500 kcal target floor.
    expect(macroPlan({ ...base, expenditure: 1200 }).blocked).toBe("calories-low");
    // A tall, light cut with low maintenance reports the maintenance problem before the BMI.
    expect(macroPlan({ ...base, goal: "cut", pace: 0.5, weightKg: 50, expenditure: 1100 }).blocked).toBe("expenditure-low");
  });

  it("does not generate negative carbs", () => {
    // 150 kg at 2.2 g/kg: P = 330 (1320 kcal), fat floor 90 (810 kcal); (1500 − 2130) / 4 = −157.5 → −157.
    expect(macroPlan({ ...base, weightKg: 150, proteinPerKg: 2.2, expenditure: 1500 }).blocked).toBe("carbs");
    // Carbs of exactly 0 are allowed; −0.75 rounds to −1 and is not.
    const zero = { ...base, weightKg: 106, proteinPerKg: 2.2, diet: "more-fat" as const };
    expect(macroPlan({ ...zero, expenditure: 1507 }).targets?.carbs).toBe(0);
    expect(macroPlan({ ...zero, expenditure: 1505 }).blocked).toBe("carbs");
  });
});

describe("macroShares", () => {
  it("splits the energy in whole percent that add up to 100", () => {
    const t = { calories: 2400, protein: 128, fat: 84, carbs: 283 };
    expect(macroEnergy(t)).toEqual({ protein: 512, carbs: 1132, fat: 756 });
    // 21.33, 47.17, 31.5 → floors 21, 47, 31; the spare point goes to fat (largest remainder).
    expect(macroShares(t)).toEqual({ protein: 21, carbs: 47, fat: 32 });
  });

  it("always adds up to 100 across the app's choices", () => {
    for (const diet of ["balanced", "more-carbs", "more-fat"] as const)
      for (const protein of [1.4, 1.6, 2, 2.2])
        for (let weight = 50; weight <= 140; weight += 7)
          for (let calories = 1500; calories <= 5000; calories += 175) {
            const t = splitMacros(calories, weight, protein, diet);
            if (t.carbs < 0) continue;
            const s = macroShares(t);
            expect(s.protein + s.carbs + s.fat).toBe(100);
          }
  });

  it("is zero when there is no energy", () => {
    expect(macroShares({ calories: 0, protein: 0, fat: 0, carbs: 0 })).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });
});
