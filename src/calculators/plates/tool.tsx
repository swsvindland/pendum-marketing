"use client";

import { useState } from "react";
import { GYM_DEFAULTS, groupPlates, plateLoading, type PlateUnit } from "@/lib/calc/plates";
import { formatNumber, kgToLb, lbToKg } from "@/lib/units";
import { ReadoutRow } from "@/vector/panel";
import { Note, Value } from "@/vector/text";
import { ChipRow } from "@/vector/form/chip-row";
import { Select } from "@/vector/form/select";
import { EMPTY, MassField, UnitChoice, type Measure } from "../shared/fields";
import { CheckInput, EmptyResult, HeroValue, ReadoutTable, ResultPanel, firstInvalid } from "../shared/results";
import { ToolLayout } from "../shared/tool-layout";
import { useUnits } from "../shared/use-units";

// 1 lb as the floor, so the range reads "1 to 500 kg" and "1 to 1,102 lb".
const TARGET = { min: lbToKg(1), max: 500 };

/** A plate or load as typed: up to two decimals, no trailing zeros ("1.25", "2.5", "100"). */
const plain = (n: number) => formatNumber(n, 2, 0);

type Setup = { bar: number; plates: number[] };

/** Each unit keeps its own bar and plates, starting from Pendum Lift's default gym, so switching back restores them. */
const START: Record<PlateUnit, Setup> = {
  kg: { bar: GYM_DEFAULTS.kg.bar, plates: GYM_DEFAULTS.kg.plates },
  lb: { bar: GYM_DEFAULTS.lb.bar, plates: GYM_DEFAULTS.lb.plates },
};

/**
 * The plates on hand: the kit's ChipRow (HeroUI CheckboxGroup), each chip a real checkbox named "25 kg". Keys are
 * the plate sizes as strings; the order stays the gym's, heaviest first.
 */
function PlateChips({
  unit,
  sizes,
  value,
  onChange,
}: {
  unit: PlateUnit;
  sizes: number[];
  value: number[];
  onChange: (plates: number[]) => void;
}) {
  return (
    <ChipRow
      label="Plates available"
      values={sizes.map((size) => ({
        value: String(size),
        mono: true,
        label: (
          <>
            {plain(size)}
            <span className="sr-only"> {unit}</span>
          </>
        ),
      }))}
      value={value.map(String)}
      onChange={(keys) => onChange(keys.map(Number))}
      hint="Plates are loaded in pairs, one on each side. Any number of each is assumed."
    />
  );
}

/** Height of a drawn plate, % of the drawing: 28 % for the lightest up to 100 % for the heaviest standard plate. */
const plateHeight = (plate: number, heaviest: number) => 28 + 72 * Math.min(1, plate / heaviest);
/** Thickness of a drawn plate, px: 6 for the lightest up to 14 for the heaviest. */
const plateWidth = (plate: number, heaviest: number) => 6 + 8 * Math.min(1, plate / heaviest);

/**
 * Plates drawn on the sleeve at most. Even at their 4 px minimum, 20 plates and the count after them fit the
 * narrowest sleeve (about 210 px at 320 wide). The default plates need at most 14 a side; only a set of small
 * plates alone asks for more (2.5 lb plates alone: 211 a side for 1,100 lb).
 */
const DRAWN_PLATES = 20;

/**
 * One end of the bar, drawn from the side: the shaft, the collar, then the sleeve with the plates heaviest first
 * against the collar. Past DRAWN_PLATES the drawing stops and states how many more go on ("+191"). Neutral marks
 * only, radius 2. Decorative: the table beside it states every plate.
 */
function BarEnd({ side, heaviest }: { side: number[]; heaviest: number }) {
  const drawn = side.slice(0, DRAWN_PLATES);
  const more = side.length - drawn.length;
  return (
    <div aria-hidden className="flex h-28 items-center">
      <span className="h-1.5 w-8 shrink-0 bg-border-strong" />
      <span className="h-8 w-2 shrink-0 rounded-mark bg-foreground-secondary" />
      <div className="relative flex h-full min-w-0 flex-1 items-center gap-0.5 overflow-hidden ps-0.5">
        <span className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-mark border border-border-strong bg-surface" />
        {drawn.map((plate, i) => (
          <span
            key={i}
            className="relative min-w-1 shrink rounded-mark bg-foreground-secondary"
            style={{ height: `${plateHeight(plate, heaviest)}%`, width: plateWidth(plate, heaviest) }}
          />
        ))}
        {more > 0 ? (
          <span className="relative shrink-0 bg-surface px-1 type-readout-xs text-muted">+{formatNumber(more)}</span>
        ) : null}
      </div>
    </div>
  );
}

