"use client";

import { useState, type ReactNode } from "react";
import { fatMass, leanMass } from "@/lib/calc/body-fat";
import { FFMI_LABEL, ffmi, ffmiBands, ffmiCategory, normalizedFfmi, roundFfmi, type Sex } from "@/lib/calc/ffmi";
import { formatNumber } from "@/lib/units";
import { ReadoutRow } from "@/vector/panel";
import { Note, Value } from "@/vector/text";
import { EMPTY, HeightField, MassField, NumberField, SexChoice, UnitChoice, type Measure } from "../shared/fields";
import { quantityScale } from "../shared/measure";
import { BandScale, CheckInput, EmptyResult, HeroValue, ResultPanel, firstInvalid } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

/** Visual domain of the reference scale, kg/m². */
const SCALE: Record<Sex, { min: number; max: number }> = {
  male: { min: 13, max: 25 },
  female: { min: 10, max: 22 },
};

const SEX: Record<Sex, string> = { male: "men", female: "women" };

/**
 * `estimateLink` is the link to the body-fat calculator, rendered by the server page (a kit LinkButton, whose glyph
 * comes from the icon table a client file must not ship).
 */
export function FfmiTool({ estimateLink }: { estimateLink?: ReactNode }) {
  const [units, setUnits] = useUnits();
  const [sex, setSex] = useState<Sex | "">("");
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [bodyFat, setBodyFat] = useState<Measure>(EMPTY);

  // The bands differ by sex, so the result waits for a choice rather than assuming one.
  const ready = sex !== "" && height.value !== null && weight.value !== null && bodyFat.value !== null;
  const value = ready ? ffmi(weight.value!, height.value!, bodyFat.value!) : null;
  const shown = value !== null ? roundFfmi(value) : null;
  const category = ready && value !== null ? ffmiCategory(value, sex) : null;
  const mass = quantityScale("mass", units);
  const invalid = firstInvalid([
    ["height", height],
    ["weight", weight],
    ["body fat", bodyFat],
  ]);

  return (
    <ToolLayout
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <SexChoice value={sex} onChange={setSex} />
          <HeightField units={units} value={height} onChange={setHeight} min={100} max={250} />
          <MassField label="Weight" units={units} value={weight} onChange={setWeight} min={25} max={350} />
          <div className="flex flex-col gap-3">
            <NumberField
              label="Body fat"
              unit="%"
              value={bodyFat}
              onChange={setBodyFat}
              min={3}
              max={60}
              noun="a body-fat percentage"
              hint="From a scan, calipers or a tape-measure estimate."
            />
            {estimateLink}
          </div>
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / FFMI"
          meta="Adults"
          announce={
            sex && shown !== null && category
              ? `FFMI ${formatNumber(shown, 1)}, ${FFMI_LABEL[category].toLowerCase()} for ${SEX[sex]}.`
              : undefined
          }
        >
          {!sex || value === null || shown === null || !category ? (
            invalid ? (
              <CheckInput field={invalid} outcome="your FFMI" />
            ) : (
              <EmptyResult>Enter your sex, height, weight and body fat to see your FFMI.</EmptyResult>
            )
          ) : (
            <>
              <HeroValue value={formatNumber(shown, 1)} unit="kg/m²" caption={`${FFMI_LABEL[category]} for ${SEX[sex]}`} />
              <BandScale
                bands={ffmiBands(sex)}
                value={shown}
                min={SCALE[sex].min}
                max={SCALE[sex].max}
                label={`FFMI comparison bands for ${SEX[sex]}, kg/m²`}
              />
              <div>
                <ReadoutRow label="Lean mass">
                  <Value
                    value={formatNumber(mass.toDisplay(leanMass(weight.value!, bodyFat.value!)), 1)}
                    unit={mass.unit}
                    size="s"
                  />
                </ReadoutRow>
                <ReadoutRow label="Fat mass">
                  <Value
                    value={formatNumber(mass.toDisplay(fatMass(weight.value!, bodyFat.value!)), 1)}
                    unit={mass.unit}
                    size="s"
                  />
                </ReadoutRow>
                <ReadoutRow label="Normalized FFMI (to 1.8 m)">
                  <Value value={formatNumber(normalizedFfmi(value, height.value!), 1)} unit="kg/m²" size="s" />
                </ReadoutRow>
              </div>
              <Note>
                The bands are simplified comparisons for adults, not clinical cutoffs or targets. Normalized FFMI
                adjusts the result to a height of 1.8 m.
              </Note>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
