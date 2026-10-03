import { describe, expect, it } from "vitest";
import {
  belowEssentialFat,
  bodyFatBands,
  bodyFatCategory,
  fatMass,
  leanMass,
  navyBodyFat,
  navyCircumference,
  navyEquation,
  roundBodyFat,
} from "./body-fat";

const IN = 2.54;

describe("navyBodyFat, male", () => {
  it("matches Vector Body's test vector", () => {
    // body-track tests/core.test.cjs: neck 40, abdomen 90, height 180 cm gives between 18 and 19.
    const v = navyBodyFat("male", { heightCm: 180, neckCm: 40, abdomenCm: 90 })!;
    expect(v).toBeGreaterThan(18);
    expect(v).toBeLessThan(19);
    expect(v).toBeCloseTo(18.462, 3);
  });

  it("matches a hand calculation in inches", () => {
    // Neck 15 in, abdomen 34 in, height 70 in (the OmegaFyt server test case):
    // 86.010 × log10(19) − 70.041 × log10(70) + 36.76
    // = 86.010 × 1.278754 − 70.041 × 1.845098 + 36.76 = 109.985 − 129.232 + 36.76 = 17.513
    const v = navyBodyFat("male", { heightCm: 70 * IN, neckCm: 15 * IN, abdomenCm: 34 * IN })!;
    expect(v).toBeCloseTo(17.513, 3);
  });

  it("ignores waist and hips", () => {
    const a = navyBodyFat("male", { heightCm: 180, neckCm: 40, abdomenCm: 90 });
    const b = navyBodyFat("male", { heightCm: 180, neckCm: 40, abdomenCm: 90, waistCm: 70, hipsCm: 120 });
    expect(b).toBe(a);
  });
});

describe("navyBodyFat, female", () => {
  it("matches Vector Body's test vector exactly", () => {
    // body-track tests/core.test.cjs: neck 33, waist 75, hips 100, height 165 cm.
    expect(navyBodyFat("female", { heightCm: 165, neckCm: 33, waistCm: 75, hipsCm: 100 })).toBe(29.739407691790603);
  });

  it("matches a hand calculation in inches", () => {
    // Neck 13 in, waist 30 in, hips 40 in, height 65 in:
    // 163.205 × log10(57) − 97.684 × log10(65) − 78.387
    // = 163.205 × 1.755875 − 97.684 × 1.812913 − 78.387 = 286.568 − 177.093 − 78.387 = 31.088
    const v = navyBodyFat("female", { heightCm: 65 * IN, neckCm: 13 * IN, waistCm: 30 * IN, hipsCm: 40 * IN })!;
    expect(v).toBeCloseTo(31.088, 3);
  });

  it("ignores the abdomen", () => {
    const m = { heightCm: 165, neckCm: 33, waistCm: 75, hipsCm: 100 };
    expect(navyBodyFat("female", { ...m, abdomenCm: 120 })).toBe(navyBodyFat("female", m));
  });
});

describe("navyBodyFat, no estimate", () => {
  it("needs a positive circumference term", () => {
    // body-track: neck 40, abdomen 30 gives null.
    expect(navyBodyFat("male", { heightCm: 180, neckCm: 40, abdomenCm: 30 })).toBeNull();
    expect(navyBodyFat("male", { heightCm: 180, neckCm: 40, abdomenCm: 40 })).toBeNull();
    expect(navyBodyFat("female", { heightCm: 165, neckCm: 40, waistCm: 20, hipsCm: 20 })).toBeNull();
    expect(navyCircumference("male", { heightCm: 180, neckCm: 40, abdomenCm: 30 })).toBe(-10);
    expect(navyCircumference("female", { heightCm: 165, neckCm: 33, waistCm: 75, hipsCm: 100 })).toBe(142);
  });

  it("needs every measurement its equation uses", () => {
    expect(navyBodyFat("male", { heightCm: 180, neckCm: 40 })).toBeNull();
    expect(navyBodyFat("female", { heightCm: 165, neckCm: 33, waistCm: 75 })).toBeNull();
    expect(navyBodyFat("male", { heightCm: 0, neckCm: 40, abdomenCm: 90 })).toBeNull();
    expect(navyBodyFat("male", { heightCm: 180, neckCm: 0, abdomenCm: 90 })).toBeNull();
    expect(navyBodyFat("male", { heightCm: NaN, neckCm: 40, abdomenCm: 90 })).toBeNull();
  });

  it("keeps only results inside the open interval 0 to 75", () => {
    // Neck 40, abdomen 65, height 180 cm: the equation gives about −7.4.
    expect(navyEquation("male", 25, 180)).toBeCloseTo(-7.4295, 4);
    expect(navyBodyFat("male", { heightCm: 180, neckCm: 40, abdomenCm: 65 })).toBeNull();
    // Waist 150, hips 160, neck 35, height 165 cm: about 76.6.
    expect(navyEquation("female", 275, 165)).toBeCloseTo(76.586, 3);
    expect(navyBodyFat("female", { heightCm: 165, neckCm: 35, waistCm: 150, hipsCm: 160 })).toBeNull();
  });
});

