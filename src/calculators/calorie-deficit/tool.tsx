"use client";

import { useState } from "react";
import {
  DEFAULT_PACE,
  MIN_INTAKE_KCAL,
  PACES,
  RECOMMENDED_PACE,
  checkpoints,
  dailyCalorieChange,
  daysToGoal,
  direction,
  goalDate,
  maintenanceFloor,
  projectGoal,
  weeklyRate,
  type Direction,
} from "@/lib/calc/calorie-deficit";
import { formatNumber, formatSigned, kgToLb } from "@/lib/units";
import { Heading, Note, ReadoutRow, Value } from "@/vector";
import { Select } from "@/vector/form/select";
import { EMPTY, MassField, UnitChoice, type Measure } from "../shared/fields";
import { EmptyResult, HeroValue, ReadoutTable, ResultPanel } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";
import { useToday } from "./use-today";

// Dates are pinned to en-US like every number on the site. Today is null on the server, which renders the empty
// result, so the server and the browser never disagree about a date.
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
  const today = useToday();

  const metric = units === "metric";
  const massUnit = metric ? "kg" : "lb";
  const mass = (kg: number) => (metric ? kg : kgToLb(kg));

  const ready = current.value !== null && goal.value !== null;
  const change = ready ? goal.value! - current.value! : 0;
  // A change that shows as 0.00 in the current unit is no change: a date and a calorie change for it would say
  // more than the inputs do.
  const dir = ready && Number(mass(change).toFixed(2)) !== 0 ? direction(current.value!, goal.value!) : null;
  const shownDir: Direction = dir ?? "lose";
  const pace = Number(paces[shownDir]);
  const projection = dir ? projectGoal(current.value!, goal.value!, pace) : null;
  const weeks = projection?.weeks ?? null;
  const rate = dir ? weeklyRate(current.value!, goal.value!, pace) : 0;
  const kcal = dailyCalorieChange(rate);
  const floor = maintenanceFloor(kcal);
  const date = weeks !== null && today ? goalDate(today, weeks) : null;
  const rows = projection ? checkpoints(projection, EVERY, MAX_ROWS) : [];
  const rowDates = today ? rows.map((r) => goalDate(today, r.week)) : [];
  const truncated = weeks !== null && Math.ceil(weeks / EVERY) - 1 > rows.length - 1;

  const weeksText = weeks !== null ? formatNumber(weeks, 1, 1) : "";
  // Under a week, the time is in days, counted as the date counts them (ceil(weeks × 7)), so a goal a day away never
  // reads 0.0 weeks.
  const days = weeks !== null ? daysToGoal(weeks) : 0;
  const underWeek = days > 0 && days < 7;
  const duration = underWeek
    ? { value: formatNumber(days), unit: days === 1 ? "day" : "days" }
    : { value: weeksText, unit: "weeks" };

  return (
    <ToolLayout
      inputsEyebrow="Input / Weight and pace"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <MassField label="Current weight" units={units} value={current} onChange={setCurrent} min={35} max={350} />
          <MassField label="Goal weight" units={units} value={goal} onChange={setGoal} min={35} max={350} />
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
              ? `${duration.value} ${duration.unit} to reach ${formatNumber(mass(goal.value), 2, 0)} ${massUnit}, on ${longDate.format(date)}. ${formatSigned(kcal)} kcal a day at the start.`
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
              <HeroValue value={duration.value} unit={duration.unit} caption={`Goal date: ${longDate.format(date)}`} />
              <div>
                <ReadoutRow label="Total change">
                  <Value value={formatSigned(mass(change), 2)} unit={massUnit} size="s" />
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
              {floor !== null ? (
                <Note>
                  Vector Macros does not set a target under {formatNumber(MIN_INTAKE_KCAL)} kcal a day, so this pace
                  needs a maintenance of at least {formatNumber(floor)} kcal a day.
                </Note>
              ) : null}

              {underWeek ? null : (
                <div className="flex flex-col gap-3 border-t border-separator pt-4">
                  <Heading level={3} variant="h4">
                    Projected weight
                  </Heading>
                  <ReadoutTable
                    caption={`Projected weight every ${EVERY} weeks, then at the goal`}
                    columns={["Week", "Date", "Weight"]}
                    highlight={rows.length - 1}
                    highlightLabel="goal"
                    rows={rows.map((r, i) => [
                      <Value key="w" value={r.goal ? weeksText : formatNumber(r.week)} size="s" />,
                      <Value key="d" value={shortDate.format(rowDates[i])} size="s" />,
                      <Value key="kg" value={formatNumber(mass(r.kg), 1, 1)} unit={massUnit} size="s" />,
                    ])}
                  />
                  {truncated ? (
                    <Note>
                      The table shows every {EVERY} weeks to week {formatNumber(rows[rows.length - 2].week)}, then the
                      goal week.
                    </Note>
                  ) : null}
                </div>
              )}
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
