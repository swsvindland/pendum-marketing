"use client";

import { useId, type ReactNode } from "react";
import { cx } from "../cx";
import { Glyph } from "../glyph";
import { check } from "../glyphs/check";
import { cell, endCorners, peerCellFocus, segmentLabel, startCorners } from "./cell";

/**
 * Choices (§5.5) on native radios, the same look as ./choices (the cell styles) with no HeroUI behind it: for a
 * control that every page carries (the footer's Appearance), where React Aria would cost every visitor its bundle.
 * The browser supplies the behaviour: Tab lands on the checked radio (or the first), the arrow keys move the
 * selection, a click on a cell checks it. Each radio is sr-only with its cell as the next sibling, so the cell
 * takes the focus outline through `peer-focus-visible`. The group is a div with role radiogroup named by its
 * label (the pattern React Aria renders). Takes the same props as Choices; `name` groups the radios in a form.
 */
export function NativeChoices<T extends string>({
  label,
  showLabel = true,
  values,
  value,
  onChange,
  size = "md",
  mono = false,
  hint,
  name,
  className,
}: {
  label: string;
  showLabel?: boolean;
  hint?: ReactNode;
  values: readonly { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  size?: "md" | "sm";
  mono?: boolean;
  name?: string;
  className?: string;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-describedby={hint ? hintId : undefined}
      className={cx("flex min-w-0 flex-col gap-2", className)}
    >
      <span id={labelId} className={cx("type-field-label text-foreground-secondary", !showLabel && "sr-only")}>
        {label}
      </span>
      <div className="grid auto-cols-fr grid-flow-col divide-x divide-border-strong rounded-control border border-border-strong">
        {values.map((option, i) => {
          const selected = option.value === value;
          return (
            <label key={option.value} className="relative flex min-w-0">
              <input
                type="radio"
                name={name ?? id}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cx(
                  cell({ isSelected: selected, isFocusVisible: false }),
                  peerCellFocus,
                  "px-2 text-center",
                  size === "sm" ? "min-h-9" : "min-h-11",
                  i === 0 && startCorners,
                  i === values.length - 1 && endCorners
                )}
              >
                <Glyph markup={check} name="check" size={12} className={selected ? "opacity-100" : "opacity-0"} />
                <span
                  className={cx(
                    segmentLabel(values.length, size, mono),
                    "whitespace-nowrap",
                    selected && !mono && "[font-weight:600]"
                  )}
                >
                  {option.label}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {hint ? (
        <p id={hintId} className="type-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
