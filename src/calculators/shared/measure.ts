// Validation for the calculator fields: pure, no DOM, unit-tested in measure.test.ts. The fields in fields.tsx keep
// the text; these turn it into a Measure in canonical units (kg, cm) with the error the field shows.

import { cmToIn, formatNumber, inToCm, kgToLb, lbToKg, parseNumber } from "@/lib/units";
import type { UnitSystem } from "./use-units";

/** What was typed into a field that is not a valid value yet, and the unit system it was typed in. */
export type Draft = {
  /** null for a field whose unit does not change with the unit system (age, reps, %). */
  units: UnitSystem | null;
  text: string;
  /** The inches of an imperial height; `text` holds the feet. */
  inches?: string;
};

/**
 * A measured input held in canonical units (kg, cm) with its validation message. An invalid entry also keeps its
 * `draft`, so a field that remounts (a unit switch, a field shown again) restores the text and validates it again
 * instead of showing an old error under an empty field.
 */
export type Measure = { value: number | null; error: string | null; draft?: Draft };
export const EMPTY: Measure = { value: null, error: null };

/** True when two measures say the same thing to the result: both valid, or the same error. */
export const settled = (a: Measure, b: Measure) => (a.value === null) === (b.value === null) && a.error === b.error;

export type QuantityKind = "mass" | "length";

type Scale = { unit: string; toDisplay: (n: number) => number; fromDisplay: (n: number) => number };
const same = (n: number) => n;
const SCALES: Record<QuantityKind, Record<UnitSystem, Scale>> = {
  mass: {
    metric: { unit: "kg", toDisplay: same, fromDisplay: same },
    imperial: { unit: "lb", toDisplay: kgToLb, fromDisplay: lbToKg },
  },
  length: {
    metric: { unit: "cm", toDisplay: same, fromDisplay: same },
    imperial: { unit: "in", toDisplay: cmToIn, fromDisplay: inToCm },
  },
};

export const quantityScale = (kind: QuantityKind, units: UnitSystem) => SCALES[kind][units];

// Conversions land a hair off whole numbers (lbToKg(1) back to lb); this keeps an exact bound exact.
const EPS = 1e-9;

/**
 * The accepted range in display units, rounded inward to whole numbers: every number the error names is accepted,
 * and nothing outside it is. 35–350 kg reads 78–771 lb; a 1 lb minimum reads 1 kg in metric.
 */
export function displayBounds(kind: QuantityKind, units: UnitSystem, min: number, max: number) {
  const { unit, toDisplay } = quantityScale(kind, units);
  return { lo: Math.ceil(toDisplay(min) - EPS), hi: Math.floor(toDisplay(max) + EPS), unit };
}

/** A mass or length typed in the current units: canonical value, or the range error with the draft kept. */
export function checkQuantity(
  text: string,
  { kind, units, min, max, noun }: { kind: QuantityKind; units: UnitSystem; min: number; max: number; noun: string }
): Measure {
  if (!text.trim()) return EMPTY;
  const { lo, hi, unit } = displayBounds(kind, units, min, max);
  const n = parseNumber(text);
  if (n === null || n < lo || n > hi)
    return {
      value: null,
      error: `Enter ${noun} between ${formatNumber(lo)} and ${formatNumber(hi)} ${unit}.`,
      draft: { units, text },
    };
  return { value: quantityScale(kind, units).fromDisplay(n), error: null };
}

/** Whole inches from `min` cm up and to `max` cm down, so both ends of the message are accepted heights. */
export function heightBoundsInches(min: number, max: number) {
  return { lo: Math.ceil(cmToIn(min) - EPS), hi: Math.floor(cmToIn(max) + EPS) };
}

const feetInches = (inches: number) => `${Math.floor(inches / 12)} ft ${inches % 12} in`;

/** An imperial height as feet and inches. Feet are whole; inches are below 12 and may have a decimal. */
export function checkHeightImperial(ft: string, inches: string, min: number, max: number): Measure {
  if (!ft.trim() && !inches.trim()) return EMPTY;
  const { lo, hi } = heightBoundsInches(min, max);
  const range = `a height between ${feetInches(lo)} and ${feetInches(hi)}`;
  const invalid = (error: string): Measure => ({ value: null, error, draft: { units: "imperial", text: ft, inches } });
  const fv = ft.trim() ? parseNumber(ft) : 0;
  const iv = inches.trim() ? parseNumber(inches) : 0;
  if (fv === null || iv === null || fv < 0 || iv < 0) return invalid(`Enter ${range}.`);
  if (!Number.isInteger(fv)) return invalid(`Enter feet as a whole number, for ${range}.`);
  if (iv >= 12) return invalid(`Enter inches below 12, for ${range}.`);
  const total = fv * 12 + iv;
  if (total < lo - EPS || total > hi + EPS) return invalid(`Enter ${range}.`);
  return { value: inToCm(total), error: null };
}

/** A plain number with a fixed unit word (age, reps, %). Integer fields say "whole number" when a decimal is typed. */
export function checkNumber(
  text: string,
  { min, max, unit, integer = false, noun }: { min: number; max: number; unit?: string; integer?: boolean; noun: string }
): Measure {
  if (!text.trim()) return EMPTY;
  const range = `between ${formatNumber(min, 2, 0)} and ${formatNumber(max, 2, 0)}${unit ? ` ${unit}` : ""}`;
  const invalid = (error: string): Measure => ({ value: null, error, draft: { units: null, text } });
  const n = parseNumber(text);
  if (n === null) return invalid(`Enter ${noun} ${range}.`);
  if (integer && !Number.isInteger(n)) return invalid(`Enter ${noun} as a whole number ${range}.`);
  if (n < min || n > max) return invalid(`Enter ${noun} ${range}.`);
  return { value: n, error: null };
}
