"use client";

import { useState } from "react";
import {
  DEFAULT_PACE,
  PACES,
  RECOMMENDED_PACE,
  checkpoints,
  dailyCalorieChange,
  direction,
  goalDate,
  projectGoal,
  weeklyRate,
  type Direction,
} from "@/lib/calc/calorie-deficit";
import { formatNumber, formatSigned, kgToLb } from "@/lib/units";
import { Heading, Note, ReadoutRow, Value } from "@/vector";
import { Select } from "@/vector/form";
import { EMPTY, MassField, UnitChoice, type Measure } from "../shared/fields";
import { ToolLayout } from "../shared/frame";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { useUnits } from "../shared/use-units";

// Dates are pinned to en-US like every number on the site, and only formatted once a visitor has typed, so the
// server (which renders the empty state) and the browser never disagree.
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const paceOptions = (dir: Direction) =>
  PACES[dir].map((p) => ({ value: String(p), label: `${formatNumber(p, 2, 0)}% of body weight a week` }));

const paceHint: Record<Direction, string> = {
  lose: `${formatNumber(RECOMMENDED_PACE.lose[0], 2, 0)}–${formatNumber(RECOMMENDED_PACE.lose[1], 2, 0)}% a week suits most people losing weight.`,
  gain: `${formatNumber(RECOMMENDED_PACE.gain[0], 2, 0)}–${formatNumber(RECOMMENDED_PACE.gain[1], 2, 0)}% a week suits most people gaining. A higher pace adds more fat alongside the muscle.`,
};

/** The projection table: a row every 4 weeks, then the goal week, at most 26 rows. */
const EVERY = 4;
const MAX_ROWS = 26;

export function CalorieDeficitTool() {
  const [units, setUnits] = useUnits();
  const [current, setCurrent] = useState<Measure>(EMPTY);
  const [goal, setGoal] = useState<Measure>(EMPTY);
  // One pace per direction, so switching between a cut and a bulk keeps each choice.
  const [paces, setPaces] = useState<Record<Direction, string>>({
    lose: String(DEFAULT_PACE.lose),
    gain: String(DEFAULT_PACE.gain),
  });
  // Today, read when the visitor types (an event, never during render).
  const [today, setToday] = useState<Date | null>(null);

  const ready = current.value !== null && goal.value !== null;
  const dir = ready ? direction(current.value!, goal.value!) : null;
  const shownDir: Direction = dir ?? "lose";
  const pace = Number(paces[shownDir]);
  const projection = dir ? projectGoal(current.value!, goal.value!, pace) : null;
  const weeks = projection?.weeks ?? null;
  const rate = dir ? weeklyRate(current.value!, goal.value!, pace) : 0;
  const kcal = dailyCalorieChange(rate);
  const date = weeks !== null && today ? goalDate(today, weeks) : null;
  const rows = projection ? checkpoints(projection, EVERY, MAX_ROWS) : [];
  const rowDates = today ? rows.map((r) => goalDate(today, r.week)) : [];
  const truncated = weeks !== null && Math.ceil(weeks / EVERY) - 1 > rows.length - 1;

  const metric = units === "metric";
  const massUnit = metric ? "kg" : "lb";
  const mass = (kg: number) => (metric ? kg : kgToLb(kg));
  const weeksText = weeks !== null ? formatNumber(weeks, 1, 1) : "";
  const stamp = () => setToday(new Date());

  return (
    <ToolLayout
      inputsEyebrow="Input / Weight and pace"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <MassField
            label="Current weight"
            units={units}
            value={current}
            onChange={(m) => {
              setCurrent(m);
              stamp();
            }}
            min={35}
            max={350}
          />
          <MassField
            label="Goal weight"
            units={units}
            value={goal}
            onChange={(m) => {
              setGoal(m);
              stamp();
            }}
            min={35}
            max={350}
          />
          <Select
            label={shownDir === "lose" ? "Weekly pace of loss" : "Weekly pace of gain"}
            options={paceOptions(shownDir)}
            value={paces[shownDir]}
            onChange={(v) => setPaces((p) => ({ ...p, [shownDir]: v }))}
            hint={paceHint[shownDir]}
          />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Goal date"
          meta="Estimate"
          announce={
            weeks !== null && date && goal.value !== null
              ? `${weeksText} weeks to reach ${formatNumber(mass(goal.value), 1, 0)} ${massUnit}, on ${longDate.format(date)}. ${formatSigned(kcal)} kcal a day at the start.`
              : undefined
          }
        >
          {!ready ? (
            <EmptyResult>Enter your current and goal weight to see how long the change takes.</EmptyResult>
          ) : !dir ? (
            <EmptyResult code="No change">Your goal weight is your current weight, so there is nothing to change.</EmptyResult>
          ) : weeks === null || !date ? (
            <EmptyResult code="Out of range">
              At this pace the goal is 520 weeks or more away. Choose a higher pace or a closer goal weight.
            </EmptyResult>
          ) : (
            <>
              <HeroValue value={weeksText} unit="weeks" caption={`Goal date: ${longDate.format(date)}`} />
              <div>
                <ReadoutRow label="Total change">
                  <Value value={formatSigned(mass(goal.value! - current.value!), 1)} unit={massUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="First week’s change">
                  <Value value={formatSigned(mass(rate), 2)} unit={massUnit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Daily calorie change at the start">
                  <Value value={formatSigned(kcal)} unit="kcal" size="s" />
                </ReadoutRow>
              </div>
              <Note>
                The weekly step is a share of your weight, so it {dir === "lose" ? "shrinks as you lose" : "grows as you gain"},
                and the calorie change {dir === "lose" ? "shrinks" : "grows"} with it.
              </Note>

              <div className="flex flex-col gap-3 border-t border-separator pt-4">
                <Heading level={3} variant="h4">
                  Projected weight
                </Heading>
                <ReadoutTable
                  caption={`Projected weight every ${EVERY} weeks, then at the goal`}
                  columns={["Week", "Date", "Weight"]}
                  highlight={rows.length - 1}
                  rows={rows.map((r, i) => [
                    <Value key="w" value={r.goal ? weeksText : formatNumber(r.week)} size="s" />,
                    <Value key="d" value={shortDate.format(rowDates[i])} size="s" />,
                    <Value key="kg" value={formatNumber(mass(r.kg), 1, 1)} unit={massUnit} size="s" />,
                  ])}
                />
                {truncated ? (
                  <Note>
                    The table shows every {EVERY} weeks to week {formatNumber(rows[rows.length - 2].week)}, then the goal
                    week.
                  </Note>
                ) : null}
              </div>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
