import { describe, expect, it } from "vitest";
import { bmi, bmiCategory, changeToHealthy, healthyWeightRange, roundBmi } from "./bmi";

describe("bmi", () => {
  it("is kg per square metre", () => {
    expect(roundBmi(bmi(70, 175))).toBe(22.9);
    expect(roundBmi(bmi(80, 180))).toBe(24.7);
    // CDC example: 5 ft 5 in, 150 lb is 25.0.
    expect(roundBmi(bmi(150 * 0.45359237, 65 * 2.54))).toBe(25);
  });

  it("puts band edges in the upper band, on the one-decimal value", () => {
    expect(bmiCategory(18.44)).toBe("underweight");
    expect(bmiCategory(18.45)).toBe("healthy"); // shows 18.5
    expect(bmiCategory(18.5)).toBe("healthy");
    expect(bmiCategory(24.94)).toBe("healthy");
    expect(bmiCategory(24.96)).toBe("overweight"); // shows 25.0
    expect(bmiCategory(29.9)).toBe("overweight");
    expect(bmiCategory(30)).toBe("obesity");
  });

  it("gives the healthy range and the change to reach it", () => {
    const r = healthyWeightRange(180);
    expect(r.min).toBeCloseTo(59.94, 2);
    expect(r.max).toBeCloseTo(80.676, 3);
    expect(changeToHealthy(70, 180)).toBe(0);
    expect(changeToHealthy(90, 180)).toBeCloseTo(-9.324, 3);
    expect(changeToHealthy(55, 180)).toBeCloseTo(4.94, 2);
  });
});
