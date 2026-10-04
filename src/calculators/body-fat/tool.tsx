"use client";

import { useState } from "react";
import {
  ACE_ESSENTIAL,
  belowEssentialFat,
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
import { formatNumber } from "@/lib/units";
import { ReadoutRow } from "@/vector/panel";
import { Note, Value } from "@/vector/text";
import { EMPTY, HeightField, LengthField, MassField, SexChoice, UnitChoice, type Measure } from "../shared/fields";
import { quantityScale } from "../shared/measure";
import { BandScale, CheckInput, EmptyResult, HeroValue, ResultPanel, firstInvalid } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

/** Visual domain of the reference scale, % body fat. */
const SCALE: Record<NavyEquation, { min: number; max: number }> = {
  male: { min: 2, max: 40 },
  female: { min: 10, max: 50 },
};

const SEX: Record<NavyEquation, string> = { male: "men", female: "women" };

/** The caption under the result. The very-low band holds ACE's essential fat range and any result below it. */
const CAPTION: Record<BodyFatCategory | "belowEssential", string> = {
  belowEssential: "Very low body fat, below the essential fat range",
  veryLow: "Very low body fat, in the essential fat range",
  lean: "Lean body fat, in the athlete range",
  typical: "Typical body fat",
  elevated: "Elevated body fat",
};

export function BodyFatTool() {
  const [units, setUnits] = useUnits();
  const [equation, setEquation] = useState<NavyEquation | "">("");
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [neck, setNeck] = useState<Measure>(EMPTY);
  const [abdomen, setAbdomen] = useState<Measure>(EMPTY);
  const [waist, setWaist] = useState<Measure>(EMPTY);
  const [hips, setHips] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);

  const male = equation === "male";
  // No equation is assumed: the result, and the measurements that differ by equation, wait for a choice.
  const ready =
    equation !== "" &&
    height.value !== null &&
    neck.value !== null &&
    (male ? abdomen.value !== null : waist.value !== null && hips.value !== null);
  const measurements = {
    heightCm: height.value ?? NaN,
    neckCm: neck.value ?? NaN,
    abdomenCm: abdomen.value ?? undefined,
    waistCm: waist.value ?? undefined,
    hipsCm: hips.value ?? undefined,
  };
  const value = ready ? navyBodyFat(equation, measurements) : null;
  const shown = value !== null ? roundBodyFat(value) : null;
  const category = ready && value !== null ? bodyFatCategory(value, equation) : null;
  const band = ready && category ? bodyFatBands(equation).find((b) => b.category === category)! : null;
  const below = ready && value !== null && belowEssentialFat(value, equation);
  const mass = quantityScale("mass", units);
  // The measurements the chosen equation needs, in form order. Weight is optional and never blocks the estimate.
  const invalid = firstInvalid([
    ["height", height],
    ["neck", neck],
    ["abdomen", male ? abdomen : EMPTY],
    ["waist", equation === "female" ? waist : EMPTY],
    ["hips", equation === "female" ? hips : EMPTY],
  ]);

  // Why a complete set of measurements gives no estimate: the circumference term is not positive, or the result
  // falls outside 0 to 75%.
  const noEstimate =
    ready && value === null
      ? navyCircumference(equation, measurements) > 0
        ? "The equation gives a value outside 0 to 75% for these measurements, so there is no estimate. Check where the tape sits and that each measurement is in the right unit."
        : male
          ? "The abdomen must measure more than the neck, so these measurements give no estimate. Check where the tape sits."
          : "Waist and hips together must measure more than the neck, so these measurements give no estimate. Check where the tape sits."
      : null;

  return (
    <ToolLayout
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <SexChoice label="Equation" value={equation} onChange={setEquation} />
          <HeightField units={units} value={height} onChange={setHeight} min={100} max={250} />
          <LengthField
            label="Neck"
            noun="a neck measurement"
            units={units}
            value={neck}
            onChange={setNeck}
            min={20}
            max={80}
            hint="Just below the larynx (Adam’s apple)."
          />
          {equation === "male" ? (
            <LengthField
              label="Abdomen"
              noun="an abdomen measurement"
              units={units}
              value={abdomen}
              onChange={setAbdomen}
              min={40}
              max={200}
              hint="Around the abdomen at the navel, at the end of a relaxed breath out."
            />
          ) : equation === "female" ? (
            <>
              <LengthField
                label="Waist"
                noun="a waist measurement"
                units={units}
                value={waist}
                onChange={setWaist}
                min={40}
                max={200}
                hint="At the natural waist, the narrowest point of the abdomen."
              />
              <LengthField
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
          ) : null}
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
          meta={equation ? (male ? "Male equation" : "Female equation") : undefined}
          announce={
            equation && shown !== null && band
              ? `Body fat ${formatNumber(shown, 1)}%, ${band.label.toLowerCase()} for ${SEX[equation]}.`
              : (noEstimate ?? undefined)
          }
          hasResult={shown !== null}
        >
          {noEstimate ? (
            <EmptyResult code="No estimate">{noEstimate}</EmptyResult>
          ) : !equation || shown === null || !band || !category ? (
            invalid ? (
              <CheckInput field={invalid} outcome="your body-fat estimate" />
            ) : (
              <EmptyResult>
                {equation === "male"
                  ? "Enter your height, neck and abdomen to see your body-fat estimate."
                  : equation === "female"
                    ? "Enter your height, neck, waist and hips to see your body-fat estimate."
                    : "Choose the male or female equation and enter your measurements to see your body-fat estimate."}
              </EmptyResult>
            )
          ) : (
            <>
              <HeroValue
                value={formatNumber(shown, 1)}
                unit="%"
                caption={`${CAPTION[below ? "belowEssential" : category]}, on the ACE scale for ${SEX[equation]}`}
              />
              <BandScale
                bands={bodyFatBands(equation)}
                value={shown}
                min={SCALE[equation].min}
                max={SCALE[equation].max}
                label={`ACE body-fat categories for ${SEX[equation]}, %`}
              />
              {below ? (
                <Note>
                  ACE’s essential fat range for {SEX[equation]} is {ACE_ESSENTIAL[equation][0]} to{" "}
                  {ACE_ESSENTIAL[equation][1]}%. Check where the tape sits and that each measurement is in the right unit.
                </Note>
              ) : null}
              {weight.value !== null ? (
                <div>
                  <ReadoutRow label="Fat mass">
                    <Value value={formatNumber(mass.toDisplay(fatMass(weight.value, value!)), 1)} unit={mass.unit} size="s" />
                  </ReadoutRow>
                  <ReadoutRow label="Lean mass">
                    <Value value={formatNumber(mass.toDisplay(leanMass(weight.value, value!)), 1)} unit={mass.unit} size="s" />
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
