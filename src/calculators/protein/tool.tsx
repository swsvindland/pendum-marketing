"use client";

import { useState } from "react";
import {
  LEAN_MASS_DEFICIT,
  MEAL_COUNTS,
  PER_MEAL_G_PER_KG,
  PROTEIN_GOALS,
  grams,
  leanMassView,
  perMeal,
  proteinRange,
  type ProteinGoal,
} from "@/lib/calc/protein";
import { KG_PER_LB, formatNumber, kgToLb } from "@/lib/units";
import { ReadoutRow } from "@/vector/panel";
import { Heading, Note, Value } from "@/vector/text";
import { Choices } from "@/vector/form/choices";
import { EMPTY, MassField, NumberField, UnitChoice, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/tool-layout";
import { CheckInput, EmptyResult, HeroValue, ReadoutTable, ResultPanel, firstInvalid } from "../shared/results";
import { useUnits } from "../shared/use-units";

// Typed with "" so the Choices can start with no goal selected; the result waits for one.
const GOALS: readonly { value: ProteinGoal | ""; label: string }[] = (Object.keys(PROTEIN_GOALS) as ProteinGoal[]).map(
  (value) => ({ value, label: PROTEIN_GOALS[value].label })
);

const CAPTION: Record<ProteinGoal, string> = {
  maintain: "A day, to keep the muscle you have.",
  build: "A day, to build muscle.",
  lose: "A day, to keep muscle while you lose fat.",
};

/** A range of two formatted numbers, joined by an en dash. */
const range = (min: number, max: number, digits = 0) => `${formatNumber(min, digits)}–${formatNumber(max, digits)}`;

export function ProteinTool() {
  const [units, setUnits] = useUnits();
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [goal, setGoal] = useState<ProteinGoal | "">("");
  const [bodyFat, setBodyFat] = useState<Measure>(EMPTY);

  const result = weight.value !== null && goal ? proteinRange(weight.value, goal) : null;
  const lean = weight.value !== null && bodyFat.value !== null && goal ? leanMassView(weight.value, bodyFat.value, goal) : null;
  const metric = units === "metric";
  const massUnit = metric ? "kg" : "lb";
  const rateUnit = metric ? "g/kg" : "g/lb";
  // g per kg to g per lb is × 0.45359237; per-lb rates need a second decimal to stay distinct.
  const rate = (gPerKg: number) => (metric ? gPerKg : gPerKg * KG_PER_LB);
  const rateDigits = metric ? 1 : 2;
  const mass = (kg: number) => (metric ? kg : kgToLb(kg));
  // Body fat is optional: an invalid entry hides its rows and never blocks the range.
  const invalid = firstInvalid([["body weight", weight]]);

  return (
    <ToolLayout
      inputsEyebrow="Input / Weight and goal"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <MassField label="Body weight" units={units} value={weight} onChange={setWeight} min={35} max={350} />
          <Choices
            label="Goal"
            values={GOALS}
            value={goal}
            onChange={(v) => {
              if (v) setGoal(v);
            }}
          />
          <NumberField
            label="Body fat"
            unit="%"
            value={bodyFat}
            onChange={setBodyFat}
            min={3}
            max={60}
            noun="a body-fat percentage"
            hint={`Optional. Adds your lean mass and the range per ${massUnit} of it.`}
          />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Protein"
          meta="Per day"
          announce={
            result ? `${result.min} to ${result.max} grams of protein a day, with a target of ${result.target} grams.` : undefined
          }
        >
          {!result || !goal || weight.value === null ? (
            invalid ? (
              <CheckInput field={invalid} outcome="your daily protein range" />
            ) : (
              <EmptyResult>Enter your body weight and choose a goal to see your daily protein range.</EmptyResult>
            )
          ) : (
            <>
              <HeroValue value={range(result.min, result.max)} unit="g" caption={CAPTION[goal]} />
              <div>
                <ReadoutRow label={metric ? "Per kg of body weight" : "Per lb of body weight"}>
                  <Value
                    value={range(rate(PROTEIN_GOALS[goal].min), rate(PROTEIN_GOALS[goal].max), rateDigits)}
                    unit={rateUnit}
                    size="s"
                  />
                </ReadoutRow>
                <ReadoutRow label="Daily target">
                  <Value value={formatNumber(result.target)} unit="g" size="s" />
                </ReadoutRow>
                {lean ? (
                  <>
                    <ReadoutRow label="Lean mass">
                      <Value value={formatNumber(mass(lean.leanKg), 1, 1)} unit={massUnit} size="s" />
                    </ReadoutRow>
                    <ReadoutRow label={metric ? "Per kg of lean mass" : "Per lb of lean mass"}>
                      <Value
                        value={range(rate(lean.perLeanKg.min), rate(lean.perLeanKg.max), rateDigits)}
                        unit={rateUnit}
                        size="s"
                      />
                    </ReadoutRow>
                    {lean.deficit ? (
                      <ReadoutRow label="Lean-mass range for a deficit">
                        <Value value={range(lean.deficit.min, lean.deficit.max)} unit="g" size="s" />
                      </ReadoutRow>
                    ) : null}
                  </>
                ) : null}
                <ReadoutRow label="RDA for your weight">
                  <Value value={formatNumber(result.rda)} unit="g" size="s" />
                </ReadoutRow>
                <ReadoutRow label="Your range, times the RDA">
                  <Value value={`${formatNumber(result.rdaMultiple.min, 2)}–${formatNumber(result.rdaMultiple.max, 2)}`} unit="×" size="s" />
                </ReadoutRow>
              </div>
              {lean?.deficit ? (
                <Note>
                  Lean, trained people in a deficit may need more than the target, up to {formatNumber(lean.deficit.max)} g
                  a day at the top of the lean-mass range. The need rises with leanness and with the size of the deficit.
                </Note>
              ) : null}
              {lean?.pastLeanTop ? (
                <Note>
                  The {formatNumber(result.target)} g target is more than{" "}
                  {formatNumber(rate(LEAN_MASS_DEFICIT.max), rateDigits)} {rateUnit} of lean mass ({formatNumber(lean.leanTop)} g),
                  the top of the range Helms and colleagues found for lean athletes in a deficit. With a high body-fat
                  percentage, base the number on a goal weight: enter it as your body weight.
                </Note>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-separator pt-4">
                <Heading level={3} variant="h4">
                  The target across meals
                </Heading>
                <ReadoutTable
                  caption={`Protein a meal for a daily target of ${result.target} g`}
                  columns={["Meals a day", "Per meal", metric ? "Per kg" : "Per lb"]}
                  rows={MEAL_COUNTS.map((meals) => {
                    const split = perMeal(result.target, weight.value!, meals)!;
                    return [
                      <Value key="n" value={formatNumber(meals)} size="s" />,
                      <Value key="g" value={formatNumber(split.grams)} unit="g" size="s" />,
                      <Value key="r" value={formatNumber(rate(split.perKg), 2, 2)} unit={rateUnit} size="s" />,
                    ];
                  })}
                />
                <Note>
                  About {formatNumber(rate(PER_MEAL_G_PER_KG), 2, 0)} {rateUnit} a meal ({formatNumber(grams(weight.value, PER_MEAL_G_PER_KG))} g
                  for you) over four or more meals reaches {formatNumber(rate(PER_MEAL_G_PER_KG * 4), 2, 0)} {rateUnit} a day.
                </Note>
              </div>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
