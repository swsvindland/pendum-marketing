import { describe, expect, it } from "vitest";
import {
  DRINKS_ML_PER_KG,
  DRINK_SHARE,
  TOTAL_ML_PER_KG,
  WATER_REFERENCES,
  baselineDrinks,
  cups,
  exerciseDrinks,
  glasses,
  waterEstimate,
} from "./water";

describe("WATER_REFERENCES", () => {
  it("holds the published adequate intakes", () => {
    // IOM 2005: total water 3.7 L (men) and 2.7 L (women); drinks 3.0 L and 2.2 L.
    expect(WATER_REFERENCES.nasem.male).toEqual({ total: 3700, drinks: 3000 });
    expect(WATER_REFERENCES.nasem.female).toEqual({ total: 2700, drinks: 2200 });
    // EFSA 2010: total water 2.5 L (men) and 2.0 L (women).
    expect(WATER_REFERENCES.efsa.male.total).toBe(2500);
    expect(WATER_REFERENCES.efsa.female.total).toBe(2000);
  });

  it("takes EFSA's drinks figure as 80 % of its total, the share NASEM reports", () => {
    expect(WATER_REFERENCES.efsa.male.drinks).toBeCloseTo(2500 * DRINK_SHARE, 9);
    expect(WATER_REFERENCES.efsa.female.drinks).toBeCloseTo(2000 * DRINK_SHARE, 9);
    // NASEM's own split: 3.0 / 3.7 = 0.81 and 2.2 / 2.7 = 0.815, "about 81 percent".
    expect(WATER_REFERENCES.nasem.male.drinks / WATER_REFERENCES.nasem.male.total).toBeCloseTo(0.81, 2);
    expect(WATER_REFERENCES.nasem.female.drinks / WATER_REFERENCES.nasem.female.total).toBeCloseTo(0.815, 3);
  });

  it("names a per-kg drinks figure that is 35 mL/kg × 80 %", () => {
    expect(DRINKS_ML_PER_KG).toBeCloseTo(TOTAL_ML_PER_KG * DRINK_SHARE, 9);
  });
});

describe("baselineDrinks", () => {
  it("is 28 mL per kg inside the reference range", () => {
    // 80 kg × 28 = 2,240 mL, between EFSA's 2,000 and NASEM's 3,000 for men.
    expect(baselineDrinks("male", 80)).toEqual({ perKg: 2240, ml: 2240, bound: null });
    // 65 kg × 28 = 1,820 mL, between 1,600 and 2,200 for women.
    expect(baselineDrinks("female", 65)).toEqual({ perKg: 1820, ml: 1820, bound: null });
  });

  it("is held at EFSA's figure for small bodies and at NASEM's for large ones", () => {
    // 70 kg × 28 = 1,960 < 2,000: EFSA's figure for men.
    expect(baselineDrinks("male", 70)).toEqual({ perKg: 1960, ml: 2000, bound: "efsa" });
    // 120 kg × 28 = 3,360 > 3,000: NASEM's figure for men.
    expect(baselineDrinks("male", 120)).toEqual({ perKg: 3360, ml: 3000, bound: "nasem" });
    // 50 kg × 28 = 1,400 < 1,600; 90 kg × 28 = 2,520 > 2,200 (women).
    expect(baselineDrinks("female", 50)).toEqual({ perKg: 1400, ml: 1600, bound: "efsa" });
    expect(baselineDrinks("female", 90)).toEqual({ perKg: 2520, ml: 2200, bound: "nasem" });
  });

  it("counts a weight exactly at a reference as inside the range", () => {
    // 2,000 / 28 = 71.43 kg and 3,000 / 28 = 107.14 kg for men; 1,600 / 28 = 57.14 and 2,200 / 28 = 78.57 for women.
    expect(baselineDrinks("male", 2000 / 28).bound).toBeNull();
    expect(baselineDrinks("male", 3000 / 28).bound).toBeNull();
    expect(baselineDrinks("male", 71.4).bound).toBe("efsa");
    expect(baselineDrinks("male", 107.2).bound).toBe("nasem");
    expect(baselineDrinks("female", 57.1).bound).toBe("efsa");
    expect(baselineDrinks("female", 57.2).bound).toBeNull();
    expect(baselineDrinks("female", 78.5).bound).toBeNull();
    expect(baselineDrinks("female", 78.6).bound).toBe("nasem");
  });
});

