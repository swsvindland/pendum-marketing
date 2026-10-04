"use client";

import { Description } from "@heroui/react/description";
import { Label } from "@heroui/react/label";
import { Radio } from "@heroui/react/radio";
import { RadioGroup } from "@heroui/react/radio-group";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Glyph } from "../glyph";
import { check } from "../glyphs/check";
import { cell, endCorners, segmentLabel, startCorners } from "./cell";

/**
 * Choices (§5.5): the one segmented control, on HeroUI's RadioGroup (radios, arrow keys move the selection). A 1pt
 * border-strong edge, radius 4, equal cells with 1pt dividers (logical, so they mirror under RTL by themselves).
 * Selected is a signal fill, #071017 label at 600 and a 12pt check in a reserved leading slot, so widths never
 * shift. At most 4 options (6 when `mono`). The container does not clip: the end cells round their own corners,
 * so the 2pt focus outline (offset 2) shows on every side. `hint` is a caption below, linked to the group.
 * Labels keep one line; from three cells they take the small role so a label like "More carbs" fits at 375.
 * A group that starts unselected passes `""`, which reaches React Aria as null: with a value that matches no
 * radio every radio would be tabIndex -1 and the keyboard could never reach the group.
 */
export function Choices<T extends string>({
  label,
  showLabel = true,
  values,
  value,
  onChange,
  size = "md",
  mono = false,
  hint,
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
  className?: string;
}) {
  return (
    <RadioGroup
      value={value === "" ? null : value}
      onChange={(v) => onChange(v as T)}
      orientation="horizontal"
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <Label className={cn(!showLabel && "sr-only")}>{label}</Label>
      <div className="grid auto-cols-fr grid-flow-col divide-x divide-border-strong rounded-control border border-border-strong">
        {values.map((option, i) => (
          <Radio key={option.value} value={option.value} className="min-w-0 items-stretch gap-0">
            <Radio.Content
              className={({ isSelected, isFocusVisible }) =>
                cn(
                  cell({ isSelected, isFocusVisible }),
                  "px-2 text-center",
                  size === "sm" ? "min-h-9" : "min-h-11",
                  i === 0 && startCorners,
                  i === values.length - 1 && endCorners
                )
              }
            >
              {({ isSelected }) => (
                <>
                  <Glyph markup={check} name="check" size={12} className={isSelected ? "opacity-100" : "opacity-0"} />
                  <span
                    className={cn(
                      segmentLabel(values.length, size, mono),
                      "whitespace-nowrap",
                      isSelected && !mono && "[font-weight:600]"
                    )}
                  >
                    {option.label}
                  </span>
                </>
              )}
            </Radio.Content>
          </Radio>
        ))}
      </div>
      {hint ? <Description>{hint}</Description> : null}
    </RadioGroup>
  );
}
