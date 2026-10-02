"use client";

import { useState, type ReactNode } from "react";
import {
  CUP_FL_OZ,
  DRINKS_ML_PER_KG,
  GLASS_ML,
  WATER_LIMITS,
  WATER_REFERENCES,
  cups,
  glasses,
  waterEstimate,
  type ReferenceBody,
  type Sex,
} from "@/lib/calc/water";
import { formatNumber, formatSigned, mlToFlOz } from "@/lib/units";
import { Heading, Note, ReadoutRow, Text, Value } from "@/vector";
import { Choices } from "@/vector/form";
import { EMPTY, MassField, NumberField, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/frame";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { useUnits, type UnitSystem } from "../shared/use-units";

type Climate = "temperate" | "hot";

const SEXES: readonly { value: Sex | ""; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

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
      size="sm"
      value={units}
      onChange={onChange}
      values={[
        { value: "metric", label: "Metric" },
        { value: "imperial", label: "US" },
      ]}
    />
  );
}

/** Choices with a caption under them that says what the choice changes. */
function ChoiceWithNote({ children, note }: { children: ReactNode; note: string }) {
  return (
    <div className="flex flex-col gap-2">
      {children}
      <Text variant="caption" tone="muted">
        {note}
      </Text>
    </div>
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
  /** A volume for a row: mL to the nearest 10, or whole US fl oz. */
  const volume = (ml: number) => (metric ? formatNumber(Math.round(ml / 10) * 10) : formatNumber(Math.round(mlToFlOz(ml))));
  const added = (ml: number) => (metric ? formatSigned(Math.round(ml / 10) * 10) : formatSigned(mlToFlOz(ml)));
  const volumeUnit = metric ? "mL" : "fl oz";
  /** A daily amount: litres to one decimal, or whole US fl oz. */
  const daily = (ml: number) => (metric ? formatNumber(ml / 1000, 1, 1) : formatNumber(Math.round(mlToFlOz(ml))));
  const dailyDiff = (ml: number) => (metric ? formatSigned(ml / 1000, 1) : formatSigned(mlToFlOz(ml)));
  const dailyUnit = metric ? "L" : "fl oz";

  const bound = estimate?.bound && sex ? WATER_REFERENCES[estimate.bound] : null;

  return (
    <ToolLayout
      inputsEyebrow="Input / Weight and day"
      inputs={
        <>
          <WaterUnitChoice units={units} onChange={setUnits} />
          <ChoiceWithNote note="Chooses the reference intakes that bound the estimate.">
            <Choices
              label="Sex"
              values={SEXES}
              value={sex}
              onChange={(v) => {
                if (v) setSex(v);
              }}
            />
          </ChoiceWithNote>
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
          <ChoiceWithNote note="Hot means much of the day in heat, outdoors or without air conditioning.">
            <Choices label="Climate" values={CLIMATES} value={climate} onChange={setClimate} />
          </ChoiceWithNote>
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Fluid"
          meta="Per day"
          announce={
            estimate
              ? `About ${daily(estimate.total)} ${metric ? "liters" : "fluid ounces"} a day from drinks, an estimate.`
              : undefined
          }
        >
          {!estimate || !sex ? (
            exercise.error ? (
              <EmptyResult code="Check input">Correct the exercise time, or leave it empty, to see the estimate.</EmptyResult>
            ) : (
              <EmptyResult>Enter your sex and body weight to see a daily fluid estimate.</EmptyResult>
            )
          ) : (
            <>
              <HeroValue
                value={daily(estimate.total)}
                unit={dailyUnit}
                caption="Fluid from drinks each day. An estimate, not a requirement."
              />
              <div>
                <ReadoutRow label="Baseline for your weight">
                  <Value value={volume(estimate.ml)} unit={volumeUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Exercise">
                  <Value value={added(estimate.exercise)} unit={volumeUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Hot climate">
                  <Value value={added(estimate.heat)} unit={volumeUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label={metric ? `Glasses of ${formatNumber(GLASS_ML)} mL` : `Cups of ${formatNumber(CUP_FL_OZ)} fl oz`}>
                  <Value value={formatNumber(metric ? glasses(estimate.total) : cups(estimate.total), 1, 1)} size="s" />
                </ReadoutRow>
              </div>
              {bound && estimate.bound ? (
                <Note>
                  At your weight, {formatNumber(DRINKS_ML_PER_KG)} mL per kg gives {volume(estimate.perKg)} {volumeUnit},{" "}
                  {estimate.bound === "efsa" ? "below" : "above"} the {bound.label} figure for {PEOPLE[sex]}, so the
                  baseline is {bound.label}’s {volume(estimate.ml)} {volumeUnit}.
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
                        <Value key={key} value={daily(WATER_REFERENCES[key][sex].total)} unit={dailyUnit} size="s" tone="secondary" />
                      )),
                    ],
                    [
                      "From drinks",
                      ...REFERENCE_KEYS.map((key) => (
                        <Value key={key} value={daily(WATER_REFERENCES[key][sex].drinks)} unit={dailyUnit} size="s" />
                      )),
                    ],
                    [
                      "Your estimate, above or below",
                      ...REFERENCE_KEYS.map((key) => (
                        <Value
                          key={key}
                          value={dailyDiff(estimate.total - WATER_REFERENCES[key][sex].drinks)}
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
