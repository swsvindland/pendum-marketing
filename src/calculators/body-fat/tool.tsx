"use client";

import { useState } from "react";
import {
  bodyFatBands,
  bodyFatCategory,
  fatMass,
  leanMass,
  navyBodyFat,
  navyCircumference,
  roundBodyFat,
  type BodyFatCategory,
  type NavyEquation,
} from "@/lib/calc/body-fat";
import { formatNumber, kgToLb } from "@/lib/units";
import { Note, ReadoutRow, Value } from "@/vector";
import { Choices } from "@/vector/form";
import { EMPTY, HeightField, LengthField, MassField, UnitChoice, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/frame";
import { BandScale, EmptyResult, HeroValue, ResultPanel } from "../shared/results";
import { useUnits, type UnitSystem } from "../shared/use-units";

/** Visual domain of the reference scale, % body fat. */
const SCALE: Record<NavyEquation, { min: number; max: number }> = {
  male: { min: 2, max: 40 },
  female: { min: 10, max: 50 },
};

const SEX: Record<NavyEquation, string> = { male: "men", female: "women" };

const CAPTION: Record<BodyFatCategory, string> = {
  veryLow: "Very low body fat, in the essential fat range",
  lean: "Lean body fat, in the athlete range",
  typical: "Typical body fat",
  elevated: "Elevated body fat",
};

/** A tape measurement in cm or in, its range error worded as a measurement ("Enter a neck measurement…"). */
function TapeField(props: {
  label: string;
  /** "a neck measurement" */
  noun: string;
  units: UnitSystem;
  value: Measure;
  onChange: (m: Measure) => void;
  min: number;
  max: number;
  hint: string;
}) {
  return <LengthField {...props} />;
}

export function BodyFatTool() {
  const [units, setUnits] = useUnits();
  const [equation, setEquation] = useState<NavyEquation>("male");
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [neck, setNeck] = useState<Measure>(EMPTY);
  const [abdomen, setAbdomen] = useState<Measure>(EMPTY);
  const [waist, setWaist] = useState<Measure>(EMPTY);
  const [hips, setHips] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);

  const male = equation === "male";
  const ready =
    height.value !== null && neck.value !== null && (male ? abdomen.value !== null : waist.value !== null && hips.value !== null);
  const measurements = {
    heightCm: height.value ?? NaN,
    neckCm: neck.value ?? NaN,
    abdomenCm: abdomen.value ?? undefined,
    waistCm: waist.value ?? undefined,
    hipsCm: hips.value ?? undefined,
  };
  const value = ready ? navyBodyFat(equation, measurements) : null;
  const shown = value !== null ? roundBodyFat(value) : null;
  const category = value !== null ? bodyFatCategory(value, equation) : null;
  const bands = bodyFatBands(equation);
  const band = category ? bands.find((b) => b.category === category)! : null;
  const mass = (kg: number) => (units === "metric" ? kg : kgToLb(kg));
  const massUnit = units === "metric" ? "kg" : "lb";

  // Why a complete set of measurements gives no estimate: the circumference term is not positive, or the result
  // falls outside 0 to 75 %.
  const noEstimate =
    ready && value === null
      ? navyCircumference(equation, measurements) > 0
        ? "The equation gives a value outside 0 to 75 % for these measurements, so there is no estimate. Check where the tape sits and that each measurement is in the right unit."
        : male
          ? "The abdomen must measure more than the neck, so these measurements give no estimate. Check where the tape sits."
          : "Waist and hips together must measure more than the neck, so these measurements give no estimate. Check where the tape sits."
      : null;

  return (
    <ToolLayout
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <Choices
            label="Equation"
            value={equation}
            onChange={setEquation}
            values={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
          <HeightField units={units} value={height} onChange={setHeight} min={100} max={250} />
          <TapeField
            label="Neck"
            noun="a neck measurement"
            units={units}
            value={neck}
            onChange={setNeck}
            min={20}
            max={80}
            hint="Just below the larynx (Adam’s apple)."
          />
          {male ? (
            <TapeField
              label="Abdomen"
              noun="an abdomen measurement"
              units={units}
              value={abdomen}
              onChange={setAbdomen}
              min={40}
              max={200}
              hint="Around the abdomen at the navel, at the end of a relaxed breath out."
            />
          ) : (
            <>
              <TapeField
                label="Waist"
                noun="a waist measurement"
                units={units}
                value={waist}
                onChange={setWaist}
                min={40}
                max={200}
                hint="At the natural waist, the narrowest point of the abdomen."
              />
              <TapeField
                label="Hips"
                noun="a hip measurement"
                units={units}
                value={hips}
                onChange={setHips}
                min={50}
                max={200}
                hint="At the widest point of the buttocks, feet together."
              />
            </>
          )}
          <MassField
            label="Weight"
            units={units}
            value={weight}
            onChange={setWeight}
            min={25}
            max={350}
            hint="Optional. Adds fat mass and lean mass."
          />
          <Note>Use a flexible tape, snug on the skin without pressing in.</Note>
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Body fat"
          meta={male ? "Male equation" : "Female equation"}
          announce={
            shown !== null && band
              ? `Body fat ${formatNumber(shown, 1)} %, ${band.label.toLowerCase()} for ${SEX[equation]}.`
              : (noEstimate ?? undefined)
          }
        >
          {noEstimate ? (
            <EmptyResult code="No estimate">{noEstimate}</EmptyResult>
          ) : shown === null || !band || !category ? (
            <EmptyResult>
              {male
                ? "Enter your height, neck and abdomen to see your body-fat estimate."
                : "Enter your height, neck, waist and hips to see your body-fat estimate."}
            </EmptyResult>
          ) : (
            <>
              <HeroValue
                value={formatNumber(shown, 1)}
                unit="%"
                caption={`${CAPTION[category]}, on the ACE scale for ${SEX[equation]}`}
              />
              <BandScale
                bands={bands}
                value={shown}
                min={SCALE[equation].min}
                max={SCALE[equation].max}
                label={`ACE body-fat categories for ${SEX[equation]}, %`}
              />
              {weight.value !== null ? (
                <div>
                  <ReadoutRow label="Fat mass">
                    <Value value={formatNumber(mass(fatMass(weight.value, value!)), 1)} unit={massUnit} size="s" />
                  </ReadoutRow>
                  <ReadoutRow label="Lean mass">
                    <Value value={formatNumber(mass(leanMass(weight.value, value!)), 1)} unit={massUnit} size="s" />
                  </ReadoutRow>
                </div>
              ) : (
                <Note>Add your weight to see fat mass and lean mass.</Note>
              )}
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
