import { describe, expect, it } from "vitest";
import {
  cmToFtIn,
  formatNumber,
  formatSigned,
  ftInToCm,
  kgToLb,
  lbToKg,
  parseInRange,
  parseNumber,
} from "./units";

describe("conversions", () => {
  it("uses the exact international pound and inch", () => {
    expect(lbToKg(1)).toBe(0.45359237);
    expect(kgToLb(100)).toBeCloseTo(220.462262, 5);
    expect(ftInToCm(6, 0)).toBeCloseTo(182.88, 10);
  });
  it("splits a height into feet and inches without 12-inch remainders", () => {
    expect(cmToFtIn(182.88)).toEqual({ ft: 6, in: 0 });
    expect(cmToFtIn(182.5)).toEqual({ ft: 6, in: 0 });
    expect(cmToFtIn(175)).toEqual({ ft: 5, in: 9 });
  });
});

describe("parseNumber", () => {
  it("reads decimal points, decimal commas and grouping", () => {
    expect(parseNumber("72.5")).toBe(72.5);
    expect(parseNumber("72,5")).toBe(72.5);
    expect(parseNumber(" 1,234.5 ")).toBe(1234.5);
    expect(parseNumber("1,234")).toBe(1234);
    expect(parseNumber(".5")).toBe(0.5);
    expect(parseNumber("−3")).toBe(-3);
  });
  it("returns null for empty or non-numeric input", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("  ")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("1.2.3")).toBeNull();
    expect(parseNumber("12kg")).toBeNull();
  });
});

describe("parseInRange", () => {
  it("separates not entered, valid and invalid", () => {
    expect(parseInRange("", 1, 10, "bad")).toEqual({ value: null, error: null });
    expect(parseInRange("5", 1, 10, "bad")).toEqual({ value: 5, error: null });
    expect(parseInRange("11", 1, 10, "bad")).toEqual({ value: null, error: "bad" });
    expect(parseInRange("x", 1, 10, "bad")).toEqual({ value: null, error: "bad" });
  });
});

describe("formatting", () => {
  it("groups and uses the typographic minus", () => {
    expect(formatNumber(1234.567, 1)).toBe("1,234.6");
    expect(formatNumber(-0.25, 2)).toBe("−0.25");
    expect(formatSigned(0.5, 1)).toBe("+0.5");
    expect(formatSigned(-0.31, 1)).toBe("−0.3");
    expect(formatSigned(0.01, 1)).toBe("0.0");
  });
});
