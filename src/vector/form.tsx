"use client";

import {
  Checkbox,
  CheckboxGroup,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Select as HeroSelect,
  TextField,
} from "@heroui/react";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icon } from "./icon";

/**
 * Field (§5.5) on HeroUI's TextField: the label above (never a placeholder), a 44 input with the 1pt field edge,
 * radius 4. `numeric` gives Plex Mono with a decimal keypad and the unit inside the field at the end; the text is
 * kept as typed and parsed by the caller. An error gives a danger edge and the message below, linked to the input.
 */
export function Field({
  label,
  value,
  onChange,
  numeric = false,
  unit,
  hint,
  error,
  placeholder,
  disabled,
  inputMode,
  className,
  autoComplete = "off",
  name,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  unit?: string;
  hint?: ReactNode;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: "decimal" | "numeric" | "text";
  className?: string;
  autoComplete?: string;
  name?: string;
}) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      isInvalid={Boolean(error)}
      isDisabled={disabled}
      name={name}
      fullWidth
      className={cn("min-w-0", className)}
    >
      <Label>{label}</Label>
      <div className="relative">
        <Input
          inputMode={inputMode ?? (numeric ? "decimal" : "text")}
          autoComplete={autoComplete}
          spellCheck={false}
          placeholder={placeholder}
          className={cn(numeric ? "type-readout-s" : "type-body", unit && "pe-14")}
        />
        {unit ? (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 end-3 flex items-center type-small text-muted">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? <Description>{hint}</Description> : null}
      <FieldError>{error}</FieldError>
    </TextField>
  );
}

/**
 * Select (§5.5) on HeroUI's Select: a Field-look trigger with a trailing down glyph, an overlay popover the width
 * of the trigger with 44 items and a tint check on the selected one. For more than 4 options.
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
        <HeroSelect.Indicator />
      </HeroSelect.Trigger>
      {hint ? <Description>{hint}</Description> : null}
      <HeroSelect.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
}

/** The cell look shared by Choices segments and ChipRow chips (§5.5): selected is the signal fill with ink. */
const cell = ({
  isSelected,
  isFocusVisible,
}: {
  isSelected: boolean;
  isFocusVisible: boolean;
}) =>
  cn(
    "relative flex w-full cursor-pointer items-center justify-center gap-1.5 transition-colors duration-150 ease-standard",
    isFocusVisible && "z-10 outline-2 outline-offset-2 outline-focus",
    isSelected ? "bg-accent text-accent-foreground" : "bg-surface text-foreground hover:bg-surface-secondary"
  );

/**
 * Choices (§5.5): the one segmented control, on HeroUI's RadioGroup (radios, arrow keys move the selection). A 1pt
 * border-strong edge, radius 4, equal cells with 1pt dividers. Selected is a signal fill, #071017 label at 600 and
 * a 12pt check in a reserved leading slot, so widths never shift. At most 4 options (6 when `mono`).
 */
export function Choices<T extends string>({
  label,
  showLabel = true,
  values,
  value,
  onChange,
  size = "md",
  mono = false,
  className,
}: {
  label: string;
  showLabel?: boolean;
  values: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
  mono?: boolean;
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onChange={(v) => onChange(v as T)}
      orientation="horizontal"
      className={cn("flex min-w-0 flex-col gap-2", className)}
    >
      <Label className={cn(!showLabel && "sr-only")}>{label}</Label>
      <div className="grid auto-cols-fr grid-flow-col divide-x divide-border-strong overflow-hidden rounded-control border border-border-strong rtl:divide-x-reverse">
        {values.map((option) => (
          <Radio key={option.value} value={option.value} className="min-w-0 items-stretch gap-0">
            <Radio.Content
              className={({ isSelected, isFocusVisible }) =>
                cn(cell({ isSelected, isFocusVisible }), "px-2 text-center", size === "sm" ? "min-h-9" : "min-h-11")
              }
            >
              {({ isSelected }) => (
                <>
                  <Icon name="check" size={12} className={isSelected ? "opacity-100" : "opacity-0"} />
                  <span
                    className={cn(
                      mono ? "type-readout-xs" : size === "sm" ? "type-small" : "type-h4",
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
    </RadioGroup>
  );
}

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
