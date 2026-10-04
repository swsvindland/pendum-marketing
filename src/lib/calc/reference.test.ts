import { describe, expect, it } from "vitest";
import { ZONE_TABLE_AGES, estimateMaxHr, heartRateZones, zonesByAge } from "./heart-rate-zones";
import { REP_MAX_EXAMPLE_KG, repMaxReference, repMaxTable } from "./one-rep-max";
import { COMMON_LOADS, GYM_DEFAULTS, commonLoads, plateLoading } from "./plates";
import { PROTEIN_GOALS, grams, proteinReference } from "./protein";
import { TDEE_EXAMPLE, restingEnergy, tdee, tdeeExample } from "./tdee";

// The reference tables the calculator pages render before anything is typed. Each helper is the lib's own function
// on a fixed input, so the page's numbers and the tool's can never drift apart; the checks here pin the published
// values the pages quote.

describe("repMaxReference", () => {
  it("is the rep-max table at 100 kg, so loads read as percentages", () => {
    const rows = repMaxReference();
    expect(rows).toHaveLength(12);
    expect(rows.map((r) => r.reps)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(rows[0]).toEqual({ reps: 1, percent: 100, load: REP_MAX_EXAMPLE_KG });
    // Epley inverted: 100 / (1 + 5/30) = 85.71, 100 / (1 + 10/30) = 75.
    expect(rows[4].percent).toBeCloseTo(85.714, 2);
    expect(rows[4].load).toBeCloseTo(85.714, 2);
    expect(rows[9].percent).toBeCloseTo(75, 10);
    // The page rounds to whole percent: 94, 86 and 75 for 2, 5 and 10 reps, as its method text says.
    expect([rows[1], rows[4], rows[9]].map((r) => Math.round(r.percent))).toEqual([94, 86, 75]);
  });

  it("matches the tool's table row for row", () => {
    const tool = repMaxTable(100);
    repMaxReference().forEach((row, i) => {
      expect(row.load).toBe(tool[i].load);
      expect(row.percent).toBeCloseTo(tool[i].fraction * 100, 12);
    });
  });
});

describe("zonesByAge", () => {
  it("covers ages 20 to 70 in five-year steps", () => {
    expect([...ZONE_TABLE_AGES]).toEqual([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
    expect(zonesByAge().map((r) => r.age)).toEqual([...ZONE_TABLE_AGES]);
  });

  it("is the Tanaka maximum and the percent-of-maximum zones the tool shows", () => {
    const at40 = zonesByAge().find((r) => r.age === 40)!;
    expect(at40.maxHr).toBe(180);
    // The page's example: 90–107, 108–125, 126–143, 144–161 and 162–180 bpm at age 40.
    expect(at40.zones.map((z) => [z.low, z.high])).toEqual([
      [90, 107],
      [108, 125],
      [126, 143],
      [144, 161],
      [162, 180],
    ]);
    for (const row of zonesByAge()) {
      expect(row.maxHr).toBe(estimateMaxHr(row.age));
      expect(row.zones).toEqual(heartRateZones(row.maxHr)!.zones);
      expect(row.zones[4].high).toBe(row.maxHr);
    }
  });

  it("leaves out an age the estimate does not cover", () => {
    expect(zonesByAge([10, 40, 120]).map((r) => r.age)).toEqual([40]);
  });
});

describe("tdeeExample", () => {
  it("is the page's worked example: 1,780 kcal resting, 2,759 kcal active", () => {
    const example = tdeeExample();
    expect(example.profile).toEqual(TDEE_EXAMPLE);
    expect(example.resting).toBe(1780);
    expect(Math.round(restingEnergy(TDEE_EXAMPLE))).toBe(1780);
    expect(example.levels.map((l) => l.activity)).toEqual(["low", "light", "moderate", "high"]);
    expect(example.levels.find((l) => l.activity === "moderate")!.kcal).toBe(2759);
    for (const level of example.levels) expect(level.kcal).toBe(tdee({ ...TDEE_EXAMPLE, activity: level.activity }));
  });
});

describe("commonLoads", () => {
  it("lists 60 to 200 kg by 10 and the common pound loads", () => {
    expect([...COMMON_LOADS.kg]).toEqual([60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200]);
    expect([...COMMON_LOADS.lb]).toEqual([95, 135, 185, 225, 315]);
  });

  it("makes every listed load exactly with the default bar and plates", () => {
    for (const unit of ["kg", "lb"] as const) {
      const rows = commonLoads(unit);
      expect(rows.map((r) => r.load)).toEqual([...COMMON_LOADS[unit]]);
      for (const row of rows) {
        expect(row.exact, `${row.load} ${unit}`).toBe(true);
        const { bar } = GYM_DEFAULTS[unit];
        const perSide = row.perSide.reduce((sum, g) => sum + g.plate * g.count, 0);
        expect(bar + 2 * perSide).toBeCloseTo(row.load, 9);
        expect(row.perSide.map((g) => g.plate)).toEqual([...row.perSide.map((g) => g.plate)].sort((a, b) => b - a));
      }
    }
  });

  it("agrees with the tool's loading", () => {
    // 100 kg: 25 + 15 a side; 140 kg: 25 + 25 + 10; 135 lb: a 45 a side; 315 lb: three 45s.
    const kg = Object.fromEntries(commonLoads("kg").map((r) => [r.load, r.perSide]));
    expect(kg[100]).toEqual([
      { plate: 25, count: 1 },
      { plate: 15, count: 1 },
    ]);
    expect(kg[140]).toEqual([
      { plate: 25, count: 2 },
      { plate: 10, count: 1 },
    ]);
    const lb = Object.fromEntries(commonLoads("lb").map((r) => [r.load, r.perSide]));
    expect(lb[135]).toEqual([{ plate: 45, count: 1 }]);
    expect(lb[315]).toEqual([{ plate: 45, count: 3 }]);
    expect(plateLoading(185, 45, GYM_DEFAULTS.lb.plates).perSide).toEqual([45, 25]);
    expect(lb[185]).toEqual([
      { plate: 45, count: 1 },
      { plate: 25, count: 1 },
    ]);
  });
});

describe("proteinReference", () => {
  it("is each goal's range and target with the grams at 80 kg", () => {
    const rows = proteinReference();
    expect(rows.map((r) => r.goal)).toEqual(["maintain", "build", "lose"]);
    for (const row of rows) {
      expect(row.min).toBe(PROTEIN_GOALS[row.goal].min);
      expect(row.max).toBe(PROTEIN_GOALS[row.goal].max);
      expect(row.target).toBe(PROTEIN_GOALS[row.goal].target);
      expect(row.grams).toEqual({ min: grams(80, row.min), max: grams(80, row.max), target: grams(80, row.target) });
    }
    // 80 × 1.6 = 128 g to maintain, 80 × 2.0 = 160 g to build, 80 × 2.2 = 176 g to lose fat.
    expect(rows.map((r) => r.grams.target)).toEqual([128, 160, 176]);
  });

  it("takes another example weight and refuses one that is not positive", () => {
    expect(proteinReference(100).map((r) => r.grams.target)).toEqual([160, 200, 220]);
    expect(() => proteinReference(0)).toThrow(RangeError);
  });
});
