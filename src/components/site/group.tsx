import type { ReactNode } from "react";
import { Heading, Note, cn } from "@/vector";

/**
 * A titled group on the data column: the heading, an optional meta line and intro at start, the content at end
 * from 1024 up, stacked below that. A footnote sits under the content, as in the SettingsSection anatomy (§5.6).
 * Groups stack with a 1pt rule between them, never above the first.
 */
export function Group({
  id,
  title,
  level = 2,
  meta,
  intro,
  footnote,
  className,
  children,
}: {
  id: string;
  title: string;
  level?: 2 | 3;
  /** A short readout under the heading, such as a count. */
  meta?: ReactNode;
  intro?: ReactNode;
  footnote?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        // scroll-mt clears the sticky site header (64) when the group is opened by its #id.
        "grid scroll-mt-20 gap-4 border-t border-border py-8 first:border-t-0 first:pt-0 last:pb-0",
        "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <Heading level={level} variant="h3" id={headingId}>
          {title}
        </Heading>
        {meta ? <div>{meta}</div> : null}
        {intro ? <Note className="max-w-[48ch] text-pretty">{intro}</Note> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {children}
        {footnote ? <div className="flex flex-wrap items-center gap-x-4 gap-y-1">{footnote}</div> : null}
      </div>
    </section>
  );
}
