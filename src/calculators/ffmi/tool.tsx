"use client";

import { useState } from "react";
import { fatMass, leanMass } from "@/lib/calc/body-fat";
import { FFMI_LABEL, ffmi, ffmiBands, ffmiCategory, normalizedFfmi, roundFfmi, type Sex } from "@/lib/calc/ffmi";
import { formatNumber, kgToLb } from "@/lib/units";
import { LinkButton, Note, ReadoutRow, Value } from "@/vector";
import { Choices } from "@/vector/form";
import { EMPTY, HeightField, MassField, NumberField, UnitChoice, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/frame";
import { BandScale, EmptyResult, HeroValue, ResultPanel } from "../shared/results";
import { useUnits } from "../shared/use-units";

/** Visual domain of the reference scale, kg/m². */
const SCALE: Record<Sex, { min: number; max: number }> = {
  male: { min: 13, max: 25 },
  female: { min: 10, max: 22 },
};

const SEX: Record<Sex, string> = { male: "men", female: "women" };

export function FfmiTool() {
  const [units, setUnits] = useUnits();
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [bodyFat, setBodyFat] = useState<Measure>(EMPTY);

  const ready = height.value !== null && weight.value !== null && bodyFat.value !== null;
  const value = ready ? ffmi(weight.value!, height.value!, bodyFat.value!) : null;
  const shown = value !== null ? roundFfmi(value) : null;
  const bands = ffmiBands(sex);
  const category = value !== null ? ffmiCategory(value, sex) : null;
  const mass = (kg: number) => (units === "metric" ? kg : kgToLb(kg));
  const massUnit = units === "metric" ? "kg" : "lb";

  return (
    <ToolLayout
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <Choices
            label="Sex"
            value={sex}
            onChange={setSex}
            values={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
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
            <LinkButton href="/calculators/body-fat" forward className="self-start">
              Estimate body fat
            </LinkButton>
          </div>
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / FFMI"
          meta="Adults"
          announce={
            shown !== null && category
              ? `FFMI ${formatNumber(shown, 1)}, ${FFMI_LABEL[category].toLowerCase()} for ${SEX[sex]}.`
              : undefined
          }
        >
          {value === null || shown === null || !category ? (
            <EmptyResult>Enter your height, weight and body fat to see your FFMI.</EmptyResult>
          ) : (
            <>
              <HeroValue value={formatNumber(shown, 1)} unit="kg/m²" caption={`${FFMI_LABEL[category]} for ${SEX[sex]}`} />
              <BandScale
                bands={bands}
                value={shown}
                min={SCALE[sex].min}
                max={SCALE[sex].max}
                label={`FFMI comparison bands for ${SEX[sex]}, kg/m²`}
              />
              <div>
                <ReadoutRow label="Lean mass">
                  <Value value={formatNumber(mass(leanMass(weight.value!, bodyFat.value!)), 1)} unit={massUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Fat mass">
                  <Value value={formatNumber(mass(fatMass(weight.value!, bodyFat.value!)), 1)} unit={massUnit} size="s" />
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
