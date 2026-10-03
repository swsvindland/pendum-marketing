"use client";

import { Description } from "@heroui/react/description";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * Field (§5.5) on HeroUI's TextField: the label above (never a placeholder), a 44 input with the 1pt field edge,
 * radius 4. `numeric` gives Plex Mono with a decimal keypad and the unit inside the field at the end; the text is
 * kept as typed and parsed by the caller. The unit is drawn for the eye and also read as part of the label
 * ("Body weight (kg)"), so a screen reader hears what the number means. An error gives a danger edge and the
 * message below, linked to the input.
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
      <Label>
        {label}
        {unit ? <span className="sr-only"> ({unit})</span> : null}
      </Label>
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
