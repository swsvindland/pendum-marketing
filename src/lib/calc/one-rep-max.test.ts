import { describe, expect, it } from "vitest";
import { brzycki, e1rm, repMaxLoad, repMaxTable, repsToFailure } from "./one-rep-max";

describe("e1rm", () => {
  it("matches Vector Lift's test vectors", () => {
    // lift-track: e1rm(100, 5, 2) = 100 × (1 + 7/30); e1rm(100, 5) = 100 × (1 + 5/30); e1rm(100, 1) = 100.
    expect(e1rm(100, 5, 2)).toBeCloseTo(123.3333333, 6);
    expect(e1rm(100, 5)).toBeCloseTo(116.6666667, 6);
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(0, 5)).toBe(0);
  });

  it("is Epley on reps to failure", () => {
    // By hand: 80 × (1 + 10/30) = 106.667; 60 × (1 + 12/30) = 84.
    expect(e1rm(80, 8, 2)).toBeCloseTo(106.6666667, 6);
    expect(e1rm(60, 12)).toBeCloseTo(84, 10);
    // 1 rep with reserve is no longer a single: 100 × (1 + 2/30).
    expect(e1rm(100, 1, 1)).toBeCloseTo(106.6666667, 6);
  });

  it("counts unknown or negative reserve as 0", () => {
    expect(repsToFailure(5)).toBe(5);
    expect(repsToFailure(5, null)).toBe(5);
    expect(repsToFailure(5, -2)).toBe(5);
    expect(repsToFailure(5, 3)).toBe(8);
    expect(e1rm(100, 5, -2)).toBe(e1rm(100, 5));
  });

  it("returns 0 for invalid inputs", () => {
    expect(e1rm(-100, 5)).toBe(0);
    expect(e1rm(100, 0)).toBe(0);
    expect(e1rm(NaN, 5)).toBe(0);
    expect(e1rm(100, NaN)).toBe(0);
  });
});

describe("brzycki", () => {
  it("is weight × 36 / (37 − reps)", () => {
    // By hand: 100 × 36 / 32 = 112.5 (5 reps); 100 × 36 / 27 = 133.333 (10 reps).
    expect(brzycki(100, 5)).toBeCloseTo(112.5, 10);
    expect(brzycki(100, 10)).toBeCloseTo(133.3333333, 6);
    expect(brzycki(100, 1)).toBeCloseTo(100, 10);
  });

  it("reads lower than Epley from 2 to 9 reps and meets it at 10", () => {
    for (let r = 2; r <= 9; r++) expect(brzycki(100, r)!).toBeLessThan(e1rm(100, r));
    // 36 / 27 = 1 + 10/30 = 4/3.
    expect(brzycki(100, 10)).toBeCloseTo(e1rm(100, 10), 10);
  });

  it("returns null where the equation has no meaning", () => {
    expect(brzycki(100, 37)).toBeNull();
    expect(brzycki(100, 0)).toBeNull();
    expect(brzycki(0, 5)).toBeNull();
  });
});

describe("rep-max table", () => {
  it("inverts Epley", () => {
    // 123.333 / (1 + 7/30) = 100: the set that produced the estimate.
    expect(repMaxLoad(e1rm(100, 5, 2), 7)).toBeCloseTo(100, 10);
    for (let r = 2; r <= 12; r++) expect(repMaxLoad(e1rm(80, r), r)).toBeCloseTo(80, 10);
    expect(repMaxLoad(150, 1)).toBe(150);
  });

  it("runs 1 to 12 reps with the share of the one-rep max", () => {
    const rows = repMaxTable(120);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toEqual({ reps: 1, load: 120, fraction: 1 });
    // By hand: 1 / (1 + 2/30) = 0.9375; 1 / (1 + 10/30) = 0.75; 1 / (1 + 12/30) = 0.714.
    expect(rows[1].fraction).toBeCloseTo(0.9375, 10);
    expect(rows[1].load).toBeCloseTo(112.5, 10);
    expect(rows[9].fraction).toBeCloseTo(0.75, 10);
    expect(rows[11].fraction).toBeCloseTo(0.7142857, 6);
    for (let i = 1; i < rows.length; i++) expect(rows[i].load).toBeLessThan(rows[i - 1].load);
  });
});
