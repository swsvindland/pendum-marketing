import { Accordion } from "@heroui/react/accordion";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icon } from "./icon";

export type DisclosureItem = { id?: string; question: string; answer: ReactNode };

/**
 * Questions that open in place (FAQ), on HeroUI's Accordion (React Aria disclosure: the trigger is a button with
 * aria-expanded, the question a heading). Its own entry point (@/vector/disclosure), so only pages with questions
 * load the Accordion. Row geometry from §5.6 (components.css, section 4): 44 minimum, px-4 py-3, 1pt separators
 * inset 16, the kit `down` glyph that turns when open, answers as a 12-gap column. `panel` draws the rows in a
 * Panel (focus drawn inside, since the panel clips); `plain` sits on the canvas between 1pt rules, flush with the
 * text column. Several can be open at once.
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
  return (
    <Accordion
      allowsMultipleExpanded
      className={cn(
        "kit-disclosures",
        look === "panel"
          ? "kit-disclosures--panel overflow-hidden rounded-panel border border-border bg-surface"
          : "kit-disclosures--plain border-y border-separator",
        className
      )}
    >
      {items.map((item) => (
        <Accordion.Item key={item.id ?? item.question} id={item.id ?? item.question}>
          <Accordion.Heading level={headingLevel}>
            <Accordion.Trigger>
              <span className="text-start">{item.question}</span>
              <Accordion.Indicator>
                <Icon name="down" size={16} />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.answer}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
