import { describe, expect, it } from "vitest";
import { HR_LIMITS, ZONES, estimateMaxHr, foxMaxHr, heartRateZones, tanakaMaxHr, zoneEdge } from "./heart-rate-zones";

/** [low, high] of each zone, for compact assertions. */
const ranges = (maxHr: number, restingHr: number | null = null) => heartRateZones(maxHr, restingHr)!.zones.map((z) => [z.low, z.high]);

describe("maximum heart rate", () => {
  it("is 208 − 0.7 × age (Tanaka et al. 2001)", () => {
    // 208 − 0.7 × 20 = 194; × 40 = 180; × 60 = 166; × 100 = 138.
    expect(tanakaMaxHr(20)).toBe(194);
    expect(tanakaMaxHr(40)).toBe(180);
    expect(tanakaMaxHr(60)).toBe(166);
    expect(tanakaMaxHr(100)).toBe(138);
    // 208 − 0.7 × 35 = 183.5, held exactly so it rounds up.
    expect(tanakaMaxHr(35)).toBe(183.5);
  });

  it("rounds the estimate to a whole bpm, halves up", () => {
    expect(estimateMaxHr(35)).toBe(184);
    // 208 − 0.7 × 33 = 184.9 → 185; × 47 = 175.1 → 175.
    expect(estimateMaxHr(33)).toBe(185);
    expect(estimateMaxHr(47)).toBe(175);
  });

  it("agrees with 220 − age at 40 and is higher after it", () => {
    expect(foxMaxHr(40)).toBe(180);
    expect(tanakaMaxHr(40)).toBe(foxMaxHr(40));
    // Tanaka's point: 220 − age underestimates older adults. At 70: 159 against 150.
    expect(tanakaMaxHr(70)).toBe(159);
    expect(foxMaxHr(70)).toBe(150);
    // And it is lower for the young: 20 years, 194 against 200.
    expect(foxMaxHr(20) - tanakaMaxHr(20)).toBe(6);
  });

  it("rejects ages outside 18–100 or not whole years", () => {
    expect(estimateMaxHr(HR_LIMITS.age.min)).toBe(195); // 208 − 12.6 = 195.4
    expect(estimateMaxHr(17)).toBeNull();
    expect(estimateMaxHr(101)).toBeNull();
    expect(estimateMaxHr(30.5)).toBeNull();
    expect(estimateMaxHr(Number.NaN)).toBeNull();
  });
});

describe("zones as a percent of maximum", () => {
  it("rounds each edge and ends a zone 1 bpm below the next", () => {
    // HRmax 180: 50 % = 90, 60 % = 108, 70 % = 126, 80 % = 144, 90 % = 162, 100 % = 180.
    expect(ranges(180)).toEqual([
      [90, 107],
      [108, 125],
      [126, 143],
      [144, 161],
      [162, 180],
    ]);
    // HRmax 184: 92, 110.4 → 110, 128.8 → 129, 147.2 → 147, 165.6 → 166, 184.
    expect(ranges(184)).toEqual([
      [92, 109],
      [110, 128],
      [129, 146],
      [147, 165],
      [166, 184],
    ]);
  });

  it("rounds exact halves up, without floating-point drift", () => {
    // 185 × 50 % = 92.5 → 93; 185 × 90 % = 166.5 → 167.
    expect(zoneEdge(185, 50)).toBe(93);
    expect(zoneEdge(185, 90)).toBe(167);
    // 175 × 70 % = 122.5 → 123 and 165 × 70 % = 115.5 → 116, where 175 * 0.7 and 165 * 0.7 are 122.49999999999999
    // and 115.49999999999999 in floating point and would round down.
    expect(zoneEdge(175, 70)).toBe(123);
    expect(zoneEdge(165, 70)).toBe(116);
  });

  it("names the zones in order", () => {
    expect(heartRateZones(180)!.zones.map((z) => `${z.zone} ${z.label}`)).toEqual([
      "1 Very light",
      "2 Light",
      "3 Moderate",
      "4 Hard",
      "5 Maximum",
    ]);
    expect(heartRateZones(180)!.method).toBe("max");
    expect(heartRateZones(180)!.reserve).toBeNull();
  });
});

describe("zones from heart rate reserve (Karvonen)", () => {
  it("adds a percent of the reserve to the resting rate", () => {
    // ACSM worked example: HRmax 180, rest 70, reserve 110; 60–80 % HRR = 70 + 66 = 136 to 70 + 88 = 158 bpm.
    expect(zoneEdge(180, 60, 70)).toBe(136);
    expect(zoneEdge(180, 80, 70)).toBe(158);
    // HRmax 180, rest 60, reserve 120: 120, 132, 144, 156, 168, 180.
    expect(ranges(180, 60)).toEqual([
      [120, 131],
      [132, 143],
      [144, 155],
      [156, 167],
      [168, 180],
    ]);
    const set = heartRateZones(180, 60)!;
    expect(set.method).toBe("reserve");
    expect(set.reserve).toBe(120);
  });

  it("rounds reserve edges halves up", () => {
    // Rest 61, reserve 119: 61 + 59.5 = 120.5 → 121; 61 + 83.3 = 144.3 → 144.
    expect(zoneEdge(180, 50, 61)).toBe(121);
    expect(zoneEdge(180, 70, 61)).toBe(144);
  });
});

describe("zone coverage", () => {
  it("leaves no gap or overlap for every accepted maximum and resting rate", () => {
    for (let max = HR_LIMITS.maxHr.min; max <= HR_LIMITS.maxHr.max; max++) {
      for (const rest of [null, ...Array.from({ length: 81 }, (_, i) => i + HR_LIMITS.restingHr.min)]) {
        const set = heartRateZones(max, rest)!;
        expect(set).not.toBeNull();
        const zones = set.zones;
        expect(zones).toHaveLength(ZONES.length);
        expect(zones[4].high).toBe(max);
        for (let i = 0; i < zones.length; i++) {
          expect(zones[i].low).toBeLessThanOrEqual(zones[i].high);
          if (i > 0) expect(zones[i].low).toBe(zones[i - 1].high + 1);
        }
      }
    }
  });
});

describe("invalid inputs", () => {
  it("returns null", () => {
    expect(heartRateZones(Number.NaN)).toBeNull();
    expect(heartRateZones(0)).toBeNull();
    expect(heartRateZones(-180)).toBeNull();
    // A resting rate at or above the maximum.
    expect(heartRateZones(180, 180)).toBeNull();
    expect(heartRateZones(180, 190)).toBeNull();
    expect(heartRateZones(180, 0)).toBeNull();
    expect(heartRateZones(180, Number.NaN)).toBeNull();
    // A reserve under 10 bpm would make zones narrower than 1 bpm.
    expect(heartRateZones(120, 111)).toBeNull();
    expect(heartRateZones(120, 110)).not.toBeNull();
  });
});
