"use client";

import { Checkbox } from "@heroui/react/checkbox";
import { CheckboxGroup } from "@heroui/react/checkbox-group";
import { Description } from "@heroui/react/description";
import { Label } from "@heroui/react/label";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Icon } from "../icon";
import { cell } from "./cell";

/**
 * ChipRow, multiple mode (§5.5), on HeroUI's CheckboxGroup: any number on at once, each chip a real checkbox. Cells
 * have the Choices `sm` look (36 tall, 1pt border-strong, radius 4, 8 gap); selected is the signal fill with a 12pt
 * check. Selection is exempt from the signal budget.
 */
export function ChipRow<T extends string>({
  label,
  values,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  values: readonly { value: T; label: ReactNode; mono?: boolean }[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <CheckboxGroup
      value={[...value]}
      onChange={(v) => onChange(values.map((o) => o.value).filter((k) => v.includes(k)))}
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {values.map((option) => (
          <Checkbox key={option.value} value={option.value} className="gap-0">
            <Checkbox.Content
              className={({ isSelected, isFocusVisible }) =>
                cn(cell({ isSelected, isFocusVisible }), "min-h-9 rounded-control border border-border-strong ps-2 pe-3")
              }
            >
              {({ isSelected }) => (
                <>
                  <Icon name="check" size={12} className={isSelected ? "opacity-100" : "opacity-0"} />
                  <span className={option.mono ? "type-readout-xs" : "type-small"}>{option.label}</span>
                </>
              )}
            </Checkbox.Content>
          </Checkbox>
        ))}
      </div>
      {hint ? <Description>{hint}</Description> : null}
    </CheckboxGroup>
  );
}
