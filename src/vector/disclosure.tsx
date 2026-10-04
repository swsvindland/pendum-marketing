import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icon } from "./icon";

export type DisclosureItem = { id?: string; question: string; answer: ReactNode };

/**
 * Questions that open in place (FAQ), on native <details>/<summary>: a server component with no script and no
 * HeroUI, so the answers are in the document and open without JavaScript, and the summary carries the expanded
 * state for assistive technology by itself. The question is a heading inside the summary (valid phrasing with
 * heading content), so the heading list reaches every question. Row geometry from §5.6 (components.css, section
 * 4): 44 minimum, px-4 py-3, 1pt separators inset 16, the kit `down` glyph that turns when open, answers as a
 * 12-gap column. `panel` draws the rows in a Panel (focus drawn inside, since the panel clips); `plain` sits on the
 * canvas between 1pt rules, flush with the text column. Several can be open at once.
 */
export function Disclosures({
  items,
  look = "panel",
  headingLevel = 3,
  className,
}: {
  items: DisclosureItem[];
  look?: "panel" | "plain";
  /** The questions' heading level under the section heading (h3 under an h2). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const Question = `h${headingLevel}` as const;
  return (
    <div
      className={cn(
        "kit-disclosures",
        look === "panel"
          ? "kit-disclosures--panel overflow-hidden rounded-panel border border-border bg-surface"
          : "kit-disclosures--plain border-y border-separator",
        className
      )}
    >
      {items.map((item) => (
        <details key={item.id ?? item.question} className="kit-disclosure">
          <summary className="kit-disclosure__trigger">
            <Question className="kit-disclosure__question">{item.question}</Question>
            <Icon name="down" size={16} className="kit-disclosure__indicator" />
          </summary>
          <div className="kit-disclosure__body">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
