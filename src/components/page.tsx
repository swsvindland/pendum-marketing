import type { ReactNode } from "react";
import { Heading, Label, Text, cn } from "@/vector";

/**
 * The web Screen header (§5.1): optional mono eyebrow (live context or DOMAIN / OBJECT, never the title again),
 * the h1, a muted subtitle, one action row, then a 1pt rule. `hero` uses the large web hero role.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  hero = false,
  aside,
  rule = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  hero?: boolean;
  aside?: ReactNode;
  rule?: boolean;
}) {
  return (
    <header className={cn(rule && "border-b border-border")}>
      <div
        className={cn(
          "mx-auto grid max-w-data gap-10 px-gutter",
          hero ? "py-12 md:py-20" : "py-10 md:py-14",
          aside && "lg:grid-cols-[1.15fr_1fr] lg:items-center"
        )}
      >
        <div className="flex flex-col gap-4">
          {eyebrow ? <Label>{eyebrow}</Label> : null}
          <Heading level={1} variant={hero ? "hero" : "display"} className="max-w-[22ch]">
            {title}
          </Heading>
          {subtitle ? (
            <Text variant="lead" tone="secondary" className="max-w-[60ch] text-pretty">
              {subtitle}
            </Text>
          ) : null}
          {actions ? <div className="mt-2 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </header>
  );
}

/** A page section on the data column (1040) with the section gap, an optional eyebrow, heading and intro. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  action,
  children,
  className,
  bordered = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** A 1pt rule above the section. */
  bordered?: boolean;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(bordered && "border-t border-border", className)}
    >
      <div className="mx-auto flex max-w-data flex-col gap-6 px-gutter py-12 md:py-16">
        {title || eyebrow ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
            <div className="flex max-w-[60ch] flex-col gap-2">
              {eyebrow ? <Label>{eyebrow}</Label> : null}
              {title ? (
                <Heading level={2} id={headingId}>
                  {title}
                </Heading>
              ) : null}
              {intro ? (
                <Text tone="secondary" className="text-pretty">
                  {intro}
                </Text>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
