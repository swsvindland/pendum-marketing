"use client";

import { ACTIVITY_LEVELS, activityLevel, type Activity } from "@/lib/calc/tdee";
import { Select } from "@/vector/form/select";

// Its own module: the HeroUI Select (with its ListBox and popover) loads only on the calculators that ask for an
// activity level (TDEE, macros), not on every calculator that imports the shared fields.

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
