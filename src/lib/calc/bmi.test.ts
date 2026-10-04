import { describe, expect, it } from "vitest";
import { ftInToCm, kgToLb, lbToKg } from "@/lib/units";
import { bmi, bmiCategory, changeToHealthy, healthyWeightRange, roundBmi } from "./bmi";

const LB = { toDisplay: kgToLb, fromDisplay: lbToKg };
const FIVE_NINE = ftInToCm(5, 9);

describe("bmi", () => {
  it("is kg per square metre", () => {
    expect(roundBmi(bmi(70, 175))).toBe(22.9);
    expect(roundBmi(bmi(80, 180))).toBe(24.7);
    // Pendum Body's test vector: composition(80, 180, 20).bmi.
    expect(bmi(80, 180)).toBeCloseTo(24.691358024691358, 12);
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

  it("places CDC's 5 ft 9 in table the way CDC does", () => {
    // CDC, Adult BMI categories: 124 lb or less underweight, 125 to 168 healthy weight, 169 to 202 overweight,
    // 203 or more obesity. 125 lb is BMI 18.459 and 169 lb is 24.957, so this needs the one-decimal value.
    const at = (lb: number) => bmiCategory(bmi(lbToKg(lb), FIVE_NINE));
    expect([124, 125, 168, 169, 202, 203].map(at)).toEqual([
      "underweight",
      "healthy",
      "healthy",
      "overweight",
      "overweight",
      "obesity",
    ]);
  });
});

describe("healthyWeightRange", () => {
  it("runs over the one-decimal weights whose BMI shows 18.5 to 24.9", () => {
    // 180 cm: 18.45 × 3.24 = 59.778 kg, so 59.8; 24.95 × 3.24 = 80.838 kg, so 80.8.
    expect(healthyWeightRange(180)).toEqual({ min: 59.8, max: 80.8 });
    // 5 ft 9 in in lb: CDC's 125 to 168 lb, to a tenth.
    expect(healthyWeightRange(FIVE_NINE, LB)).toEqual({ min: 125, max: 168.9 });
  });

  it("agrees with the category at both ends, a tenth inside and a tenth outside", () => {
    const heights = [100, 152.4, 165, 175.26, 180, 199.9, 250];
    for (const scale of [undefined, LB]) {
      const from = scale ? scale.fromDisplay : (n: number) => n;
      for (const h of heights) {
        const { min, max } = healthyWeightRange(h, scale);
        const at = (shown: number) => bmiCategory(bmi(from(shown), h));
        expect(at(min)).toBe("healthy");
        expect(at(max)).toBe("healthy");
        expect(at(min - 0.1)).toBe("underweight");
        expect(at(max + 0.1)).toBe("overweight");
      }
    }
  });
});

describe("changeToHealthy", () => {
  it("is 0 whenever the category is healthy weight, at the edges too", () => {
    // 125 lb at 5 ft 9 in shows 18.5 and 168.9 lb shows 24.9: both healthy weight, so nothing to gain or lose.
    expect(changeToHealthy(lbToKg(125), FIVE_NINE, LB)).toBe(0);
    expect(changeToHealthy(lbToKg(125.2), FIVE_NINE, LB)).toBe(0);
    expect(changeToHealthy(lbToKg(168.7), FIVE_NINE, LB)).toBe(0);
    expect(changeToHealthy(lbToKg(168.9), FIVE_NINE, LB)).toBe(0);
    // 180 cm: 59.9 kg shows 18.5 and 80.7 kg shows 24.9.
    expect(changeToHealthy(59.9, 180)).toBe(0);
    expect(changeToHealthy(80.7, 180)).toBe(0);
    expect(changeToHealthy(70, 180)).toBe(0);
  });

  it("runs to the nearer end of the shown range, rounded up to a tenth", () => {
    // 5 ft 9 in: 124 lb to 125.0 is +1.0; 169 lb to 168.9 is −0.1; 202 lb to 168.9 is −33.1; 203 lb is −34.1.
    expect(changeToHealthy(lbToKg(124), FIVE_NINE, LB)).toBe(1);
    expect(changeToHealthy(lbToKg(169), FIVE_NINE, LB)).toBe(-0.1);
    expect(changeToHealthy(lbToKg(202), FIVE_NINE, LB)).toBe(-33.1);
    expect(changeToHealthy(lbToKg(203), FIVE_NINE, LB)).toBe(-34.1);
    // 180 cm: 90 kg to 80.8 is −9.2; 55 kg to 59.8 is +4.8; 59.7 kg shows 18.4 and needs +0.1.
    expect(changeToHealthy(90, 180)).toBe(-9.2);
    expect(changeToHealthy(55, 180)).toBe(4.8);
    expect(changeToHealthy(59.7, 180)).toBe(0.1);
    // A weight typed to the hundredth: the change is rounded up, so it still reaches the range.
    expect(changeToHealthy(80.85, 180)).toBe(-0.1);
    expect(changeToHealthy(59.75, 180)).toBe(0.1);
  });

  it("always lands in the healthy category", () => {
    for (const h of [150, 175.26, 180, 201]) {
      for (let lb = 60; lb <= 400; lb += 0.7) {
        const change = changeToHealthy(lbToKg(lb), h, LB);
        expect(bmiCategory(bmi(lbToKg(lb + change), h))).toBe("healthy");
        if (change !== 0) expect(Math.abs(change)).toBeGreaterThanOrEqual(0.1);
      }
    }
  });
});