describe("bodyFatCategory", () => {
  it("uses Vector Body's ACE edges for men, lower edges inclusive", () => {
    expect(bodyFatCategory(5.9, "male")).toBe("veryLow");
    expect(bodyFatCategory(6, "male")).toBe("lean");
    expect(bodyFatCategory(13.9, "male")).toBe("lean");
    expect(bodyFatCategory(14, "male")).toBe("typical");
    expect(bodyFatCategory(24.9, "male")).toBe("typical");
    // body-track: metricContext('bodyFat', 25, 'male') is fatHigh.
    expect(bodyFatCategory(25, "male")).toBe("elevated");
  });

  it("uses Vector Body's ACE edges for women", () => {
    expect(bodyFatCategory(13.9, "female")).toBe("veryLow");
    expect(bodyFatCategory(14, "female")).toBe("lean");
    expect(bodyFatCategory(21, "female")).toBe("typical");
    // body-track: metricContext('bodyFat', 25, 'female') is fatTypical.
    expect(bodyFatCategory(25, "female")).toBe("typical");
    expect(bodyFatCategory(31.9, "female")).toBe("typical");
    expect(bodyFatCategory(32, "female")).toBe("elevated");
  });

  it("judges the one-decimal value", () => {
    expect(roundBodyFat(18.46207892229652)).toBe(18.5);
    expect(bodyFatCategory(13.94, "male")).toBe("lean");
    expect(bodyFatCategory(13.95, "male")).toBe("typical"); // shows 14.0
  });

  it("names every band with its one-decimal range, in order", () => {
    expect(bodyFatBands("male").map((b) => [b.label, b.range])).toEqual([
      ["Very low", "< 6.0"],
      ["Lean", "6.0–13.9"],
      ["Typical", "14.0–24.9"],
      ["Elevated", "≥ 25.0"],
    ]);
    expect(bodyFatBands("female").map((b) => b.range)).toEqual(["< 14.0", "14.0–20.9", "21.0–31.9", "≥ 32.0"]);
    // Each band's edges agree with the category function.
    for (const eq of ["male", "female"] as const)
      for (const b of bodyFatBands(eq)) if (b.from !== null) expect(bodyFatCategory(b.from, eq)).toBe(b.category);
  });
});

describe("belowEssentialFat", () => {
  it("is the part of the very-low band under ACE's essential fat range (men 2–5 %, women 10–13 %)", () => {
    expect(belowEssentialFat(1.9, "male")).toBe(true);
    expect(belowEssentialFat(1.95, "male")).toBe(false); // shows 2.0
    expect(belowEssentialFat(5.9, "male")).toBe(false);
    expect(belowEssentialFat(9.9, "female")).toBe(true);
    expect(belowEssentialFat(10, "female")).toBe(false);
    expect(belowEssentialFat(13.9, "female")).toBe(false);
  });

  it("covers results the equation can give inside the tool's input ranges", () => {
    // Female, height 180, neck 40, waist 60, hips 80 cm: 1.19 %, very low and below essential fat.
    const v = navyBodyFat("female", { heightCm: 180, neckCm: 40, waistCm: 60, hipsCm: 80 })!;
    expect(v).toBeCloseTo(1.194, 3);
    expect(bodyFatCategory(v, "female")).toBe("veryLow");
    expect(belowEssentialFat(v, "female")).toBe(true);
  });
});

describe("fat and lean mass", () => {
  it("splits body weight by the percentage", () => {
    expect(fatMass(80, 20)).toBe(16);
    expect(leanMass(80, 20)).toBe(64);
    expect(fatMass(72.5, 18.4) + leanMass(72.5, 18.4)).toBeCloseTo(72.5, 10);
  });
});
