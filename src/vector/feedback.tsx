import type { ReactNode } from "react";
import { cn } from "./cn";
import { Label, Text } from "./text";

const calloutRule = {
  info: "border-tint",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
} as const;
const calloutTitle = { info: "tint", success: "success", warning: "warning", danger: "danger" } as const;

/**
 * A 2pt start rule in the tone colour, title as a Label, body `small` foreground, on the white surface (§5.7).
 * Danger and warning are alerts; the rest are polite.
 */
export function Callout({
  tone = "info",
  title,
  live = false,
  className,
  children,
}: {
  tone?: keyof typeof calloutRule;
  title?: string;
  /** Announce changes (results that update as the visitor types). */
  live?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const alert = tone === "danger" || tone === "warning";
  return (
    <div
      role={live ? (alert ? "alert" : "status") : undefined}
      className={cn("flex flex-col gap-1 border-s-2 ps-3", calloutRule[tone], className)}
    >
      {title ? <Label tone={calloutTitle[tone]}>{title}</Label> : null}
      <div className="type-small text-foreground [&_a]:text-tint [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </div>
  );
}

/** Callout danger with no title. Renders nothing when empty. */
export function ErrorText({ message, id }: { message?: string | null; id?: string }) {
  if (!message) return null;
  return (
    <div id={id} className="flex flex-col gap-1 border-s-2 border-danger ps-3">
      <Text variant="small" tone="danger">
        {message}
      </Text>
    </div>
  );
}

const dotClass = {
  live: "bg-accent",
  ok: "bg-success",
  attention: "bg-warning",
  error: "bg-danger",
  idle: "border border-border-strong",
  off: "bg-muted",
} as const;

/** A 6pt dot, then the status word in the Label style, then optional meta. Never a pill, never pulses. */
export function Status({
  state,
  label,
  meta,
  className,
}: {
  state: keyof typeof dotClass;
  label: string;
  meta?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dotClass[state])} />
      <Label tone={state === "off" || state === "idle" ? "muted" : "default"}>{label}</Label>
      {meta ? <span className="type-readout-xs text-muted">{meta}</span> : null}
    </span>
  );
}

/**
 * A goal meter (§5.7). signal: the page's hero goal only (8pt, 1pt border-strong outline, signal fill, 2pt index
 * tick). neutral: 4pt, foreground-secondary fill. `over` caps the fill and turns it warning; the adjacent text must
 * say so. Never shown without a readout beside it.
 */
export function Meter({
  value,
  max,
  target,
  tone = "neutral",
  over = "warning",
  label,
  valueText,
  className,
}: {
  value: number;
  max: number;
  target?: number;
  tone?: "signal" | "neutral";
  over?: "warning" | "danger" | "none";
  label: string;
  valueText: string;
  className?: string;
}) {
  const ratio = max > 0 ? Math.max(0, value / max) : 0;
  const pct = Math.min(1, ratio) * 100;
  const isOver = ratio > 1 && over !== "none";
  const fill = isOver
    ? over === "danger"
      ? "bg-danger"
      : "bg-warning"
    : tone === "signal"
      ? "bg-accent"
      : "bg-foreground-secondary";
  const signal = tone === "signal";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 100) / 100}
      aria-valuetext={valueText}
      className={cn("relative w-full", signal ? "h-2" : "h-1", className)}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-mark bg-surface-tertiary",
          signal && "outline outline-1 -outline-offset-1 outline-border-strong"
        )}
      >
        <div
          className={cn("h-full transition-[width] duration-300 ease-standard", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {signal ? (
        <span
          aria-hidden
          className="absolute -top-0.5 h-3 w-0.5 -translate-x-1/2 bg-foreground transition-[inset-inline-start] duration-300 ease-standard rtl:translate-x-1/2"
          style={{ insetInlineStart: `${pct}%` }}
        />
      ) : null}
      {target !== undefined && max > 0 ? (
        <span
          aria-hidden
          className={cn("absolute w-0.5 -translate-x-1/2 bg-foreground rtl:translate-x-1/2", signal ? "-top-0.5 h-3" : "-top-1 h-3")}
          style={{ insetInlineStart: `${Math.min(1, target / max) * 100}%` }}
        />
      ) : null}
    </div>
  );
}
