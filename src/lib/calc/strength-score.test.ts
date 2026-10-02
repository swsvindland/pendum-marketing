import { describe, expect, it } from "vitest";
import { dots, dotsBodyWeight, dotsCoefficient, roundPoints, wilks, wilksBodyWeight, wilksCoefficient } from "./strength-score";

describe("DOTS", () => {
  it("matches the points OpenPowerlifting publishes for real meet results", () => {
    // openpowerlifting.org lifter pages (Dots column), where the listed body weight is exact.
    // Men: 200 kg, 1025 kg total → 512.78; 197.5 kg, 995 kg → 499.12; 100 kg, 530.7 kg → 326.65.
    expect(roundPoints(dots("male", 200, 1025))).toBe(512.78);
    expect(roundPoints(dots("male", 197.5, 995))).toBe(499.12);
    expect(roundPoints(dots("male", 100, 530.7))).toBe(326.65);
    // Women: 83.7 kg, 627.5 kg → 578.38; 88.7 kg, 645 kg → 578.77.
    expect(roundPoints(dots("female", 83.7, 627.5))).toBe(578.38);
    expect(roundPoints(dots("female", 88.7, 645))).toBe(578.77);
  });

  it("is total × 500 / the polynomial, by hand", () => {
    // Men, 90 kg: −307.75076 + 24.0900756 × 90 − 0.1918759221 × 8100 + 0.0007391293 × 729000
    //   − 0.000001093 × 65610000 = 773.2746; 600 × 500 / 773.2746 = 387.96.
    expect(roundPoints(dots("male", 90, 600))).toBe(387.96);
    // Men, 100 kg: denominator 812.3269, multiplier 0.615516.
    expect(dotsCoefficient("male", 100)).toBeCloseTo(0.6155158, 6);
    // Women, 100 kg: multiplier 0.853346.
    expect(dotsCoefficient("female", 100)).toBeCloseTo(0.8533461, 6);
  });

  it("holds body weight to 40–210 kg (men) and 40–150 kg (women)", () => {
    expect(dotsBodyWeight("male", 250)).toBe(210);
    expect(dotsBodyWeight("male", 35)).toBe(40);
    expect(dotsBodyWeight("female", 160)).toBe(150);
    expect(dotsBodyWeight("female", 30)).toBe(40);
    expect(dots("male", 250, 600)).toBe(dots("male", 210, 600));
    expect(dots("female", 30, 300)).toBe(dots("female", 40, 300));
    expect(dots("female", 160, 300)).toBe(dots("female", 150, 300));
    expect(dots("male", 209.9, 600)).not.toBe(dots("male", 210, 600));
  });

  it("is 0 for a missing body weight or total", () => {
    expect(dots("male", 0, 600)).toBe(0);
    expect(dots("male", 90, 0)).toBe(0);
    expect(dots("female", NaN, 300)).toBe(0);
  });
});

describe("Wilks", () => {
  it("matches OpenPowerlifting's tests", () => {
    // opl-data crates/coefficients/src/wilks.rs, from the original Python implementation.
    expect(wilksCoefficient("male", 100)).toBeCloseTo(0.6085890719066511, 12);
    expect(wilksCoefficient("female", 100)).toBeCloseTo(0.8325833167368228, 12);
    expect(roundPoints(wilks("male", 100, 1000))).toBe(608.59);
    expect(roundPoints(wilks("female", 60, 500))).toBe(557.44);
  });

  it("holds body weight to OpenPowerlifting's bounds", () => {
    expect(wilksBodyWeight("male", 250)).toBe(201.9);
    expect(wilksBodyWeight("male", 30)).toBe(40);
    expect(wilksBodyWeight("female", 20)).toBe(26.51);
    expect(wilksBodyWeight("female", 200)).toBe(154.53);
    expect(wilks("male", 250, 600)).toBe(wilks("male", 201.9, 600));
  });

  it("is 0 for a missing body weight or total", () => {
    expect(wilks("male", 0, 600)).toBe(0);
    expect(wilks("female", 60, -5)).toBe(0);
  });
});

describe("roundPoints", () => {
  it("rounds to two decimals", () => {
    expect(roundPoints(608.5890719)).toBe(608.59);
    expect(roundPoints(557.4434376)).toBe(557.44);
    expect(roundPoints(387.954)).toBe(387.95);
  });
});
