"use client";

import { useState } from "react";
import { DEFAULT_ACTIVITY, PROFILE_LIMITS, restingEnergy, tdeeByActivity, type Activity } from "@/lib/calc/tdee";
import { formatNumber } from "@/lib/units";
import { ReadoutRow, Value } from "@/vector";
import {
  AgeField,
  EMPTY,
  HeightField,
  MassField,
  SexChoice,
  UnitChoice,
  type Measure,
  type Sex,
} from "../shared/fields";
import { ActivitySelect } from "../shared/activity-select";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

export function TdeeTool() {
  const [units, setUnits] = useUnits();
  const [sex, setSex] = useState<Sex | "">("");
  const [age, setAge] = useState<Measure>(EMPTY);
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [activity, setActivity] = useState<Activity>(DEFAULT_ACTIVITY);

  const profile =
    sex && age.value !== null && height.value !== null && weight.value !== null
      ? { sex, age: age.value, heightCm: height.value, weightKg: weight.value }
      : null;
  const levels = profile ? tdeeByActivity(profile) : null;
  const chosen = levels ? levels.findIndex((l) => l.activity === activity) : -1;
  const level = levels?.[chosen];
  const resting = profile ? Math.round(restingEnergy(profile)) : null;

  return (
    <ToolLayout
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <SexChoice value={sex} onChange={setSex} />
          <AgeField value={age} onChange={setAge} />
          <HeightField
            units={units}
            value={height}
            onChange={setHeight}
            min={PROFILE_LIMITS.heightCm.min}
            max={PROFILE_LIMITS.heightCm.max}
          />
          <MassField
            label="Weight"
            units={units}
            value={weight}
            onChange={setWeight}
            min={PROFILE_LIMITS.weightKg.min}
            max={PROFILE_LIMITS.weightKg.max}
          />
          <ActivitySelect value={activity} onChange={setActivity} />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Energy"
          meta="Adults 18+"
          announce={
            level && resting !== null
              ? `TDEE ${formatNumber(level.kcal)} kcal a day, ${level.label.toLowerCase()}. Resting energy ${formatNumber(resting)} kcal a day.`
              : undefined
          }
        >
          {!levels || !level || resting === null ? (
            <EmptyResult>Enter your sex, age, height and weight to see your daily energy expenditure.</EmptyResult>
          ) : (
            <>
              <HeroValue
                value={formatNumber(level.kcal)}
                unit="kcal/day"
                caption={`Estimated maintenance, ${level.label.toLowerCase()}`}
              />
              <div>
                <ReadoutRow label="Resting energy">
                  <Value value={formatNumber(resting)} unit="kcal/day" size="s" />
                </ReadoutRow>
              </div>
              <ReadoutTable
                caption="TDEE at each activity level"
                columns={["Activity", "Multiplier", "TDEE"]}
                highlight={chosen}
                highlightLabel="your level"
                rows={levels.map((l) => [
                  l.label,
                  <Value key="multiplier" value={formatNumber(l.multiplier, 3, 1)} size="s" tone="secondary" />,
                  <Value key="kcal" value={formatNumber(l.kcal)} unit="kcal" size="s" />,
                ])}
              />
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
