import { describe, expect, it } from "vitest";
import { cmToIn, ftInToCm, lbToKg } from "@/lib/units";
import {
  EMPTY,
  checkHeightImperial,
  checkNumber,
  checkQuantity,
  displayBounds,
  firstInvalid,
  heightBoundsInches,
  settled,
} from "./measure";

const weight = (text: string, units: "metric" | "imperial", min = 35, max = 350) =>
  checkQuantity(text, { kind: "mass", units, min, max, noun: "a weight" });

describe("checkQuantity", () => {
  it("accepts exactly the range the error states", () => {
    // 35–350 kg is 77.16–771.6 lb: the message says 78 to 771, and both ends are accepted.
    expect(displayBounds("mass", "imperial", 35, 350)).toEqual({ lo: 78, hi: 771, unit: "lb" });
    expect(weight("78", "imperial").value).toBeCloseTo(lbToKg(78), 10);
    expect(weight("771", "imperial").value).toBeCloseTo(lbToKg(771), 10);
    expect(weight("77.5", "imperial").error).toBe("Enter a weight between 78 and 771 lb.");
    expect(weight("771.5", "imperial").error).toBe("Enter a weight between 78 and 771 lb.");
  });

  it("states a fractional canonical minimum as the whole number it accepts", () => {
    // One-rep max and plates allow 1 lb; in kg the field says 1 kg and refuses 0.5 kg.
    const min = lbToKg(1);
    expect(displayBounds("mass", "metric", min, 500)).toEqual({ lo: 1, hi: 500, unit: "kg" });
    expect(displayBounds("mass", "imperial", min, 500)).toEqual({ lo: 1, hi: 1102, unit: "lb" });
    expect(weight("0.5", "metric", min, 500).error).toBe("Enter a weight between 1 and 500 kg.");
    expect(weight("1", "imperial", min, 500).value).toBeCloseTo(min, 12);
    expect(weight("1102.3", "imperial", min, 500).error).toBe("Enter a weight between 1 and 1,102 lb.");
  });

  it("rounds lb minimums up and accepts them (strength score)", () => {
    expect(displayBounds("mass", "imperial", 30, 250)).toEqual({ lo: 67, hi: 551, unit: "lb" });
    expect(weight("66.5", "imperial", 30, 250).value).toBeNull();
    expect(weight("67", "imperial", 30, 250).value).toBeCloseTo(lbToKg(67), 10);
    expect(displayBounds("mass", "imperial", 20, 1500)).toEqual({ lo: 45, hi: 3306, unit: "lb" });
  });

  it("keeps an invalid entry as a draft in the units it was typed in", () => {
    expect(weight("20", "metric")).toEqual({
      value: null,
      error: "Enter a weight between 35 and 350 kg.",
      draft: { units: "metric", text: "20" },
    });
    expect(weight("abc", "imperial").draft).toEqual({ units: "imperial", text: "abc" });
    expect(weight("  ", "metric")).toEqual(EMPTY);
  });

  it("re-reads a draft in the new unit after a switch", () => {
    // 400 typed in kg is out of range; read as lb after a switch it is a valid 181.4 kg.
    const typed = weight("400", "metric");
    expect(typed.value).toBeNull();
    const again = weight(typed.draft!.text, "imperial");
    expect(again.error).toBeNull();
    expect(again.value).toBeCloseTo(181.437, 3);
    expect(settled(again, typed)).toBe(false);
  });

  it("converts lengths in inches", () => {
    expect(displayBounds("length", "imperial", 20, 80)).toEqual({ lo: 8, hi: 31, unit: "in" });
    expect(checkQuantity("8", { kind: "length", units: "imperial", min: 20, max: 80, noun: "a neck" }).value).toBeCloseTo(
      20.32,
      10
    );
  });
});