export function PlatesTool() {
  const [units, setUnits] = useUnits();
  const [target, setTarget] = useState<Measure>(EMPTY);
  const [setups, setSetups] = useState<Record<PlateUnit, Setup>>(START);

  const unit: PlateUnit = units === "metric" ? "kg" : "lb";
  const gym = GYM_DEFAULTS[unit];
  const { bar, plates } = setups[unit];
  const update = (patch: Partial<Setup>) => setSetups((s) => ({ ...s, [unit]: { ...s[unit], ...patch } }));

  // The target in the gym's unit; the field holds kg.
  const goal = target.value === null ? null : unit === "kg" ? target.value : kgToLb(target.value);
  const result = goal !== null && plates.length > 0 ? plateLoading(goal, bar, plates) : null;
  const groups = result ? groupPlates(result.perSide) : [];
  const perSideTotal = result ? result.perSide.reduce((sum, p) => sum + p, 0) : 0;
  const invalid = firstInvalid([["target weight", target]]);

  const announce = (() => {
    if (!result || goal === null) return undefined;
    if (result.belowBar) return `The target is lighter than the ${plain(bar)} ${unit} bar.`;
    const off =
      result.difference === 0
        ? ""
        : `, ${plain(Math.abs(result.difference))} ${unit} ${result.difference < 0 ? "under" : "over"} the target`;
    const load = result.perSide.length
      ? `${groups.map((g) => (g.count > 1 ? `${g.count} × ${plain(g.plate)} ${unit}` : `${plain(g.plate)} ${unit}`)).join(", ")} on each side`
      : "the bar alone";
    return `${plain(result.load)} ${unit}${off}: ${load}.`;
  })();

  return (
    <ToolLayout
      inputsEyebrow="Input / Bar"
      inputs={
        <>
          <UnitChoice units={units} onChange={setUnits} />
          <MassField
            label="Target weight"
            units={units}
            value={target}
            onChange={setTarget}
            min={TARGET.min}
            max={TARGET.max}
            hint="The whole load, bar included."
          />
          <Select
            label="Bar"
            value={String(bar)}
            onChange={(v) => update({ bar: Number(v) })}
            options={gym.bars.map((b) => ({ value: String(b), label: `${plain(b)} ${unit}` }))}
          />
          <PlateChips unit={unit} sizes={gym.plates} value={plates} onChange={(p) => update({ plates: p })} />
        </>
      }
      result={
        <ResultPanel
          eyebrow="Result / Plates"
          meta={`${plain(bar)} ${unit} bar`}
          announce={announce}
          hasResult={result !== null && !result.belowBar}
        >
          {plates.length === 0 ? (
            <EmptyResult code="No plates">Select at least one plate size to see how to load the bar.</EmptyResult>
          ) : !result ? (
            invalid ? (
              <CheckInput field={invalid} outcome="the plates for each side" />
            ) : (
              <EmptyResult>Enter a target weight to see the plates for each side.</EmptyResult>
            )
          ) : result.belowBar ? (
            <>
              <EmptyResult code="Under the bar">
                The target is lighter than the empty bar, so there is nothing to load. Choose a lighter bar or enter a
                heavier target.
              </EmptyResult>
              <div>
                <ReadoutRow label="Target">
                  <Value value={plain(goal!)} unit={unit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Empty bar">
                  <Value value={plain(bar)} unit={unit} size="s" />
                </ReadoutRow>
              </div>
            </>
          ) : (
            <>
              <HeroValue
                value={plain(result.load)}
                unit={unit}
                caption={result.difference === 0 ? "Matches the target" : "The nearest load these plates make"}
              />
              <BarEnd side={result.perSide} heaviest={gym.plates[0]} />
              {groups.length ? (
                <ReadoutTable
                  caption="Plates on each side of the bar, heaviest first"
                  columns={["Plate", "Per side"]}
                  rows={groups.map((g) => [
                    <Value key="plate" value={plain(g.plate)} unit={unit} size="s" />,
                    <Value key="count" value={formatNumber(g.count)} size="s" />,
                  ])}
                />
              ) : (
                <Note>No plates. The empty bar is the load.</Note>
              )}
              <div>
                <ReadoutRow label="Bar">
                  <Value value={plain(bar)} unit={unit} size="s" />
                </ReadoutRow>
                <ReadoutRow label="Plates on each side">
                  <Value value={plain(perSideTotal)} unit={unit} size="s" />
                </ReadoutRow>
                {result.difference !== 0 ? (
                  <>
                    {/* The target as used, to two decimals: after a unit switch it can carry more than the field shows. */}
                    <ReadoutRow label="Target">
                      <Value value={plain(goal!)} unit={unit} size="s" />
                    </ReadoutRow>
                    <ReadoutRow label={result.difference < 0 ? "Under the target" : "Over the target"}>
                      <Value value={plain(Math.abs(result.difference))} unit={unit} size="s" />
                    </ReadoutRow>
                  </>
                ) : null}
              </div>
            </>
          )}
        </ResultPanel>
      }
    />
  );
}
