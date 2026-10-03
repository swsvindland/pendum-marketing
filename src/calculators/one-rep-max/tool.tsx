"use client";

import { useState } from "react";
import {
  BRZYCKI_MAX_REPS,
  ONE_REP_MAX_LIMITS,
  REP_MAX_ROWS,
  ROUGH_BEYOND_REPS,
  brzycki,
  e1rm,
  repMaxTable,
  repsToFailure,
} from "@/lib/calc/one-rep-max";
import { formatNumber, kgToLb, lbToKg } from "@/lib/units";
import { Note, ReadoutRow, Value } from "@/vector";
import { EMPTY, MassField, NumberField, UnitChoice, type Measure } from "../shared/fields";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

// 1 lb as the floor, so the range reads "1 to 500 kg" and "1 to 1,102 lb".
const WEIGHT = { min: lbToKg(1), max: 500 };

export function OneRepMaxTool() {
  const [units, setUnits] = useUnits();
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [reps, setReps] = useState<Measure>(EMPTY);
  const [rir, setRir] = useState<Measure>(EMPTY);

  // An empty reserve field is a set to failure; a reserve with an error waits for a valid value.
  const ready = weight.value !== null && reps.value !== null && rir.error === null;
  const toFailure = ready ? repsToFailure(reps.value!, rir.value) : null;
  const estimate = ready ? e1rm(weight.value!, reps.value!, rir.value) : null;
  const comparison = ready && toFailure! <= BRZYCKI_MAX_REPS ? brzycki(weight.value!, toFailure!) : null;
  const rows = estimate !== null ? repMaxTable(estimate) : [];
  const mass = (kg: number) => (units === "metric" ? kg : kgToLb(kg));
  const massUnit = units === "metric" ? "kg" : "lb";
  // The table counts reps to failure, so the visitor's set is the row for reps + reserve (5 with 2 in reserve: 7).
  const own = toFailure !== null && toFailure <= REP_MAX_ROWS ? toFailure - 1 : undefined;
  const ownLabel =
    reps.value !== null && rir.value
      ? `your set, ${formatNumber(reps.value)} ${reps.value === 1 ? "rep" : "reps"} with ${formatNumber(rir.value)} in reserve`
      : "your set";

  return (
    <ToolLayout
      inputsEyebrow="Input / Set"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <MassField label="Weight lifted" units={units} value={weight} onChange={setWeight} min={WEIGHT.min} max={WEIGHT.max} />
          <NumberField
            label="Reps"
            integer
            noun="a whole number of reps"
            min={ONE_REP_MAX_LIMITS.reps.min}
            max={ONE_REP_MAX_LIMITS.reps.max}
            value={reps}
            onChange={setReps}
            hint="Reps completed in the set."
          />
          <NumberField
            label="Reps left in reserve"
            integer
            noun="a whole number of reps in reserve"
            min={ONE_REP_MAX_LIMITS.rir.min}
            max={ONE_REP_MAX_LIMITS.rir.max}
            value={rir}
            onChange={setRir}
            hint="Optional. How many more reps you could have done. Leave it empty for a set to failure."
          />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / One-rep max"
          meta="Epley"
          announce={
            estimate !== null && toFailure !== null
              ? `Estimated one-rep max ${formatNumber(mass(estimate), 1)} ${massUnit}, from ${toFailure} reps to failure.`
              : undefined
          }
        >
          {estimate === null || toFailure === null ? (
            <EmptyResult>Enter the weight and the reps of a hard set to see your estimated one-rep max.</EmptyResult>
          ) : (
            <>
              <HeroValue value={formatNumber(mass(estimate), 1)} unit={massUnit} caption="Estimated one-rep max (Epley)" />
              <div>
                <ReadoutRow label="Reps to failure">
                  <Value value={formatNumber(toFailure)} size="s" />
                </ReadoutRow>
                {comparison !== null ? (
                  <ReadoutRow label="Brzycki, for comparison">
                    <Value value={formatNumber(mass(comparison), 1)} unit={massUnit} size="s" tone="secondary" />
                  </ReadoutRow>
                ) : null}
              </div>
              {toFailure > ROUGH_BEYOND_REPS ? (
                <Note>
                  This many reps to failure gives a rough estimate. Epley overestimates at high reps, so a heavier set
                  of fewer reps gives a closer one.
                </Note>
              ) : comparison === null ? (
                <Note>Brzycki is left out at this many reps to failure. The method says why.</Note>
              ) : null}
              <ReadoutTable
                caption="Estimated rep maxes from 1 to 12 reps to failure"
                columns={["Reps to failure", "Load", "% of 1RM"]}
                highlight={own}
                highlightLabel={ownLabel}
                rows={rows.map((row) => [
                  <Value key="reps" value={formatNumber(row.reps)} size="s" />,
                  <Value key="load" value={formatNumber(mass(row.load), 1)} unit={massUnit} size="s" />,
                  <Value key="percent" value={formatNumber(row.fraction * 100)} unit="%" size="s" tone="secondary" />,
                ])}
              />
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
