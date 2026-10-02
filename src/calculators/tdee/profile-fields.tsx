"use client";

import { ACTIVITY_LEVELS, PROFILE_LIMITS, activityLevel, type Activity, type Sex } from "@/lib/calc/tdee";
import { Choices, Select } from "@/vector/form";
import { NumberField, type Measure } from "../shared/fields";

// The Mifflin-St Jeor inputs that are not a mass or a length, shared by the TDEE and macro calculators.

const SEXES: readonly { value: Sex | ""; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

/** Female / Male: which form of the equation applies. Starts unselected; the result waits for a choice. */
export function SexChoice({ value, onChange }: { value: Sex | ""; onChange: (sex: Sex) => void }) {
  return (
    <Choices
      label="Sex"
      values={SEXES}
      value={value}
      onChange={(v) => {
        if (v) onChange(v);
      }}
    />
  );
}

/** Age in whole years, 18 to 100, as Vector Macros accepts it. */
export function AgeField({ value, onChange }: { value: Measure; onChange: (m: Measure) => void }) {
  return (
    <NumberField
      label="Age"
      unit="years"
      integer
      noun="an age"
      min={PROFILE_LIMITS.age.min}
      max={PROFILE_LIMITS.age.max}
      value={value}
      onChange={onChange}
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
