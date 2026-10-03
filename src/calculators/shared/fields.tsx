"use client";

import { useEffect, useId, useState } from "react";
import { ACTIVITY_LEVELS, PROFILE_LIMITS, activityLevel, type Activity } from "@/lib/calc/tdee";
import { cmToFtIn } from "@/lib/units";
import { ErrorText } from "@/vector";
import { Choices } from "@/vector/form/choices";
import { Field } from "@/vector/form/field";
import { Select } from "@/vector/form/select";
import {
  checkHeightImperial,
  checkNumber,
  checkQuantity,
  quantityScale,
  settled,
  type Measure,
} from "./measure";
import type { UnitSystem } from "./use-units";

export { EMPTY, type Measure } from "./measure";

/** Up to `digits` decimals, no grouping, no trailing zeros: what goes back into a field. */
const editable = (n: number, digits = 1) => String(Number(n.toFixed(digits)));

/**
 * Keeps the parent's Measure in line with what the field shows. Typing reports through `onChange` directly; this
 * covers a remount (a unit switch, a field shown again), where the restored text is validated again in the current
 * units. The old unit's error is replaced, and a draft that is valid in the new unit reaches the result.
 */
function useSettle(shown: Measure, value: Measure, onChange: (m: Measure) => void) {
  useEffect(() => {
    if (!settled(shown, value)) onChange(shown);
  }, [shown, value, onChange]);
}

/** Metric / Imperial, shared across calculators. */
export function UnitChoice({ units, onChange }: { units: UnitSystem; onChange: (u: UnitSystem) => void }) {
  return (
    <Choices
      label="Units"
      value={units}
      onChange={onChange}
      values={[
        { value: "metric", label: "Metric" },
        { value: "imperial", label: "Imperial" },
      ]}
    />
  );
}

type QuantityProps = {
  label: string;
  units: UnitSystem;
  /** Canonical value (kg for mass, cm for length). */
  value: Measure;
  onChange: (m: Measure) => void;
  /** Canonical bounds. The error states them in the current unit, rounded inward to whole numbers. */
  min: number;
  max: number;
  hint?: string;
  placeholder?: { metric: string; imperial: string };
  /** The thing in the range error, with its article ("a neck measurement"). Defaults to "a <label>". */
  noun?: string;
};

function QuantityInner({
  label,
  units,
  value,
  onChange,
  min,
  max,
  hint,
  placeholder,
  noun,
  kind,
}: QuantityProps & { kind: "mass" | "length" | "height" }) {
  const quantity = kind === "mass" ? "mass" : "length";
  const scale = quantityScale(quantity, units);
  const check = (t: string) =>
    checkQuantity(t, { kind: quantity, units, min, max, noun: noun ?? `a ${label.toLowerCase()}` });
  const [text, setText] = useState(() => {
    if (value.value !== null) return editable(scale.toDisplay(value.value));
    const draft = value.draft;
    // A typed mass or length is kept across a unit switch and read in the new unit (400 typed in kg, meant as lb).
    // A height typed as feet and inches has no single text to carry into cm, so it starts empty.
    if (!draft || draft.inches !== undefined || (kind === "height" && draft.units !== units)) return "";
    return draft.text;
  });
  const shown = check(text);
  useSettle(shown, value, onChange);
  return (
    <Field
      label={label}
      numeric
      unit={scale.unit}
      value={text}
      hint={hint}
      placeholder={placeholder?.[units]}
      error={shown.error}
      onChange={(t) => {
        setText(t);
        onChange(check(t));
      }}
    />
  );
}

/** Body mass in kg or lb. Switching units keeps the value (the field re-derives its text). */
export function MassField(props: QuantityProps) {
  return <QuantityInner key={props.units} kind="mass" {...props} />;
}

/** A length in cm or in (circumferences, short lengths). */
export function LengthField(props: QuantityProps) {
  return <QuantityInner key={props.units} kind="length" {...props} />;
}

