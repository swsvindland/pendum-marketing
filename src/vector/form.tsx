"use client";

import { useId, type ReactNode } from "react";
import { cn } from "./cn";
import { ErrorText } from "./feedback";
import { Icon } from "./icon";
import { Text } from "./text";

const fieldEdge =
  "min-h-11 w-full rounded-control border bg-field-background text-field-foreground transition-colors duration-100 ease-standard hover:bg-field-hover";

/**
 * Field (§5.5): the label above (never a placeholder), a 44 input with a 1pt field-border, radius 4. `numeric`
 * gives Plex Mono with a decimal keypad and the unit inside the field at the end. Errors add a danger edge and
 * ErrorText below.
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
  id: idProp,
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
  id?: string;
  className?: string;
  autoComplete?: string;
  name?: string;
}) {
  const generated = useId();
  const id = idProp ?? generated;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="type-field-label text-foreground-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          inputMode={inputMode ?? (numeric ? "decimal" : "text")}
          autoComplete={autoComplete}
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            fieldEdge,
            "px-3 py-2.5 placeholder:text-field-placeholder disabled:opacity-40",
            numeric ? "type-readout-s" : "type-body",
            unit && "pe-14",
            error ? "border-danger" : "border-field-border"
          )}
        />
        {unit ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 end-3 flex items-center type-small text-muted"
          >
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? (
        <Text variant="caption" tone="muted" id={hintId}>
          {hint}
        </Text>
      ) : null}
      <ErrorText message={error} id={errorId} />
    </div>
  );
}

/** Select (§5.5): the Field look with a trailing down glyph, on the browser's own select for keyboard and a11y. */
export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  id: idProp,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  hint?: ReactNode;
  id?: string;
  className?: string;
}) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="type-field-label text-foreground-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value as T)}
          className={cn(fieldEdge, "cursor-pointer appearance-none border-field-border py-2.5 ps-3 pe-10 type-body")}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="down"
          size={16}
          tone="muted"
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
        />
      </div>
      {hint ? (
        <Text variant="caption" tone="muted" id={`${id}-hint`}>
          {hint}
        </Text>
      ) : null}
    </div>
  );
}

/**
 * Choices (§5.5): the one segmented control. A 1pt border-strong edge, radius 4, equal cells with 1pt dividers.
 * Selected is a signal fill, #071017 label at 600 and a 12pt check in a reserved leading slot (so widths never
 * shift). Radios underneath, so arrow keys move the selection. At most 4 options (6 when `mono`).
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
  const name = useId();
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-2", className)}>
      <legend className={cn("mb-2 type-field-label text-foreground-secondary", !showLabel && "sr-only")}>
        {label}
      </legend>
      <div
        className="grid auto-cols-fr grid-flow-col divide-x divide-border-strong overflow-hidden rounded-control border border-border-strong rtl:divide-x-reverse"
      >
        {values.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer items-center justify-center gap-1.5 px-2 text-center transition-colors duration-150 ease-standard",
                "has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                size === "sm" ? "min-h-9" : "min-h-11",
                selected
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-foreground hover:bg-surface-secondary"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <Icon name="check" size={12} className={cn(selected ? "opacity-100" : "opacity-0")} />
              <span
                className={cn(
                  mono ? "type-readout-xs" : size === "sm" ? "type-small" : "type-h4",
                  selected && !mono && "[font-weight:600]"
                )}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
