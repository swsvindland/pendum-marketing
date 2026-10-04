"use client";

import { Description } from "@heroui/react/description";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select as HeroSelect } from "@heroui/react/select";
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Glyph } from "../glyph";
import { check } from "../glyphs/check";
import { down } from "../glyphs/down";

/**
 * Select (§5.5) on HeroUI's Select: a Field-look trigger with the kit `down` glyph at the end, an overlay popover
 * the width of the trigger with 44 items and a 17pt tint check on the selected one. For more than 4 options.
 * A client file, so its two glyphs come from their own modules (Glyph), never from Icon's whole table.
 */
export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <HeroSelect
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key) as T);
      }}
      fullWidth
      className={cn("min-w-0", className)}
    >
      <Label>{label}</Label>
      <HeroSelect.Trigger>
        <HeroSelect.Value />
        <HeroSelect.Indicator>
          <Glyph markup={down} name="down" size={20} />
        </HeroSelect.Indicator>
      </HeroSelect.Trigger>
      {hint ? <Description>{hint}</Description> : null}
      <HeroSelect.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator>
                {({ isSelected }) => (isSelected ? <Glyph markup={check} name="check" size={17} /> : null)}
              </ListBox.ItemIndicator>
            </ListBox.Item>
          ))}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
}
