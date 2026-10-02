import { describe, expect, it } from "vitest";
import { MEAL_COUNTS, PROTEIN_GOALS, grams, leanMass, leanMassView, perMeal, proteinRange } from "./protein";

describe("protein", () => {
  it("uses the published ranges and Vector Macros' settings", () => {
    // ISSN 2017: 1.4–2.0 g/kg; Morton et al. 2018: 1.62 g/kg breakpoint, upper 95% CI 2.20; Hector and Phillips
    // 2018: 1.6–2.4 g/kg in a deficit.
    expect(PROTEIN_GOALS.maintain).toMatchObject({ min: 1.4, max: 2.0, target: 1.6 });
    expect(PROTEIN_GOALS.build).toMatchObject({ min: 1.6, max: 2.2, target: 2.0 });
    expect(PROTEIN_GOALS.lose).toMatchObject({ min: 1.6, max: 2.4, target: 2.2 });
    for (const g of Object.values(PROTEIN_GOALS)) {
      expect(g.target).toBeGreaterThanOrEqual(g.min);
      expect(g.target).toBeLessThanOrEqual(g.max);
      // Every target is a Vector Macros protein setting.
      expect([1.4, 1.6, 2.0, 2.2]).toContain(g.target);
    }
  });

  it("rounds grams as Vector Macros does", () => {
    // Vector Macros test vector: 80 kg at 1.6 g/kg is protein 128.
    expect(grams(80, 1.6)).toBe(128);
    expect(grams(80, 2.2)).toBe(176);
    // 72.5 × 1.4 = 101.5 rounds half up to 102.
    expect(grams(72.5, 1.4)).toBe(102);
  });

  it("gives the range, target and RDA for each goal", () => {
    // 80 kg by hand: 1.6 × 80 = 128, 2.2 × 80 = 176, 2.0 × 80 = 160, 0.8 × 80 = 64.
    expect(proteinRange(80, "build")).toEqual({ min: 128, max: 176, target: 160, rda: 64, rdaMultiple: { min: 2, max: 2.75 } });
    // 1.4 × 80 = 112, 2.0 × 80 = 160, 1.6 × 80 = 128.
    expect(proteinRange(80, "maintain")).toMatchObject({ min: 112, max: 160, target: 128, rda: 64 });
    // 1.6 × 80 = 128, 2.4 × 80 = 192, 2.2 × 80 = 176.
    expect(proteinRange(80, "lose")).toMatchObject({ min: 128, max: 192, target: 176, rda: 64 });
    // 200 lb = 90.718474 kg: 1.6 × 90.718 = 145.15 → 145; 2.2 × 90.718 = 199.58 → 200; RDA 72.57 → 73.
    expect(proteinRange(200 * 0.45359237, "build")).toMatchObject({ min: 145, max: 200, target: 181, rda: 73 });
    const maintain = proteinRange(80, "maintain")!;
    expect(maintain.rdaMultiple.min).toBeCloseTo(1.75, 10);
    expect(maintain.rdaMultiple.max).toBeCloseTo(2.5, 10);
  });

  it("rejects weights that are not positive", () => {
    expect(proteinRange(0, "build")).toBeNull();
    expect(proteinRange(-70, "build")).toBeNull();
    expect(proteinRange(Number.NaN, "build")).toBeNull();
  });

  it("finds lean mass and the lean-mass ranges", () => {
    // 80 kg at 15% fat: 80 × 0.85 = 68 kg lean.
    expect(leanMass(80, 15)).toBeCloseTo(68, 10);
    const lose = leanMassView(80, 15, "lose")!;
    expect(lose.leanKg).toBeCloseTo(68, 10);
    // Helms et al. 2014, 2.3–3.1 g/kg lean mass: 2.3 × 68 = 156.4 → 156; 3.1 × 68 = 210.8 → 211.
    expect(lose.deficit).toEqual({ min: 156, max: 211 });
    // The 128–192 g body-weight range is 1.88–2.82 g per kg of lean mass.
    expect(lose.perLeanKg.min).toBeCloseTo(128 / 68, 10);
    expect(lose.perLeanKg.max).toBeCloseTo(192 / 68, 10);
    // Only a fat-loss goal gets the deficit range.
    expect(leanMassView(80, 15, "build")!.deficit).toBeNull();
    expect(leanMassView(80, 15, "maintain")!.deficit).toBeNull();
  });

  it("rejects body fat outside 0 to 100", () => {
    expect(leanMass(80, 0)).toBeNull();
    expect(leanMass(80, 100)).toBeNull();
    expect(leanMass(80, -5)).toBeNull();
    expect(leanMass(80, Number.NaN)).toBeNull();
    expect(leanMassView(80, 120, "lose")).toBeNull();
    expect(leanMassView(0, 15, "lose")).toBeNull();
  });

  it("splits the target across meals", () => {
    // Schoenfeld and Aragon 2018: 0.4 g/kg a meal over four meals is 1.6 g/kg a day. 80 kg: 128 g / 4 = 32 g.
    const four = perMeal(128, 80, 4)!;
    expect(four.grams).toBe(32);
    expect(four.perKg).toBeCloseTo(0.4, 10);
    // 160 g over 3 meals is 53.3 → 53 g, 0.667 g/kg; over 5 meals 32 g, 0.4 g/kg.
    expect(perMeal(160, 80, 3)).toEqual({ grams: 53, perKg: 160 / 3 / 80 });
    expect(perMeal(160, 80, 5)!.perKg).toBeCloseTo(0.4, 10);
    expect(MEAL_COUNTS).toEqual([3, 4, 5]);
  });

  it("rejects an impossible meal split", () => {
    expect(perMeal(128, 80, 0)).toBeNull();
    expect(perMeal(128, 80, 2.5)).toBeNull();
    expect(perMeal(0, 80, 4)).toBeNull();
    expect(perMeal(128, 0, 4)).toBeNull();
  });
});
