"use client";

import { useState, type ReactNode } from "react";
import {
  CALORIE_LIMITS,
  DEFAULT_PROTEIN,
  DIET_STYLES,
  EXPENDITURE_LIMITS,
  PACES,
  PROTEIN_LEVELS,
  macroEnergy,
  macroPlan,
  macroShares,
  type DietStyle,
  type Goal,
  type MacroPlan,
} from "@/lib/calc/macros";
import { DEFAULT_ACTIVITY, PROFILE_LIMITS, tdee, type Activity, type Sex } from "@/lib/calc/tdee";
import { KG_PER_LB, formatNumber, formatSigned, kgToLb } from "@/lib/units";
import { Callout, ReadoutRow, Rule, Value } from "@/vector";
import { Choices, Select } from "@/vector/form";
import { EMPTY, HeightField, MassField, NumberField, UnitChoice, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/frame";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { useUnits, type UnitSystem } from "../shared/use-units";
import { ActivitySelect, AgeField, SexChoice } from "../tdee/profile-fields";
import { SplitBar } from "./split-bar";

const GOALS: readonly { value: Goal; label: string }[] = [
  { value: "cut", label: "Cut" },
  { value: "maintain", label: "Maintain" },
  { value: "bulk", label: "Bulk" },
];

const PACE_HINT = {
  cut: "Recommended 0.5–1% a week. A pace above 1% suits only a mini-cut of 2–4 weeks.",
  bulk: "Recommended 0.1–0.25% a week. A pace above 0.25% adds more fat alongside the muscle.",
} as const;

/** "0.5" → 0.5% of body weight a week. */
const paceOptions = (goal: "cut" | "bulk") =>
  PACES[goal].options.map((p) => ({ value: String(p), label: `${formatNumber(p, 2, 0)}% of body weight a week` }));

/** Protein levels in g/kg, with g/lb first in imperial. */
function proteinOptions(units: UnitSystem) {
  return PROTEIN_LEVELS.map((g) => {
    const perKg = `${formatNumber(g, 1)} g/kg`;
    return { value: String(g), label: units === "metric" ? perKg : `${formatNumber(g * KG_PER_LB, 2)} g/lb (${perKg})` };
  });
}

const kcal = (n: number) => formatNumber(n);
const RANGE = `${kcal(CALORIE_LIMITS.min)}–${kcal(CALORIE_LIMITS.max)} kcal a day`;

/** Why no targets were generated, as a title and a sentence that says what to change. */
function blockedMessage(plan: MacroPlan, goal: Goal, estimated: boolean): { title: string; body: string } {
  const outside = { title: "Outside the coached range" };
  const maintenance = estimated ? "Your maintenance estimate" : "Your maintenance";
  switch (plan.blocked) {
    case "underweight":
      return {
        title: "Cut not offered",
        body: "At your height and weight, BMI is under 18.5. A cut below that range needs professional guidance, so no cut targets are generated. Choose Maintain or Bulk.",
      };
    case "expenditure-low":
    case "expenditure-high":
      return {
        ...outside,
        body: `${maintenance} is ${kcal(Math.round(plan.expenditure))} kcal a day. Vector Macros starts programs from ${kcal(EXPENDITURE_LIMITS.min)}–${kcal(EXPENDITURE_LIMITS.max)} kcal a day, so no targets are generated from it.`,
      };
    case "calories-low":
      return {
        ...outside,
        body: `These choices come to ${kcal(plan.calories)} kcal a day. Vector Macros keeps targets within ${RANGE}. ${
          goal === "cut" ? "Choose a slower pace or Maintain." : "A target this low needs professional guidance."
        }`,
      };
    case "calories-high":
      return {
        ...outside,
        body: `These choices come to ${kcal(plan.calories)} kcal a day. Vector Macros keeps targets within ${RANGE}. Choose a slower pace or Maintain.`,
      };
    case "carbs":
      return {
        ...outside,
        body: `Protein and the fat floor take more than ${kcal(plan.calories)} kcal a day, which leaves nothing for carbs. Choose a lower protein target${goal === "cut" ? " or a slower pace" : ""}.`,
      };
    default:
      return { ...outside, body: "" };
  }
}

export function MacrosTool() {
  const [units, setUnits] = useUnits();
  const [goal, setGoal] = useState<Goal>("cut");
  const [pace, setPace] = useState(String(PACES.cut.default));
  const [sex, setSex] = useState<Sex | "">("");
  const [age, setAge] = useState<Measure>(EMPTY);
  const [height, setHeight] = useState<Measure>(EMPTY);
  const [weight, setWeight] = useState<Measure>(EMPTY);
  const [activity, setActivity] = useState<Activity>(DEFAULT_ACTIVITY);
  const [maintenance, setMaintenance] = useState<Measure>(EMPTY);
  const [protein, setProtein] = useState(String(DEFAULT_PROTEIN));
  const [diet, setDiet] = useState<DietStyle>("balanced");

  const w = weight.value;
  const h = height.value;
  const estimate =
    sex && age.value !== null && h !== null && w !== null
      ? tdee({ sex, age: age.value, heightCm: h, weightKg: w, activity })
      : null;
  const entered = maintenance.value;
  const expenditure = entered ?? estimate;
  const plan =
    expenditure !== null && w !== null && h !== null
      ? macroPlan({
          goal,
          pace: goal === "maintain" ? 0 : Number(pace),
          weightKg: w,
          heightCm: h,
          proteinPerKg: Number(protein),
          diet,
          expenditure,
        })
      : null;
  const t = plan?.targets ?? null;
  const blocked = plan && !t ? blockedMessage(plan, goal, entered === null) : null;

  const mass = (kg: number) => (units === "metric" ? kg : kgToLb(kg));
  const massUnit = units === "metric" ? "kg" : "lb";
  const paceLabel = goal === "maintain" ? null : `${formatNumber(Number(pace), 2, 0)}% of body weight a week`;
  const caption = goal === "maintain" ? "Maintenance" : `${goal === "cut" ? "Cut" : "Bulk"} at ${paceLabel}`;

  const maintenanceRow =
    plan && expenditure !== null ? (
      <ReadoutRow label={entered === null ? "Maintenance, estimated" : "Maintenance, entered"}>
        <Value value={kcal(Math.round(expenditure))} unit="kcal/day" size="s" />
      </ReadoutRow>
    ) : null;

  return (
    <ToolLayout
      inputsEyebrow="Input / Profile"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <Choices
            label="Goal"
            values={GOALS}
            value={goal}
            onChange={(g) => {
              setGoal(g);
              // A cut starts at the low end of its recommended band, a bulk at the top of its own, as in the app.
              if (g !== "maintain") setPace(String(PACES[g].default));
            }}
          />
          {goal !== "maintain" ? (
            <Select label="Weekly pace" value={pace} onChange={setPace} options={paceOptions(goal)} hint={PACE_HINT[goal]} />
          ) : null}
          <Rule className="my-1" />
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
          <NumberField
            label="Maintenance calories"
            unit="kcal"
            noun="maintenance calories"
            min={EXPENDITURE_LIMITS.min}
            max={EXPENDITURE_LIMITS.max}
            value={maintenance}
            onChange={setMaintenance}
            hint="Optional. If you know the intake that holds your weight steady, it replaces the estimate."
          />
          <Rule className="my-1" />
          <Select
            label="Protein"
            value={protein}
            onChange={setProtein}
            options={proteinOptions(units)}
            hint={
              units === "metric"
                ? "Per kg of body weight a day. 1.4–2.0 g/kg is sufficient for most people who train."
                : "Per lb of body weight a day. 0.64–0.91 g/lb is sufficient for most people who train."
            }
          />
          <Choices label="Macro preference" values={DIET_STYLES} value={diet} onChange={setDiet} />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Targets"
          meta="Per day"
          announce={
            t
              ? `${kcal(t.calories)} kcal a day: protein ${t.protein} g, carbs ${t.carbs} g, fat ${t.fat} g.`
              : blocked
                ? blocked.body
                : undefined
          }
        >
          {!plan ? (
            <EmptyResult>
              {entered !== null
                ? "Enter your height and weight to see your targets."
                : "Enter your sex, age, height and weight to see your targets."}
            </EmptyResult>
          ) : !t ? (
            <>
              <Callout tone="warning" title={blocked?.title}>
                {blocked?.body}
              </Callout>
              <div>{maintenanceRow}</div>
            </>
          ) : (
            <MacroResult
              targets={t}
              caption={caption}
              rows={
                <>
                  {maintenanceRow}
                  <ReadoutRow label="Daily change from maintenance">
                    <Value value={formatSigned(t.calories - plan.expenditure)} unit="kcal" size="s" />
                  </ReadoutRow>
                  <ReadoutRow label="Weekly weight change">
                    <Value
                      value={plan.rateKgPerWeek === 0 ? "0" : formatSigned(mass(plan.rateKgPerWeek), 2)}
                      unit={`${massUnit}/week`}
                      size="s"
                    />
                  </ReadoutRow>
                </>
              }
            />
          )}
        </ResultPanel>
      }
    />
  );
}

const MACRO_ROWS = [
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
  { key: "fat", label: "Fat" },
] as const;

/** Calories as the hero, the P · C · F bar, grams with their energy and share, then the readout rows. */
function MacroResult({
  targets,
  caption,
  rows,
}: {
  targets: NonNullable<MacroPlan["targets"]>;
  caption: string;
  rows: ReactNode;
}) {
  const energy = macroEnergy(targets);
  const shares = macroShares(targets);
  return (
    <>
      <HeroValue value={kcal(targets.calories)} unit="kcal/day" caption={caption} />
      <SplitBar targets={targets} className="mt-1" />
      <ReadoutTable
        caption="Daily macro targets"
        columns={["Macro", "Grams", "Energy", "Share"]}
        rows={MACRO_ROWS.map((m) => [
          m.label,
          <Value key="g" value={formatNumber(targets[m.key])} unit="g" size="s" />,
          <Value key="kcal" value={kcal(energy[m.key])} unit="kcal" size="s" tone="secondary" />,
          <Value key="share" value={`${shares[m.key]}%`} size="s" tone="secondary" />,
        ])}
      />
      <div>{rows}</div>
    </>
  );
}
