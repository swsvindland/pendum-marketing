import { describe, expect, it } from "vitest";
import { KG_PER_LB, mlToFlOz } from "@/lib/units";
import {
  DACH_ADULT,
  DRINKS_ML_PER_KG,
  EFSA_DRINK_SHARE,
  TOTAL_ML_PER_KG,
  WATER_REFERENCES,
  baselineDrinks,
  cups,
  exerciseDrinks,
  glasses,
  waterEstimate,
  waterReadout,
  type Sex,
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
    expect(WATER_REFERENCES.efsa.male.drinks).toBeCloseTo(2500 * EFSA_DRINK_SHARE, 9);
    expect(WATER_REFERENCES.efsa.female.drinks).toBeCloseTo(2000 * EFSA_DRINK_SHARE, 9);
    // NASEM's own split: 3.0 / 3.7 = 0.81 and 2.2 / 2.7 = 0.815, "about 81 percent".
    expect(WATER_REFERENCES.nasem.male.drinks / WATER_REFERENCES.nasem.male.total).toBeCloseTo(0.81, 2);
    expect(WATER_REFERENCES.nasem.female.drinks / WATER_REFERENCES.nasem.female.total).toBeCloseTo(0.815, 3);
  });
});

describe("D-A-CH drinks per kg", () => {
  it("holds the DGE table for adults 25 to under 51", () => {
    // Drinks 1,410 + food 860 + oxidation water 330 = 2,600 mL; 54 % from drinks.
    expect(DACH_ADULT.drinks + DACH_ADULT.food + DACH_ADULT.oxidation).toBe(DACH_ADULT.total);
    expect(DACH_ADULT.drinks / DACH_ADULT.total).toBeCloseTo(0.542, 3);
  });

  it("is 35 mL/kg at D-A-CH's own drinks share, to a whole mL", () => {
    // 35 × 1,410 / 2,600 = 18.98.
    expect((TOTAL_ML_PER_KG * DACH_ADULT.drinks) / DACH_ADULT.total).toBeCloseTo(18.98, 2);
    expect(DRINKS_ML_PER_KG).toBe(Math.round((TOTAL_ML_PER_KG * DACH_ADULT.drinks) / DACH_ADULT.total));
    // Ages 19 to under 25: 35 × 1,470 / 2,700 = 19.06, the same whole mL.
    expect(Math.round((TOTAL_ML_PER_KG * 1470) / 2700)).toBe(DRINKS_ML_PER_KG);
  });
});

