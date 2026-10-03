import { describe, expect, it } from "vitest";
import {
  GYM_DEFAULTS,
  achievableLoads,
  groupPlates,
  perSideSums,
  plateLoading,
  platesPerSide,
  roundLoad,
  searchLimit,
} from "./plates";

const kg = GYM_DEFAULTS.kg;
const lb = GYM_DEFAULTS.lb;

describe("roundLoad", () => {
  it("matches Vector Lift's test vectors", () => {
    // lift-track tests/lift.test.cjs.
    expect(roundLoad(101, kg.bar, kg.plates)).toBe(100);
    expect(roundLoad(101.3, kg.bar, kg.plates)).toBe(102.5);
    expect(roundLoad(99, kg.bar, kg.plates, "down")).toBe(97.5);
    expect(roundLoad(225, lb.bar, lb.plates)).toBe(225);
    expect(roundLoad(226, lb.bar, lb.plates)).toBe(225);
    expect(roundLoad(0, kg.bar, kg.plates)).toBe(0);
  });

  it("breaks a tie toward the lighter load", () => {
    // 101.25 kg sits halfway between 100 and 102.5.
    expect(roundLoad(101.25, kg.bar, kg.plates)).toBe(100);
    // 227.5 lb sits halfway between 225 and 230.
    expect(roundLoad(227.5, lb.bar, lb.plates)).toBe(225);
  });

  it("gives the empty bar for a target under it", () => {
    expect(roundLoad(15, kg.bar, kg.plates)).toBe(20);
    expect(roundLoad(15, kg.bar, kg.plates, "down")).toBe(20);
  });

  it("only makes loads from the plates available", () => {
    // Only 20s: 20 + 2 × 20k. 70 kg lies between 60 and 100; 60 is nearer.
    expect(roundLoad(70, 20, [20])).toBe(60);
    // No plates: the bar alone.
    expect(roundLoad(70, 20, [])).toBe(20);
  });

  it("reaches the next load above the target, past Lift's search limit", () => {
    // Lift searches up to target × 1.25 + 10 and would give the lighter, further load in each of these.
    // 45 lb bar, 45s only: 95 lb lies between 45 (50 under) and 135 (40 over).
    expect(roundLoad(95, 45, [45])).toBe(135);
    // 35 lb bar, 45s only: 85 lb lies between 35 (50 under) and 125 (40 over).
    expect(roundLoad(85, 35, [45])).toBe(125);
    // 45 lb bar, 45s and 35s: 82 lb lies between 45 (37 under) and 115 (33 over).
    expect(roundLoad(82, 45, [45, 35])).toBe(115);
    // 20 kg bar, 25s only: 46 kg lies between 20 (26 under) and 70 (24 over).
    expect(roundLoad(46, 20, [25])).toBe(70);
    // 10 kg bar, 20s only: 31 kg lies between 10 (21 under) and 50 (19 over).
    expect(roundLoad(31, 10, [20])).toBe(50);
  });

  it("finds the nearest load for sparse plate sets, by brute force", () => {
    const cases = [
      { bar: 45, plates: [45] },
      { bar: 35, plates: [45] },
      { bar: 45, plates: [45, 35] },
      { bar: 20, plates: [25] },
      { bar: 10, plates: [20] },
      { bar: 20, plates: [25, 15] },
    ];
    for (const { bar, plates } of cases) {
      // Every load from 0 to 20 of each plate a side, ascending; a tie keeps the lighter (earlier) load.
      const loads = new Set<number>();
      for (let a = 0; a <= 20; a++)
        for (let b = 0; b <= (plates.length > 1 ? 20 : 0); b++) loads.add(bar + 2 * (a * plates[0] + b * (plates[1] ?? 0)));
      const sorted = [...loads].sort((x, y) => x - y);
      for (let target = 1; target <= 300; target++) {
        const nearest = sorted.reduce((best, load) => (Math.abs(load - target) < Math.abs(best - target) ? load : best));
        expect(roundLoad(target, bar, plates)).toBe(nearest);
      }
    }
  });

  it("searches exactly as far as Lift with every default plate", () => {
    // The lightest default plate (1.25 kg, 2.5 lb) needs at most 2.5 or 5 above the target, inside Lift's + 10.
    for (let target = 1; target <= 1102; target++) {
      expect(searchLimit(target, kg.plates)).toBe(target * 1.25 + 10);
      expect(searchLimit(target, lb.plates)).toBe(target * 1.25 + 10);
    }
    // With no plates there is nothing to reach; Lift's limit stands.
    expect(searchLimit(70, [])).toBe(97.5);
  });
});

