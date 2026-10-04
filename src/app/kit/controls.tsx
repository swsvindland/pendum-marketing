"use client";

import { useState } from "react";
import { ChipRow, Choices, Field, Select } from "@/vector/form";
import { NativeChoices } from "@/vector/form/choices-native";

export function KitControls() {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [style, setStyle] = useState<"balanced" | "carbs" | "fat" | "">("");
  const [appearance, setAppearance] = useState<"system" | "light" | "dark">("system");
  const [height, setHeight] = useState("180");
  const [bad, setBad] = useState("3");
  const [activity, setActivity] = useState<"low" | "moderate" | "high">("moderate");
  const [plates, setPlates] = useState<string[]>(["25", "20", "10", "5"]);
  return (
    <div className="grid max-w-form gap-4">
      <Choices
        label="Units"
        values={[
          { value: "metric", label: "Metric" },
          { value: "imperial", label: "Imperial" },
        ]}
        value={units}
        onChange={setUnits}
      />
      <Choices
        label="Formula"
        size="sm"
        values={[
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ]}
        value={sex}
        onChange={setSex}
      />
      <Choices
        label="Macro preference (three cells, starts unselected)"
        values={[
          { value: "balanced", label: "Balanced" },
          { value: "carbs", label: "More carbs" },
          { value: "fat", label: "More fat" },
        ]}
        value={style}
        onChange={setStyle}
      />
      <NativeChoices
        label="Appearance (native radios, no HeroUI)"
        name="kit-appearance"
        values={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        value={appearance}
        onChange={setAppearance}
        hint="The footer's control: the same look on native radios."
      />
      <Field label="Height" numeric unit="cm" value={height} onChange={setHeight} hint="Without shoes." />
      <Field label="Neck" numeric unit="cm" value={bad} onChange={setBad} error="Enter a neck size between 20 and 80 cm." />
      <Select
        label="Activity"
        value={activity}
        onChange={setActivity}
        options={[
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
        ]}
      />
      <ChipRow
        label="Plates available"
        value={plates}
        onChange={setPlates}
        values={["25", "20", "15", "10", "5", "2.5", "1.25"].map((p) => ({ value: p, label: p, mono: true }))}
        hint="Any number of each is assumed."
      />
    </div>
  );
}
