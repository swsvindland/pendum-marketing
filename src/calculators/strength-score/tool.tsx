"use client";

import { useState } from "react";
import { DOTS, STRENGTH_LIMITS, WILKS, dots, roundPoints, wilks, type Sex } from "@/lib/calc/strength-score";
import { formatNumber, kgToLb } from "@/lib/units";
import { Note, ReadoutRow, Value } from "@/vector";
import { Choices } from "@/vector/form/choices";
import { EMPTY, MassField, SexChoice, UnitChoice, type Measure } from "../shared/fields";
import { EmptyResult, HeroValue, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

type Entry = "total" | "lifts";

const ENTRIES: readonly { value: Entry; label: string }[] = [
  { value: "total", label: "Total" },
  { value: "lifts", label: "Three lifts" },
];

const COEFFICIENTS: Record<Sex, string> = { male: "Men’s coefficients", female: "Women’s coefficients" };

/** Points to two decimals, as OpenPowerlifting shows them. */
const points = (n: number) => formatNumber(roundPoints(n), 2);

/**
 * A weight to two decimals at most, as the apps show loads: "612.5", "82.55", "1,200". Meet body weights are
 * recorded to the hundredth, and the readout states the value the scores use.
 */
const weight = (n: number) => formatNumber(n, 2, 0);

/** "a", "a and b", "a, b and c". */
const joined = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

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

  // The empty result names only what is still missing or not valid yet: a sex to choose, then the weights.
  const weights: [string, Measure][] =
    entry === "total"
      ? [["total", total]]
      : [
          ["squat", squat],
          ["bench press", bench],
          ["deadlift", deadlift],
        ];
  const unentered = weights.filter(([, m]) => m.value === null).map(([name]) => name);
  const missing = [
    ...(bodyWeight.value === null ? ["body weight"] : []),
    ...(entry === "lifts" && unentered.length === 3 ? ["three lifts"] : unentered),
  ];
  const enter = `your ${joined(missing)}`;
  const waiting = sex
    ? `Enter ${enter} to see your DOTS and Wilks scores.`
    : `Choose a sex${missing.length ? `, then enter ${enter}` : ""} to see your DOTS and Wilks scores.`;

  return (
    <ToolLayout
      inputsEyebrow="Input / Lifter"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <SexChoice value={sex} onChange={setSex} />
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
            <EmptyResult>{waiting}</EmptyResult>
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