describe("achievable loads", () => {
  it("are the bar plus pairs of plates", () => {
    // Per side with 25 and 10: 0, 10, 20, 25, 30, 35 (in hundredths up to 35).
    expect(perSideSums([25, 10], 3500)).toEqual([0, 1000, 2000, 2500, 3000, 3500]);
    expect(achievableLoads(20, [25, 10], 90)).toEqual([20, 40, 60, 70, 80, 90]);
  });
});

describe("platesPerSide", () => {
  it("matches Vector Lift's test vectors", () => {
    expect(platesPerSide(100, kg.bar, kg.plates)).toEqual([25, 15]);
    expect(platesPerSide(102.5, kg.bar, kg.plates)).toEqual([25, 15, 1.25]);
    expect(platesPerSide(315, lb.bar, lb.plates)).toEqual([45, 45, 45]);
    expect(platesPerSide(15, kg.bar, kg.plates)).toBeNull();
  });

  it("uses the fewest plates, as Lift does", () => {
    // 165 lb: 60 a side is 35 + 25 (two plates), not 45 + 10 + 5.
    expect(platesPerSide(165, lb.bar, lb.plates)).toEqual([35, 25]);
    // 225 lb: (225 − 45) / 2 = 90 a side, two 45s.
    expect(platesPerSide(225, lb.bar, lb.plates)).toEqual([45, 45]);
    // 20 kg a side with only 15s and 10s: 10 + 10 (greedy 15 + … would fail).
    expect(platesPerSide(60, 20, [15, 10])).toEqual([10, 10]);
  });

  it("is empty for the bar alone and null for a load it cannot make", () => {
    expect(platesPerSide(20, kg.bar, kg.plates)).toEqual([]);
    expect(platesPerSide(101, kg.bar, kg.plates)).toBeNull();
  });
});

describe("plateLoading", () => {
  it("states the load, the plates and the difference", () => {
    expect(plateLoading(101, kg.bar, kg.plates)).toEqual({ load: 100, perSide: [25, 15], difference: -1, belowBar: false });
    expect(plateLoading(101.3, kg.bar, kg.plates)).toEqual({
      load: 102.5,
      perSide: [25, 15, 1.25],
      difference: 1.2,
      belowBar: false,
    });
    expect(plateLoading(225, lb.bar, lb.plates)).toEqual({ load: 225, perSide: [45, 45], difference: 0, belowBar: false });
  });

  it("treats a converted target as exact to the hundredth", () => {
    // 225 lb typed in pounds, held as kg and converted back: 225.00000000000003.
    const target = (225 * 0.45359237) / 0.45359237;
    expect(plateLoading(target, lb.bar, lb.plates).difference).toBe(0);
  });

  it("flags a target under the bar", () => {
    expect(plateLoading(15, kg.bar, kg.plates)).toEqual({ load: 20, perSide: [], difference: 5, belowBar: true });
  });
});

describe("groupPlates", () => {
  it("counts runs of equal plates", () => {
    expect(groupPlates([25, 25, 10, 1.25])).toEqual([
      { plate: 25, count: 2 },
      { plate: 10, count: 1 },
      { plate: 1.25, count: 1 },
    ]);
    expect(groupPlates([])).toEqual([]);
  });
});
