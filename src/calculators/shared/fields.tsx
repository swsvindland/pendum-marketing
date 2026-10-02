"use client";

import { useState } from "react";
import { cmToFtIn, cmToIn, formatNumber, ftInToCm, inToCm, kgToLb, lbToKg, parseNumber } from "@/lib/units";
import { ErrorText } from "@/vector/feedback";
import { Choices, Field } from "@/vector/form";
import type { UnitSystem } from "./use-units";

/** A measured input held in canonical units (kg, cm) with its validation message. */
export type Measure = { value: number | null; error: string | null };
export const EMPTY: Measure = { value: null, error: null };

/** Up to `digits` decimals, no grouping, no trailing zeros: what goes back into a field. */
const editable = (n: number, digits = 1) => String(Number(n.toFixed(digits)));

/** Metric / Imperial, shared across calculators. */
export function UnitChoice({ units, onChange }: { units: UnitSystem; onChange: (u: UnitSystem) => void }) {
  return (
    <Choices
      label="Units"
      size="sm"
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
  /** Canonical bounds. */
  min: number;
  max: number;
  hint?: string;
  placeholder?: { metric: string; imperial: string };
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
  kind,
}: QuantityProps & { kind: "mass" | "length" }) {
  const toDisplay = kind === "mass" ? (units === "metric" ? (n: number) => n : kgToLb) : units === "metric" ? (n: number) => n : cmToIn;
  const fromDisplay = kind === "mass" ? (units === "metric" ? (n: number) => n : lbToKg) : units === "metric" ? (n: number) => n : inToCm;
  const unit = kind === "mass" ? (units === "metric" ? "kg" : "lb") : units === "metric" ? "cm" : "in";
  const noun = label.toLowerCase();
  const lo = Math.ceil(toDisplay(min));
  const hi = Math.floor(toDisplay(max));
  const [text, setText] = useState(() => (value.value === null ? "" : editable(toDisplay(value.value))));
  return (
    <Field
      label={label}
      numeric
      unit={unit}
      value={text}
      hint={hint}
      placeholder={placeholder?.[units]}
      error={value.error}
      onChange={(t) => {
        setText(t);
        if (!t.trim()) return onChange(EMPTY);
        const n = parseNumber(t);
        const canonical = n === null ? null : fromDisplay(n);
        if (canonical === null || canonical < min - 1e-9 || canonical > max + 1e-9)
          return onChange({ value: null, error: `Enter a ${noun} between ${formatNumber(lo)} and ${formatNumber(hi)} ${unit}.` });
        onChange({ value: canonical, error: null });
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
  const start = value.value === null ? null : cmToFtIn(value.value, 1);
  const [ft, setFt] = useState(start ? String(start.ft) : "");
  const [inches, setInches] = useState(start ? editable(start.in) : "");
  const lo = cmToFtIn(min);
  const hi = cmToFtIn(max);
  const message = `Enter a height between ${lo.ft} ft ${lo.in} in and ${hi.ft} ft ${hi.in} in.`;
  const update = (f: string, i: string) => {
    if (!f.trim() && !i.trim()) return onChange(EMPTY);
    const fv = f.trim() ? parseNumber(f) : 0;
    const iv = i.trim() ? parseNumber(i) : 0;
    if (fv === null || iv === null || fv < 0 || iv < 0 || iv >= 12 || !Number.isInteger(fv))
      return onChange({ value: null, error: message });
    const cm = ftInToCm(fv, iv);
    if (cm < min - 1e-9 || cm > max + 1e-9) return onChange({ value: null, error: message });
    onChange({ value: cm, error: null });
  };
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
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
            update(t, inches);
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
            update(ft, t);
          }}
          placeholder="10"
        />
      </div>
      <ErrorText message={value.error} />
    </fieldset>
  );
}

/** Height: one cm field in metric, feet and inches in imperial. Canonical cm. */
export function HeightField(props: Omit<QuantityProps, "label"> & { label?: string }) {
  const p = { label: "Height", ...props };
  if (props.units === "imperial") return <HeightImperial key="imperial" {...p} />;
  return <QuantityInner key="metric" kind="length" {...p} />;
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
  integer?: boolean;
  /** Overrides the noun in the error ("an age"). */
  noun?: string;
}) {
  const [text, setText] = useState(() => (value.value === null ? "" : editable(value.value, 2)));
  const message = `Enter ${noun ?? `a ${label.toLowerCase()}`} between ${formatNumber(min)} and ${formatNumber(max)}${unit ? ` ${unit}` : ""}.`;
  return (
    <Field
      label={label}
      numeric
      inputMode={integer ? "numeric" : "decimal"}
      unit={unit}
      value={text}
      hint={hint}
      placeholder={placeholder}
      error={value.error}
      onChange={(t) => {
        setText(t);
        if (!t.trim()) return onChange(EMPTY);
        const n = parseNumber(t);
        if (n === null || n < min || n > max || (integer && !Number.isInteger(n)))
          return onChange({ value: null, error: message });
        onChange({ value: n, error: null });
      }}
    />
  );
}
