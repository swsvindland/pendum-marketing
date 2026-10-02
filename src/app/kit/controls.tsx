"use client";

import { useState } from "react";
import { Choices, Field, Select } from "@/vector/form";

export function KitControls() {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("180");
  const [bad, setBad] = useState("3");
  const [activity, setActivity] = useState<"low" | "moderate" | "high">("moderate");
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
    </div>
  );
}
