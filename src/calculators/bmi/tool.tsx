"use client";

import { useState } from "react";
import { BMI_BANDS, bmi, bmiCategory, changeToHealthy, healthyWeightRange, roundBmi } from "@/lib/calc/bmi";
import { formatNumber, formatSigned } from "@/lib/units";
import { ReadoutRow, Value } from "@/vector";
import { EMPTY, HeightField, MassField, UnitChoice, type Measure } from "../shared/fields";
import { quantityScale } from "../shared/measure";
import { BandScale, EmptyResult, HeroValue, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

export function BmiTool() {
  const [units, setUnits] = useUnits();
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);

  const ready = height.value !== null && weight.value !== null;
  const value = ready ? bmi(weight.value!, height.value!) : null;
  const band = value !== null ? BMI_BANDS.find((b) => b.category === bmiCategory(value))! : null;
  // The range and the change are worked out in the shown unit, so both agree with the category at one decimal.
  const mass = quantityScale("mass", units);
  const range = ready ? healthyWeightRange(height.value!, mass) : null;
  const change = ready ? changeToHealthy(weight.value!, height.value!, mass) : 0;

  return (
    <ToolLayout
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <HeightField units={units} value={height} onChange={setHeight} min={100} max={250} />
          <MassField label="Weight" units={units} value={weight} onChange={setWeight} min={25} max={350} />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / BMI"
          meta="Adults 20+"
          announce={value !== null && band ? `BMI ${formatNumber(roundBmi(value), 1)}, ${band.label.toLowerCase()}.` : undefined}
        >
          {value === null || !band || !range ? (
            <EmptyResult>Enter your height and weight to see your BMI.</EmptyResult>
          ) : (
            <>
              <HeroValue value={formatNumber(roundBmi(value), 1)} unit="kg/m²" caption={band.label} />
              <BandScale bands={BMI_BANDS} value={roundBmi(value)} min={14} max={40} label="BMI categories" />
              <div>
                <ReadoutRow label="Healthy weight for your height">
                  <Value value={`${formatNumber(range.min, 1)}–${formatNumber(range.max, 1)}`} unit={mass.unit} size="s" />
                </ReadoutRow>
                <ReadoutRow label={change === 0 ? "Change to reach that range" : change > 0 ? "To gain to reach it" : "To lose to reach it"}>
                  <Value value={change === 0 ? "0" : formatSigned(change, 1)} unit={mass.unit} size="s" />
                </ReadoutRow>
              </div>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
