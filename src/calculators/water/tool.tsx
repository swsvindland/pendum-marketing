"use client";

import { useState } from "react";
import {
  CUP_FL_OZ,
  DRINKS_ML_PER_KG,
  GLASS_ML,
  WATER_LIMITS,
  WATER_REFERENCES,
  waterEstimate,
  waterReadout,
  type ReferenceBody,
} from "@/lib/calc/water";
import { formatNumber, formatSigned } from "@/lib/units";
import { Heading, Note, ReadoutRow, Value } from "@/vector";
import { Choices } from "@/vector/form/choices";
import { EMPTY, MassField, NumberField, SexChoice, type Measure, type Sex } from "../shared/fields";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits, type UnitSystem } from "../shared/use-units";

type Climate = "temperate" | "hot";

const CLIMATES: readonly { value: Climate; label: string }[] = [
  { value: "temperate", label: "Temperate" },
  { value: "hot", label: "Hot" },
];

/** Table order: NASEM, the higher reference, then EFSA. */
const REFERENCE_KEYS: readonly ReferenceBody[] = ["nasem", "efsa"];
const PEOPLE: Record<Sex, string> = { female: "women", male: "men" };

/**
 * Metric / US: the shared unit choice, named as Vector Hydration names it. Fluid ounces here are US fluid ounces
 * (29.57 mL), not imperial ones (28.41 mL), so "US" is the accurate word.
 */
function WaterUnitChoice({ units, onChange }: { units: UnitSystem; onChange: (u: UnitSystem) => void }) {
  return (
    <Choices
      label="Units"
      value={units}
      onChange={onChange}
      values={[
        { value: "metric", label: "Metric" },
        { value: "imperial", label: "US" },
      ]}
    />
  );
}

export function WaterTool() {
  const [units, setUnits] = useUnits();
  const [sex, setSex] = useState<Sex | "">("");
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [exercise, setExercise] = useState<Measure>(EMPTY);
  const [climate, setClimate] = useState<Climate>("temperate");

  const estimate =
    sex && weight.value !== null && !exercise.error
      ? waterEstimate({ sex, weightKg: weight.value, exerciseMin: exercise.value ?? 0, hot: climate === "hot" })
      : null;

  const metric = units === "metric";
  // Every number as shown, worked from the shown values, so the parts, the total and the differences agree.
  const shown = estimate && sex ? waterReadout(estimate, sex, metric ? "metric" : "us") : null;
  /** A part: mL to the nearest 10, or US fl oz to 0.1. */
  const partDigits = metric ? 0 : 1;
  const part = (n: number) => formatNumber(n, partDigits, partDigits);
  const partUnit = metric ? "mL" : "fl oz";
  /** A daily amount: liters to 0.1, or whole US fl oz. */
  const dailyDigits = metric ? 1 : 0;
  const daily = (n: number) => formatNumber(n, dailyDigits, dailyDigits);
  const dailyUnit = metric ? "L" : "fl oz";

  const bound = estimate?.bound ? WATER_REFERENCES[estimate.bound] : null;

  return (
    <ToolLayout
      inputsEyebrow="Input / Weight and day"
      inputs={
        <>
          <WaterUnitChoice units={units} onChange={setUnits} />
          <SexChoice value={sex} onChange={setSex} hint="Chooses the reference intakes that bound the estimate." />
          <MassField
            label="Body weight"
            units={units}
            value={weight}
            onChange={setWeight}
            min={WATER_LIMITS.weightKg.min}
            max={WATER_LIMITS.weightKg.max}
          />
          <NumberField
            label="Exercise a day"
            unit="min"
            integer
            noun="a daily exercise time"
            min={WATER_LIMITS.exerciseMin.min}
            max={WATER_LIMITS.exerciseMin.max}
            value={exercise}
            onChange={setExercise}
            hint="Optional. Minutes of exercise or hard physical work on a typical day."
          />
          <Choices
            label="Climate"
            values={CLIMATES}
            value={climate}
            onChange={setClimate}
            hint="Hot means much of the day in heat, outdoors or without air conditioning."
          />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Fluid"
          meta="Per day"
          announce={
            shown ? `About ${daily(shown.total)} ${metric ? "liters" : "fluid ounces"} a day from drinks, an estimate.` : undefined
          }
        >
          {!shown || !sex ? (
            exercise.error ? (
              <EmptyResult code="Check input">Correct the exercise time, or leave it empty, to see the estimate.</EmptyResult>
            ) : (
              <EmptyResult>Enter your sex and body weight to see a daily fluid estimate.</EmptyResult>
            )
          ) : (
            <>
              <HeroValue
                value={daily(shown.total)}
                unit={dailyUnit}
                caption="Fluid from drinks each day. An estimate, not a requirement."
              />
              <div>
                <ReadoutRow label="Baseline for your weight">
                  <Value value={part(shown.baseline)} unit={partUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Exercise">
                  <Value value={formatSigned(shown.exercise, partDigits)} unit={partUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Hot climate">
                  <Value value={formatSigned(shown.heat, partDigits)} unit={partUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label={metric ? `Glasses of ${formatNumber(GLASS_ML)} mL` : `Cups of ${formatNumber(CUP_FL_OZ)} fl oz`}>
                  <Value value={formatNumber(shown.servings, 1, 1)} size="s" />
                </ReadoutRow>
              </div>
              {bound && estimate?.bound && shown.note ? (
                <Note>
                  At your weight, {formatNumber(DRINKS_ML_PER_KG)} mL per kg gives {part(shown.note.perKg)} {partUnit},{" "}
                  {estimate.bound === "efsa" ? "below" : "above"} the {bound.label} figure for {PEOPLE[sex]}, so the
                  baseline is {bound.label}’s {part(shown.note.bound)} {partUnit}.
                </Note>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-separator pt-4">
                <Heading level={3} variant="h4">
                  Against the reference intakes
                </Heading>
                <ReadoutTable
                  caption={`Reference intakes for ${PEOPLE[sex]} from NASEM and EFSA: total water, the part from drinks, and how far your estimate is above or below that part`}
                  columns={[`For ${PEOPLE[sex]}`, ...REFERENCE_KEYS.map((key) => `${WATER_REFERENCES[key].label} ${WATER_REFERENCES[key].year}`)]}
                  rows={[
                    [
                      "Total water",
                      ...REFERENCE_KEYS.map((key) => (
                        <Value key={key} value={daily(shown.references[key].total)} unit={dailyUnit} size="s" tone="secondary" />
                      )),
                    ],
                    [
                      "From drinks",
                      ...REFERENCE_KEYS.map((key) => (
                        <Value key={key} value={daily(shown.references[key].drinks)} unit={dailyUnit} size="s" />
                      )),
                    ],
                    [
                      "Your estimate, above or below",
                      ...REFERENCE_KEYS.map((key) => (
                        <Value
                          key={key}
                          value={formatSigned(shown.references[key].difference, dailyDigits)}
                          unit={dailyUnit}
                          size="s"
                        />
                      )),
                    ],
                  ]}
                />
                <Note>
                  NASEM sets intakes for the US and Canada, EFSA for the European Union. Total water includes the water
                  in food. NASEM’s drink figures are its own; EFSA sets total water only, and the drink figure here is
                  80 % of it.
                </Note>
              </div>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
