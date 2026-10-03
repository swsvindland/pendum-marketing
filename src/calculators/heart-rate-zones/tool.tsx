"use client";

import { useState } from "react";
import { HR_LIMITS, estimateMaxHr, foxMaxHr, heartRateZones } from "@/lib/calc/heart-rate-zones";
import { formatNumber } from "@/lib/units";
import { Heading, Note, ReadoutRow, Value } from "@/vector";
import { Choices } from "@/vector/form/choices";
import { AgeField, EMPTY, NumberField, type Measure } from "../shared/fields";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";

type MaxSource = "estimate" | "known";

const SOURCES: readonly { value: MaxSource; label: string }[] = [
  { value: "estimate", label: "Estimate from age" },
  { value: "known", label: "I know mine" },
];

/** A whole-bpm range, joined by an en dash. */
const bpmRange = (low: number, high: number) => `${formatNumber(low)}–${formatNumber(high)}`;

export function HeartRateZonesTool() {
  const [age, setAge] = useState<Measure>(EMPTY);
  const [source, setSource] = useState<MaxSource>("estimate");
  const [measured, setMeasured] = useState<Measure>(EMPTY);
  const [resting, setResting] = useState<Measure>(EMPTY);

  const known = source === "known";
  const fromAge = age.value !== null ? estimateMaxHr(age.value) : null;
  const maxHr = known ? measured.value : fromAge;
  const set = maxHr !== null && !resting.error ? heartRateZones(maxHr, resting.value) : null;
  const reserve = set?.method === "reserve";

  return (
    <ToolLayout
      inputsEyebrow="Input / Age and heart rate"
      inputs={
        <>
          <AgeField
            min={HR_LIMITS.age.min}
            max={HR_LIMITS.age.max}
            value={age}
            onChange={setAge}
            hint={known ? "Optional with a measured maximum. Adds the age estimates for comparison." : undefined}
          />
          <Choices
            label="Maximum heart rate"
            values={SOURCES}
            value={source}
            // The measured field unmounts with "Estimate from age" and keeps its Measure: a valid entry, or an
            // invalid one's draft, is shown again (and checked again) when "I know mine" comes back.
            onChange={setSource}
          />
          {known ? (
            <NumberField
              label="Measured maximum"
              unit="bpm"
              integer
              noun="a maximum heart rate"
              min={HR_LIMITS.maxHr.min}
              max={HR_LIMITS.maxHr.max}
              value={measured}
              onChange={setMeasured}
              hint="From an exercise test, or the highest reading in a hard, all-out effort."
            />
          ) : null}
          <NumberField
            label="Resting heart rate"
            unit="bpm"
            integer
            noun="a resting heart rate"
            min={HR_LIMITS.restingHr.min}
            max={HR_LIMITS.restingHr.max}
            value={resting}
            onChange={setResting}
            hint="Optional. Taken on waking, before you get up. Switches the zones to heart rate reserve (Karvonen)."
          />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Heart rate"
          meta="Adults 18+"
          announce={
            set
              ? `Maximum heart rate ${formatNumber(set.maxHr)} bpm${known ? "" : ", estimated from age"}. Zones from ${formatNumber(set.zones[0].low)} to ${formatNumber(set.maxHr)} bpm, by ${reserve ? "heart rate reserve" : "percent of maximum"}.`
              : undefined
          }
        >
          {!set ? (
            resting.error ? (
              <EmptyResult code="Check input">Correct the resting heart rate, or leave it empty, to see your zones.</EmptyResult>
            ) : known ? (
              <EmptyResult>Enter your measured maximum heart rate to see your training zones.</EmptyResult>
            ) : (
              <EmptyResult>Enter your age to see your maximum heart rate and training zones.</EmptyResult>
            )
          ) : (
            <>
              <HeroValue
                value={formatNumber(set.maxHr)}
                unit="bpm"
                caption={known ? "Your measured maximum heart rate" : "Estimated maximum heart rate, Tanaka formula"}
              />
              {age.value !== null || set.reserve !== null ? (
                <div>
                  {known && fromAge !== null ? (
                    <ReadoutRow label="Tanaka estimate for your age">
                      <Value value={formatNumber(fromAge)} unit="bpm" size="s" />
                    </ReadoutRow>
                  ) : null}
                  {age.value !== null ? (
                    <ReadoutRow label={known ? "220 − age estimate" : "220 − age, for comparison"}>
                      <Value value={formatNumber(foxMaxHr(age.value))} unit="bpm" size="s" />
                    </ReadoutRow>
                  ) : null}
                  {set.reserve !== null ? (
                    <ReadoutRow label="Heart rate reserve">
                      <Value value={formatNumber(set.reserve)} unit="bpm" size="s" />
                    </ReadoutRow>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-separator pt-4">
                <div className="flex flex-col gap-1">
                  <Heading level={3} variant="h4">
                    Training zones
                  </Heading>
                  <Note>
                    {reserve
                      ? "Percent of your heart rate reserve, added to your resting heart rate (Karvonen)."
                      : "Percent of your maximum heart rate."}
                  </Note>
                </div>
                <ReadoutTable
                  caption={`Five training zones in beats per minute, by ${reserve ? "percent of heart rate reserve" : "percent of maximum heart rate"}`}
                  columns={["Zone", reserve ? "% of reserve" : "% of max", "Heart rate"]}
                  rows={set.zones.map((z) => [
                    <span key="zone" className="flex flex-col">
                      <span>Zone {z.zone}</span>
                      <span className="text-muted">{z.label}</span>
                    </span>,
                    <Value key="pct" value={`${z.from}–${z.to}`} unit="%" size="s" tone="secondary" />,
                    <Value key="bpm" value={bpmRange(z.low, z.high)} unit="bpm" size="s" />,
                  ])}
                />
                <Note>Each zone ends 1 bpm below where the next begins, so every reading falls in one zone.</Note>
              </div>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
