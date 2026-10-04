import { describe, expect, it } from "vitest";
import { ffmi, ffmiBands, ffmiCategory, normalizedFfmi, roundFfmi } from "./ffmi";

describe("ffmi", () => {
  it("matches Pendum Body's test vector", () => {
    // body-track tests/core.test.cjs: composition(80, 180, 20).ffmi is 19.753086419753085 (compared with a tolerance).
    expect(ffmi(80, 180, 20)).toBeCloseTo(19.753086419753085, 12);
  });

  it("is lean mass over height squared", () => {
    // 75 kg, 175 cm, 15 %: lean 75 × 0.85 = 63.75 kg; 63.75 / 1.75² = 63.75 / 3.0625 = 20.8163.
    expect(ffmi(75, 175, 15)).toBeCloseTo(20.8163, 4);
    // 60 kg, 165 cm, 25 %: lean 45 kg; 45 / 2.7225 = 16.5289.
    expect(ffmi(60, 165, 25)).toBeCloseTo(16.5289, 4);
    // 0 % body fat is BMI: 80 / 3.24 = 24.6914.
    expect(ffmi(80, 180, 0)).toBeCloseTo(24.6914, 4);
  });

  it("returns null for impossible inputs", () => {
    expect(ffmi(0, 180, 20)).toBeNull();
    expect(ffmi(80, 0, 20)).toBeNull();
    expect(ffmi(80, 180, -1)).toBeNull();
    expect(ffmi(80, 180, 100)).toBeNull();
    expect(ffmi(NaN, 180, 20)).toBeNull();
  });
});

describe("normalizedFfmi", () => {
  it("adds 6.1 per metre below 1.8 m (Kouri et al. 1995)", () => {
    // 175 cm: 20.8163 + 6.1 × 0.05 = 21.1213.
    expect(normalizedFfmi(ffmi(75, 175, 15)!, 175)).toBeCloseTo(21.1213, 4);
    // 165 cm: 16.5289 + 6.1 × 0.15 = 17.4439.
    expect(normalizedFfmi(ffmi(60, 165, 25)!, 165)).toBeCloseTo(17.4439, 4);
  });

  it("is unchanged at 1.8 m and lower above it", () => {
    expect(normalizedFfmi(20, 180)).toBeCloseTo(20, 12);
    // 190 cm: 22 + 6.1 × −0.1 = 21.39.
    expect(normalizedFfmi(22, 190)).toBeCloseTo(21.39, 10);
  });
});

describe("ffmiCategory", () => {
  it("uses Pendum Body's male band, both edges typical", () => {
    expect(ffmiCategory(16.9, "male")).toBe("lower");
    expect(ffmiCategory(17, "male")).toBe("typical");
    expect(ffmiCategory(20, "male")).toBe("typical");
    expect(ffmiCategory(20.1, "male")).toBe("higher");
    // body-track: metricContext('ffmi', 21, 'male') is ffmiHigh.
    expect(ffmiCategory(21, "male")).toBe("higher");
  });

  it("uses Pendum Body's female band", () => {
    expect(ffmiCategory(13.9, "female")).toBe("lower");
    expect(ffmiCategory(14, "female")).toBe("typical");
    // body-track: metricContext('ffmi', 16, 'female') is ffmiTypical.
    expect(ffmiCategory(16, "female")).toBe("typical");
    expect(ffmiCategory(17, "female")).toBe("typical");
    expect(ffmiCategory(17.1, "female")).toBe("higher");
  });

  it("judges the one-decimal value", () => {
    expect(roundFfmi(19.753086419753085)).toBe(19.8);
    expect(ffmiCategory(16.94, "male")).toBe("lower");
    expect(ffmiCategory(16.96, "male")).toBe("typical"); // shows 17.0
    expect(ffmiCategory(20.04, "male")).toBe("typical"); // shows 20.0
    expect(ffmiCategory(20.06, "male")).toBe("higher"); // shows 20.1
  });

  it("draws bands whose lower-inclusive edges agree with the category", () => {
    const bands = ffmiBands("male");
    expect(bands.map((b) => [b.label, b.range])).toEqual([
      ["Lower", "< 17.0"],
      ["Typical", "17.0–20.0"],
      ["Higher", "> 20.0"],
    ]);
    expect(ffmiBands("female").map((b) => b.range)).toEqual(["< 14.0", "14.0–17.0", "> 17.0"]);
    // The scale's test (from ≤ v < to) on one-decimal values gives the same band as ffmiCategory.
    for (const sex of ["male", "female"] as const)
      for (let v = 10; v <= 25; v = roundFfmi(v + 0.1)) {
        const band = ffmiBands(sex).find((b) => (b.from === null || v >= b.from) && (b.to === null || v < b.to))!;
        expect(band.category).toBe(ffmiCategory(v, sex));
      }
  });
});