function HeightImperial({ value, onChange, min, max, label }: QuantityProps) {
  const errorId = useId();
  const [start] = useState(() => {
    if (value.value !== null) {
      const { ft, in: inches } = cmToFtIn(value.value, 1);
      return { ft: String(ft), inches: editable(inches) };
    }
    const draft = value.draft;
    return draft?.units === "imperial" ? { ft: draft.text, inches: draft.inches ?? "" } : { ft: "", inches: "" };
  });
  const [ft, setFt] = useState(start.ft);
  const [inches, setInches] = useState(start.inches);
  const shown = checkHeightImperial(ft, inches, min, max);
  useSettle(shown, value, onChange);
  return (
    <fieldset className="flex min-w-0 flex-col gap-2" aria-describedby={shown.error ? errorId : undefined}>
      <legend className="mb-2 type-field-label text-foreground-secondary">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Feet"
          numeric
          inputMode="numeric"
          unit="ft"
          value={ft}
          onChange={(t) => {
            setFt(t);
            onChange(checkHeightImperial(t, inches, min, max));
          }}
          placeholder="5"
        />
        <Field
          label="Inches"
          numeric
          unit="in"
          value={inches}
          onChange={(t) => {
            setInches(t);
            onChange(checkHeightImperial(ft, t, min, max));
          }}
          placeholder="10"
        />
      </div>
      <ErrorText id={errorId} message={shown.error} />
    </fieldset>
  );
}

/** Height: one cm field in metric, feet and inches in imperial. Canonical cm. */
export function HeightField(props: Omit<QuantityProps, "label"> & { label?: string }) {
  const p = { label: "Height", ...props };
  if (props.units === "imperial") return <HeightImperial key="imperial" {...p} />;
  return <QuantityInner key="metric" kind="height" {...p} />;
}

/** A plain number with its own unit word that does not change with the unit system (age, reps, %). */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  hint,
  placeholder,
  integer = false,
  noun,
}: {
  label: string;
  value: Measure;
  onChange: (m: Measure) => void;
  min: number;
  max: number;
  unit?: string;
  hint?: string;
  placeholder?: string;
  /** Whole numbers only; a decimal gets its own error ("as a whole number"). */
  integer?: boolean;
  /** Overrides the noun in the error ("an age"). */
  noun?: string;
}) {
  const check = (t: string) => checkNumber(t, { min, max, unit, integer, noun: noun ?? `a ${label.toLowerCase()}` });
  const [text, setText] = useState(() => (value.value !== null ? editable(value.value, 2) : (value.draft?.text ?? "")));
  const shown = check(text);
  useSettle(shown, value, onChange);
  return (
    <Field
      label={label}
      numeric
      inputMode={integer ? "numeric" : "decimal"}
      unit={unit}
      value={text}
      hint={hint}
      placeholder={placeholder}
      error={shown.error}
      onChange={(t) => {
        setText(t);
        onChange(check(t));
      }}
    />
  );
}

// The profile inputs that are not a mass or a length: the Mifflin-St Jeor ones (TDEE, macros), and sex and age for
// any calculator that asks for them (body fat, FFMI, water, strength score, heart rate).

export type Sex = "female" | "male";

const SEXES: readonly { value: Sex | ""; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

/**
 * Female / Male: which form of an equation, or which reference, applies. Starts unselected (""), and the result
 * waits for a choice; no calculator assumes a sex.
 */
export function SexChoice({
  value,
  onChange,
  label = "Sex",
}: {
  value: Sex | "";
  onChange: (sex: Sex) => void;
  label?: string;
}) {
  return (
    <Choices
      label={label}
      values={SEXES}
      value={value}
      onChange={(v) => {
        if (v) onChange(v);
      }}
    />
  );
}

/** Age in whole years. 18 to 100 unless the calculator gives its own range, as Vector Macros accepts it. */
export function AgeField({
  value,
  onChange,
  min = PROFILE_LIMITS.age.min,
  max = PROFILE_LIMITS.age.max,
  hint,
}: {
  value: Measure;
  onChange: (m: Measure) => void;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <NumberField
      label="Age"
      unit="years"
      integer
      noun="an age"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      hint={hint}
    />
  );
}

/** Vector Macros' four activity levels, with the chosen level described under the control. */
export function ActivitySelect({ value, onChange }: { value: Activity; onChange: (a: Activity) => void }) {
  return (
    <Select
      label="Typical activity"
      value={value}
      onChange={onChange}
      options={ACTIVITY_LEVELS}
      hint={activityLevel(value).description}
    />
  );
}
