import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { Heading, Label, Note, Text } from "./text";

type PanelTone = "default" | "live" | "critical";

export type PanelProps = {
  /** live: a 3pt signal start rule (a fill, §2.4). critical: danger border. */
  tone?: PanelTone;
  /** none: no padding, for row lists. */
  inset?: "md" | "none";
  /** A whole-panel link. Pressed (and hovered) is surface-secondary. */
  href?: string;
  as?: "div" | "section" | "article" | "li";
  /** Layout only: grid placement, margin, height. */
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

/** White on white, separated by a 1pt border. No shadow, no tinted or "hero" panels (§5.1). */
function PanelRoot({ tone = "default", inset = "md", href, as: As = "div", className, children, ...aria }: PanelProps) {
  const classes = cn(
    "relative flex flex-col overflow-hidden rounded-panel border bg-surface",
    tone === "critical" ? "border-danger" : "border-border",
    inset === "md" && "gap-3 p-4 min-[600px]:p-6",
    tone === "live" && "border-s-0 ps-[calc(1rem+3px)] min-[600px]:ps-[calc(1.5rem+3px)]",
    href && "transition-colors duration-100 ease-standard hover:bg-surface-secondary active:bg-surface-secondary",
    className
  );
  const rule =
    tone === "live" ? <span aria-hidden className="absolute inset-y-0 start-0 w-[3px] bg-accent" /> : null;
  if (href) {
    const link = (
      <Link href={href} className={cn(classes, As === "li" && "h-full")} {...aria}>
        {rule}
        {children}
      </Link>
    );
    return As === "li" ? <li className="flex flex-col">{link}</li> : link;
  }
  return (
    <As className={classes} {...aria}>
      {rule}
      {children}
    </As>
  );
}

/**
 * Eyebrow at start and meta (readoutXS, muted) at end, over a full-bleed 1pt separator. Eyebrows are nouns or
 * live context in DOMAIN / OBJECT form ("Record / Weight"), never a restatement of the title.
 */
function PanelHeader({
  eyebrow,
  meta,
  title,
  titleLevel = 3,
  action,
  id,
}: {
  eyebrow: string;
  meta?: ReactNode;
  title?: string;
  titleLevel?: 2 | 3 | 4;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="-mx-4 flex flex-col gap-2 border-b border-separator px-4 pb-3 min-[600px]:-mx-6 min-[600px]:px-6">
      <div className="flex min-h-4 items-center justify-between gap-3">
        <Label as="span">{eyebrow}</Label>
        {meta ? (
          <span className="type-readout-xs text-muted">{meta}</span>
        ) : null}
        {action}
      </div>
      {title ? (
        <Heading level={titleLevel} variant="h3" id={id}>
          {title}
        </Heading>
      ) : null}
    </div>
  );
}

function PanelTitle({ level = 3, id, children }: { level?: 2 | 3 | 4; id?: string; children: ReactNode }) {
  return (
    <Heading level={level} variant="h3" id={id}>
      {children}
    </Heading>
  );
}

function PanelDescription({ children }: { children: ReactNode }) {
  return <Note>{children}</Note>;
}

function PanelBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col gap-3", className)}>{children}</div>;
}

function PanelFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "-mx-4 mt-auto flex flex-wrap items-center gap-3 border-t border-separator px-4 pt-3 min-[600px]:-mx-6 min-[600px]:px-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export const Panel = Object.assign(PanelRoot, {
  Header: PanelHeader,
  Title: PanelTitle,
  Description: PanelDescription,
  Body: PanelBody,
  Footer: PanelFooter,
});

/** A 1pt separator rule, full width. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-separator", className)} />;
}

/** A labelled pair for readouts inside a panel: label at start, value at end, separated by a 1pt rule. */
export function ReadoutRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-t border-separator first:border-t-0">
      <Text variant="small" tone="secondary" as="span">
        {label}
      </Text>
      <span className="text-end">{children}</span>
    </div>
  );
}