describe("checkHeightImperial", () => {
  it("states whole-inch bounds rounded inward, and accepts both", () => {
    // 120–230 cm (TDEE, macros) is 47.24–90.55 in: 4 ft 0 in to 7 ft 6 in.
    expect(heightBoundsInches(120, 230)).toEqual({ lo: 48, hi: 90 });
    const message = "Enter a height between 4 ft 0 in and 7 ft 6 in.";
    expect(checkHeightImperial("4", "0", 120, 230).value).toBeCloseTo(ftInToCm(4, 0), 10);
    expect(checkHeightImperial("7", "6", 120, 230).value).toBeCloseTo(ftInToCm(7, 6), 10);
    expect(checkHeightImperial("3", "11", 120, 230).error).toBe(message);
    expect(checkHeightImperial("7", "7", 120, 230).error).toBe(message);
    // 100–250 cm (BMI, body fat, FFMI): 3 ft 4 in to 8 ft 2 in.
    expect(heightBoundsInches(100, 250)).toEqual({ lo: 40, hi: 98 });
    expect(checkHeightImperial("3", "3", 100, 250).error).toBe("Enter a height between 3 ft 4 in and 8 ft 2 in.");
    expect(checkHeightImperial("3", "4", 100, 250).error).toBeNull();
    expect(cmToIn(checkHeightImperial("3", "4", 100, 250).value!)).toBeCloseTo(40, 10);
  });

  it("says what is wrong with the feet or the inches", () => {
    expect(checkHeightImperial("5.5", "", 120, 230).error).toBe(
      "Enter feet as a whole number, for a height between 4 ft 0 in and 7 ft 6 in."
    );
    expect(checkHeightImperial("5", "12", 120, 230).error).toBe(
      "Enter inches below 12, for a height between 4 ft 0 in and 7 ft 6 in."
    );
    expect(checkHeightImperial("5", "10.5", 120, 230).value).toBeCloseTo(ftInToCm(5, 10.5), 10);
    expect(checkHeightImperial("6", "", 120, 230).value).toBeCloseTo(182.88, 10);
    expect(checkHeightImperial("", "", 120, 230)).toEqual(EMPTY);
    expect(checkHeightImperial("5", "13", 120, 230).draft).toEqual({ units: "imperial", text: "5", inches: "13" });
  });
});

describe("checkNumber", () => {
  const age = (text: string) => checkNumber(text, { min: 18, max: 100, unit: "years", integer: true, noun: "an age" });

  it("says whole number when an integer field gets a decimal", () => {
    expect(age("30.5").error).toBe("Enter an age as a whole number between 18 and 100 years.");
    expect(age("17").error).toBe("Enter an age between 18 and 100 years.");
    expect(age("abc").error).toBe("Enter an age between 18 and 100 years.");
    expect(age("30")).toEqual({ value: 30, error: null });
    expect(age("30.5").draft).toEqual({ units: null, text: "30.5" });
  });

  it("allows decimals when the field is not an integer field", () => {
    const pct = (t: string) => checkNumber(t, { min: 3, max: 60, unit: "%", noun: "a body-fat percentage" });
    expect(pct("12.5").value).toBe(12.5);
    expect(pct("61").error).toBe("Enter a body-fat percentage between 3 and 60%.");
  });
});

describe("firstInvalid", () => {
  const age = (text: string) => checkNumber(text, { min: 18, max: 100, unit: "years", noun: "an age" });
  const bad = age("17");
  const good = age("30");

  it("names the first field with an error, in form order", () => {
    expect(firstInvalid([
      ["age", good],
      ["height", bad],
      ["weight", bad],
    ])).toBe("height");
  });

  it("is null when every field is valid or empty", () => {
    expect(firstInvalid([
      ["age", good],
      ["height", EMPTY],
    ])).toBeNull();
    expect(firstInvalid([])).toBeNull();
  });

  it("passes over an empty field to reach an invalid one", () => {
    expect(firstInvalid([
      ["age", EMPTY],
      ["height", bad],
    ])).toBe("height");
  });
});
