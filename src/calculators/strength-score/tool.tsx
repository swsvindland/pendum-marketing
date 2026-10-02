"use client";

import { useState } from "react";
import { DOTS, STRENGTH_LIMITS, WILKS, dots, roundPoints, wilks, type Sex } from "@/lib/calc/strength-score";
import { formatNumber, kgToLb } from "@/lib/units";
import { Note, ReadoutRow, Value } from "@/vector";
import { Choices } from "@/vector/form";
import { EMPTY, MassField, UnitChoice, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/frame";
import { EmptyResult, HeroValue, ResultPanel } from "../shared/results";
import { useUnits } from "../shared/use-units";

type Entry = "total" | "lifts";

const SEXES: readonly { value: Sex | ""; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const ENTRIES: readonly { value: Entry; label: string }[] = [
  { value: "total", label: "Total" },
  { value: "lifts", label: "Three lifts" },
];

const COEFFICIENTS: Record<Sex, string> = { male: "Men’s coefficients", female: "Women’s coefficients" };

/** Points to two decimals, as OpenPowerlifting shows them. */
const points = (n: number) => formatNumber(roundPoints(n), 2);

/** A weight to one decimal at most: "612.5", "1,200". */
const weight = (n: number) => formatNumber(n, 1, 0);

export function StrengthScoreTool() {
  const [units, setUnits] = useUnits();
  const [sex, setSex] = useState<Sex | "">("");
  const [bodyWeight, setBodyWeight] = useState<Measure>(EMPTY);
  const [entry, setEntry] = useState<Entry>("total");
  const [total, setTotal] = useState<Measure>(EMPTY);
  const [squat, setSquat] = useState<Measure>(EMPTY);
  const [bench, setBench] = useState<Measure>(EMPTY);
  const [deadlift, setDeadlift] = useState<Measure>(EMPTY);

  // Each way of entering keeps its own values, so switching back and forth loses nothing.
  const totalKg =
    entry === "total"
      ? total.value
      : squat.value !== null && bench.value !== null && deadlift.value !== null
        ? squat.value + bench.value + deadlift.value
        : null;
  const ready = sex !== "" && bodyWeight.value !== null && totalKg !== null;
  const dotsPoints = ready ? dots(sex, bodyWeight.value!, totalKg!) : null;
  const wilksPoints = ready ? wilks(sex, bodyWeight.value!, totalKg!) : null;
  const mass = (kg: number) => (units === "metric" ? kg : kgToLb(kg));
  const massUnit = units === "metric" ? "kg" : "lb";
  // Each formula holds body weight to its own range; say so when either one does.
  const outside =
    ready &&
    [DOTS[sex], WILKS[sex]].some(({ min, max }) => bodyWeight.value! < min || bodyWeight.value! > max);

  return (
    <ToolLayout
      inputsEyebrow="Input / Lifter"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <Choices
            label="Sex"
            values={SEXES}
            value={sex}
            onChange={(v) => {
              if (v) setSex(v);
            }}
          />
          <MassField
            label="Body weight"
            units={units}
            value={bodyWeight}
            onChange={setBodyWeight}
            min={STRENGTH_LIMITS.bodyWeight.min}
            max={STRENGTH_LIMITS.bodyWeight.max}
            hint="At weigh-in, or on the day of the lifts."
          />
          <Choices label="Lifts" values={ENTRIES} value={entry} onChange={setEntry} />
          {entry === "total" ? (
            <MassField
              label="Total"
              units={units}
              value={total}
              onChange={setTotal}
              min={STRENGTH_LIMITS.total.min}
              max={STRENGTH_LIMITS.total.max}
              hint="Best squat, bench press and deadlift added together."
            />
          ) : (
            <>
              <MassField
                label="Squat"
                units={units}
                value={squat}
                onChange={setSquat}
                min={STRENGTH_LIMITS.squat.min}
                max={STRENGTH_LIMITS.squat.max}
              />
              <MassField
                label="Bench press"
                units={units}
                value={bench}
                onChange={setBench}
                min={STRENGTH_LIMITS.bench.min}
                max={STRENGTH_LIMITS.bench.max}
              />
              <MassField
                label="Deadlift"
                units={units}
                value={deadlift}
                onChange={setDeadlift}
                min={STRENGTH_LIMITS.deadlift.min}
                max={STRENGTH_LIMITS.deadlift.max}
              />
            </>
          )}
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / DOTS"
          meta={sex ? COEFFICIENTS[sex] : undefined}
          announce={
            dotsPoints !== null && wilksPoints !== null && totalKg !== null
              ? `DOTS ${points(dotsPoints)}, Wilks ${points(wilksPoints)}, for a ${weight(mass(totalKg))} ${massUnit} total.`
              : undefined
          }
        >
          {dotsPoints === null || wilksPoints === null || totalKg === null ? (
            <EmptyResult>
              {`${sex ? "Enter" : "Choose a sex, then enter"} your body weight and ${entry === "total" ? "total" : "your three lifts"} to see your DOTS and Wilks scores.`}
            </EmptyResult>
          ) : (
            <>
              <HeroValue value={points(dotsPoints)} caption="DOTS points" />
              <div>
                <ReadoutRow label="Wilks (original)">
                  <Value value={points(wilksPoints)} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Total">
                  <Value value={weight(mass(totalKg))} unit={massUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Body weight">
                  <Value value={weight(mass(bodyWeight.value!))} unit={massUnit} size="s" />
                </ReadoutRow>
              </div>
              {outside ? (
                <Note>
                  This body weight is outside the range a formula is defined for, so that formula counts it as the
                  nearest end of its range. The method gives the limits.
                </Note>
              ) : null}
              <Note>
                Both scores scale a total by body weight, so lifters of different sizes can be compared. A higher
                score is a stronger total for the body weight. They compare lifters; they are not a grade.
              </Note>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