describe("baselineDrinks", () => {
  it("is 19 mL per kg inside the reference range", () => {
    // 110 kg × 19 = 2,090 mL, between EFSA's 2,000 and NASEM's 3,000 for men.
    expect(baselineDrinks("male", 110)).toEqual({ perKg: 2090, ml: 2090, bound: null });
    // 100 kg × 19 = 1,900 mL, between 1,600 and 2,200 for women.
    expect(baselineDrinks("female", 100)).toEqual({ perKg: 1900, ml: 1900, bound: null });
  });

  it("is held at EFSA's figure for most bodies and at NASEM's for very large ones", () => {
    // 80 kg × 19 = 1,520 < 2,000: EFSA's figure for men.
    expect(baselineDrinks("male", 80)).toEqual({ perKg: 1520, ml: 2000, bound: "efsa" });
    // 170 kg × 19 = 3,230 > 3,000: NASEM's figure for men.
    expect(baselineDrinks("male", 170)).toEqual({ perKg: 3230, ml: 3000, bound: "nasem" });
    // 70 kg × 19 = 1,330 < 1,600; 120 kg × 19 = 2,280 > 2,200 (women).
    expect(baselineDrinks("female", 70)).toEqual({ perKg: 1330, ml: 1600, bound: "efsa" });
    expect(baselineDrinks("female", 120)).toEqual({ perKg: 2280, ml: 2200, bound: "nasem" });
  });

  it("turns over at the weights the page gives", () => {
    // 2,000 / 19 = 105.26 kg and 3,000 / 19 = 157.89 kg for men; 1,600 / 19 = 84.21 and 2,200 / 19 = 115.79 for
    // women. The page states the range in tenths rounded inward: 105.3–157.8 kg and 84.3–115.7 kg.
    expect(baselineDrinks("male", 105.2).bound).toBe("efsa");
    expect(baselineDrinks("male", 105.3).bound).toBeNull();
    expect(baselineDrinks("male", 157.8).bound).toBeNull();
    expect(baselineDrinks("male", 157.9).bound).toBe("nasem");
    expect(baselineDrinks("female", 84.2).bound).toBe("efsa");
    expect(baselineDrinks("female", 84.3).bound).toBeNull();
    expect(baselineDrinks("female", 115.7).bound).toBeNull();
    expect(baselineDrinks("female", 115.8).bound).toBe("nasem");
    // Exactly at a reference the baseline is the reference either way.
    expect(baselineDrinks("male", 3000 / 19)).toEqual({ perKg: 3000, ml: 3000, bound: null });
    expect(baselineDrinks("female", 1600 / 19).ml).toBe(1600);
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
    // 110 kg man, 60 min, hot: 2,090 + 600 + 1,000 = 3,690 mL.
    expect(waterEstimate({ sex: "male", weightKg: 110, exerciseMin: 60, hot: true })).toEqual({
      perKg: 2090,
      ml: 2090,
      bound: null,
      exercise: 600,
      heat: 1000,
      total: 3690,
    });
    // 100 kg woman, 30 min, temperate: 1,900 + 300 = 2,200 mL.
    expect(waterEstimate({ sex: "female", weightKg: 100, exerciseMin: 30 })?.total).toBe(2200);
    // 70 kg woman, 30 min: EFSA's 1,600 + 300 = 1,900 mL (the page's example).
    expect(waterEstimate({ sex: "female", weightKg: 70, exerciseMin: 30 })?.total).toBe(1900);
    // No exercise, no heat: the baseline alone.
    expect(waterEstimate({ sex: "female", weightKg: 50 })?.total).toBe(1600);
  });

  it("converts an imperial weight exactly before the rule", () => {
    // 250 lb = 113.398 kg × 19 = 2,154.6 mL.
    expect(waterEstimate({ sex: "male", weightKg: 250 * KG_PER_LB })?.total).toBeCloseTo(2154.56, 2);
  });

  it("covers the input range edges", () => {
    // Lightest woman, no exercise: 35 kg × 19 = 665, held at 1,600.
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

describe("waterReadout", () => {
  const readout = (sex: Sex, weightKg: number, exerciseMin: number, hot: boolean, units: "metric" | "us") =>
    waterReadout(waterEstimate({ sex, weightKg, exerciseMin, hot })!, sex, units);

  it("shows the page's examples", () => {
    // 110 kg man, 60 min: 2,090 + 600 = 2,690 mL, 2.7 L, 10.8 glasses; 0.3 L below NASEM's 3.0, 0.7 above EFSA's 2.0.
    expect(readout("male", 110, 60, false, "metric")).toEqual({
      baseline: 2090,
      exercise: 600,
      heat: 0,
      total: 2.7,
      servings: 10.8,
      references: {
        nasem: { total: 3.7, drinks: 3, difference: -0.3 },
        efsa: { total: 2.5, drinks: 2, difference: 0.7 },
      },
      note: null,
    });
    // 70 kg woman, 30 min: 19 × 70 = 1,330 mL, below EFSA's 1,600; 1,600 + 300 = 1.9 L, 7.6 glasses.
    const woman = readout("female", 70, 30, false, "metric");
    expect(woman).toMatchObject({ baseline: 1600, exercise: 300, total: 1.9, servings: 7.6 });
    expect(woman.note).toEqual({ perKg: 1330, bound: 1600 });
  });

  it("rounds the total from the parts as shown, halves up", () => {
    // 2,000 + 250 = 2,250 mL: 2.3 L, and 2.3 − 3.0 = −0.7 against NASEM (not −0.8 from the unrounded 2.25).
    const r = readout("male", 60, 25, false, "metric");
    expect(r.total).toBe(2.3);
    expect(r.references.nasem.difference).toBe(-0.7);
  });

  it("keeps US parts, total and differences consistent", () => {
    // 60 kg man, hot: 67.6 + 33.8 = 101.4 fl oz, shown as 101, which is NASEM's 3,000 mL (101.4 fl oz) as shown.
    const hot = readout("male", 60, 0, true, "us");
    expect(hot).toMatchObject({ baseline: 67.6, exercise: 0, heat: 33.8, total: 101 });
    expect(hot.references.nasem).toEqual({ total: 125, drinks: 101, difference: 0 });
    // No heat: 68 fl oz, 33 below NASEM's 101 as shown (not 34 from the unrounded 33.8).
    const temperate = readout("male", 60, 0, false, "us");
    expect(temperate.total).toBe(68);
    expect(temperate.references.nasem.difference).toBe(-33);
    expect(temperate.references.efsa).toEqual({ total: 85, drinks: 68, difference: 0 });
    expect(temperate.servings).toBe(8.5);
  });

  it("drops the note when the per-kg figure shows as the bound", () => {
    // 105.25 kg × 19 = 1,999.75 mL, 2,000 to the mL: the same number as EFSA's.
    expect(baselineDrinks("male", 105.25).bound).toBe("efsa");
    expect(readout("male", 105.25, 0, false, "metric").note).toBeNull();
    // 232 lb × 19 mL/kg = 1,999.4 mL = 67.6 fl oz, as EFSA's 2,000 mL shows; 231 lb gives 67.3.
    expect(readout("male", 232 * KG_PER_LB, 0, false, "us").note).toBeNull();
    expect(readout("male", 231 * KG_PER_LB, 0, false, "us").note).toEqual({ perKg: 67.3, bound: 67.6 });
    // 157.9 kg × 19 = 3,000.1 mL: 3,000 to the mL, as NASEM's.
    expect(readout("male", 157.9, 0, false, "metric").note).toBeNull();
    expect(readout("male", 160, 0, false, "metric").note).toEqual({ perKg: 3040, bound: 3000 });
  });

  it("agrees with itself across the input range", () => {
    for (const sex of ["female", "male"] as Sex[])
      for (let kg = 35; kg <= 200; kg += 0.7)
        for (let min = 0; min <= 300; min += 15)
          for (const hot of [false, true]) {
            const est = waterEstimate({ sex, weightKg: kg, exerciseMin: min, hot })!;
            const m = waterReadout(est, sex, "metric");
            const us = waterReadout(est, sex, "us");
            // The shown total is the shown parts' sum, rounded to the total's step.
            expect(Math.abs((m.baseline + m.exercise + m.heat) / 1000 - m.total)).toBeLessThanOrEqual(0.05 + 1e-9);
            expect(Math.abs(us.baseline + us.exercise + us.heat - us.total)).toBeLessThanOrEqual(0.5 + 1e-9);
            // Each difference is the shown total less the shown reference.
            for (const body of ["nasem", "efsa"] as const) {
              expect(m.references[body].difference).toBeCloseTo(m.total - m.references[body].drinks, 9);
              expect(us.references[body].difference).toBe(us.total - us.references[body].drinks);
            }
            // The shown total stays within a step of the unrounded estimate.
            expect(Math.abs(m.total - est.total / 1000)).toBeLessThanOrEqual(0.06);
            expect(Math.abs(us.total - mlToFlOz(est.total))).toBeLessThanOrEqual(0.7);
          }
  });
});