describe("exerciseDrinks", () => {
  it("is 0.6 L an hour, the middle of ACSM's 0.4–0.8 L", () => {
    expect(exerciseDrinks(60)).toBe(600);
    expect(exerciseDrinks(45)).toBe(450);
    expect(exerciseDrinks(0)).toBe(0);
    expect(exerciseDrinks(300)).toBe(3000);
  });
});

describe("waterEstimate", () => {
  it("adds the baseline, exercise and heat", () => {
    // 80 kg man, 60 min, hot: 2,240 + 600 + 1,000 = 3,840 mL.
    expect(waterEstimate({ sex: "male", weightKg: 80, exerciseMin: 60, hot: true })).toEqual({
      perKg: 2240,
      ml: 2240,
      bound: null,
      exercise: 600,
      heat: 1000,
      total: 3840,
    });
    // 65 kg woman, 30 min, temperate: 1,820 + 300 = 2,120 mL.
    expect(waterEstimate({ sex: "female", weightKg: 65, exerciseMin: 30 })?.total).toBe(2120);
    // No exercise, no heat: the baseline alone.
    expect(waterEstimate({ sex: "female", weightKg: 50 })?.total).toBe(1600);
  });

  it("converts an imperial weight exactly before the rule", () => {
    // 176 lb = 79.832 kg × 28 = 2,235.3 mL.
    expect(waterEstimate({ sex: "male", weightKg: 176 * 0.45359237 })?.total).toBeCloseTo(2235.3, 1);
  });

  it("covers the input range edges", () => {
    // Lightest woman, no exercise: 35 kg × 28 = 980, held at 1,600.
    expect(waterEstimate({ sex: "female", weightKg: 35 })?.total).toBe(1600);
    // Heaviest man, five hours in the heat: 3,000 + 3,000 + 1,000 = 7,000 mL.
    expect(waterEstimate({ sex: "male", weightKg: 350, exerciseMin: 300, hot: true })?.total).toBe(7000);
  });

  it("returns null for inputs outside the limits or not numbers", () => {
    expect(waterEstimate({ sex: "male", weightKg: 34.9 })).toBeNull();
    expect(waterEstimate({ sex: "male", weightKg: 350.1 })).toBeNull();
    expect(waterEstimate({ sex: "male", weightKg: Number.NaN })).toBeNull();
    expect(waterEstimate({ sex: "male", weightKg: 80, exerciseMin: -1 })).toBeNull();
    expect(waterEstimate({ sex: "male", weightKg: 80, exerciseMin: 301 })).toBeNull();
    expect(waterEstimate({ sex: "male", weightKg: 80, exerciseMin: Number.POSITIVE_INFINITY })).toBeNull();
    expect(waterEstimate({ sex: "other" as "male", weightKg: 80 })).toBeNull();
  });
});

describe("glasses and cups", () => {
  it("counts 250 mL glasses and 8 US fl oz cups", () => {
    // 2,500 mL / 250 = 10 glasses; Vector Hydration's default goal.
    expect(glasses(2500)).toBe(10);
    expect(glasses(2240)).toBeCloseTo(8.96, 9);
    // 64 fl oz × 29.5735295625 = 1,892.7059 mL = 8 cups.
    expect(cups(64 * 29.5735295625)).toBeCloseTo(8, 9);
    // 3,000 mL = 101.44 fl oz = 12.68 cups; NASEM's "101 fluid oz".
    expect(cups(3000)).toBeCloseTo(12.68, 2);
  });
});
