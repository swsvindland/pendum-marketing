import { Fragment, type ElementType, type ReactNode } from "react";
import { cn } from "./cn";

/** The type scale (design-system §3.2), plus two web-only marketing roles: hero and lead. */
export const roleClass = {
  hero: "type-hero",
  display: "type-display",
  h1: "type-h1",
  h2: "type-h2",
  h3: "type-h3",
  h4: "type-h4",
  lead: "type-lead",
  body: "type-body",
  bodyStrong: "type-body-strong",
  small: "type-small",
  caption: "type-caption",
  fieldLabel: "type-field-label",
  button: "type-button",
  label: "type-label",
  readoutXL: "type-readout-xl",
  readoutL: "type-readout-l",
  readoutM: "type-readout-m",
  readoutS: "type-readout-s",
  readoutXS: "type-readout-xs",
} as const;
export type RoleName = keyof typeof roleClass;

export const toneClass = {
  default: "text-foreground",
  secondary: "text-foreground-secondary",
  muted: "text-muted",
  tint: "text-tint",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  onSignal: "text-accent-foreground",
} as const;
export type Tone = keyof typeof toneClass;

type TextProps = {
  variant?: RoleName;
  tone?: Tone;
  as?: ElementType;
  /** Layout only: margin, width, alignment, wrapping. Never size, weight, tracking or colour. */
  className?: string;
  id?: string;
  children: ReactNode;
};

/** The only text in app code. `variant` picks the §3.2 role; `tone` picks a token colour. */
export function Text({ variant = "body", tone = "default", as: As = "p", className, id, children }: TextProps) {
  return (
    <As id={id} className={cn(roleClass[variant], toneClass[tone], className)}>
      {children}
    </As>
  );
}

const headingRole = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

/** h1–h4 as the element of the same level. `variant` lets a page hero use the hero role on its h1. */
export function Heading({
  level,
  variant,
  tone = "default",
  className,
  id,
  children,
}: {
  level: 1 | 2 | 3 | 4;
  variant?: RoleName;
  tone?: Tone;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const As = `h${level}` as const;
  return (
    <As id={id} className={cn(roleClass[variant ?? headingRole[level]], toneClass[tone], "text-balance", className)}>
      {children}
    </As>
  );
}

/** `small` muted: notes and descriptions. */
export function Note({ tone = "muted", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <Text variant="small" tone={tone} className={className}>
      {children}
    </Text>
  );
}

/**
 * The `label` role: Plex Mono 11/16, +0.08em, uppercase applied by CSS (strings stay sentence case). Only for
 * eyebrows, table headers, status words and panel meta. Never a section heading.
 */
export function Label({
  tone = "muted",
  as = "span",
  className,
  id,
  children,
}: {
  tone?: Tone;
  as?: ElementType;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Text variant="label" tone={tone} as={as} className={cn("block", className)} id={id}>
      {children}
    </Text>
  );
}

const valueRole = { xl: "readoutXL", l: "readoutL", m: "readoutM", s: "readoutS", xs: "readoutXS" } as const;
// Units at about 45% of the value, muted, sans (a separate run).
const unitRole = { xl: "h2", l: "h4", m: "small", s: "caption", xs: "caption" } as const;

/** Plex Mono only when the formatted string is digits and punctuation; anything else stays Inter with tabular digits. */
export const isMonoSafe = (s: string) => /^[\d\s.,:;%+\-−–/()'  ]+$/.test(s);

/** The only way to show a measured number: mono digits, the unit smaller and muted, never wrapped apart. */
export function Value({
  value,
  unit,
  unitFirst = false,
  size = "m",
  tone = "default",
  className,
}: {
  value: string;
  unit?: string;
  unitFirst?: boolean;
  size?: keyof typeof valueRole;
  tone?: Tone;
  className?: string;
}) {
  const mono = isMonoSafe(value);
  const u = unit ? (
    <span className={cn(roleClass[unitRole[size]], tone === "onSignal" ? toneClass.onSignal : toneClass.muted)}>
      {unitFirst ? `${unit} ` : ` ${unit}`}
    </span>
  ) : null;
  return (
    <span className={cn("inline-flex items-baseline whitespace-nowrap", className)}>
      {unitFirst ? u : null}
      <span
        className={cn(
          roleClass[valueRole[size]],
          toneClass[tone],
          !mono && "font-sans tabular-nums"
        )}
      >
        {value}
      </span>
      {unitFirst ? null : u}
    </span>
  );
}

/** Facets separated by a drawn 3pt dot, never a typed " · ". Read as a list. */
export function Meta({ items, tone = "muted", className }: { items: string[]; tone?: "muted" | "default"; className?: string }) {
  const shown = items.filter(Boolean);
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-2", className)}>
      {shown.map((item, i) => (
        <Fragment key={`${i}:${item}`}>
          {i > 0 ? (
            <li aria-hidden className={cn("size-[3px] rounded-mark", tone === "muted" ? "bg-muted" : "bg-foreground")} />
          ) : null}
          <li className={cn(roleClass.small, toneClass[tone === "muted" ? "muted" : "default"])}>{item}</li>
        </Fragment>
      ))}
    </ul>
  );
}
