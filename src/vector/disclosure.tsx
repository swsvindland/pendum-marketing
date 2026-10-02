import { Accordion } from "@heroui/react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export type DisclosureItem = { id?: string; question: string; answer: ReactNode };

/**
 * Questions that open in place (FAQ), on HeroUI's Accordion (React Aria disclosure: the trigger is a button with
 * aria-expanded, the question a heading). Row geometry from §5.6 (components.css): 44 minimum, px-4 py-3, 1pt
 * separators inset 16, a down glyph that turns when open. `panel` draws the rows in a Panel; `plain` sits on the
 * canvas between 1pt rules. Several can be open at once.
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
        look === "panel"
          ? "overflow-hidden rounded-panel border border-border bg-surface"
          : "border-y border-separator [&_.accordion\_\_item::after]:start-0",
        className
      )}
    >
      {items.map((item) => (
        <Accordion.Item key={item.id ?? item.question} id={item.id ?? item.question}>
          <Accordion.Heading level={headingLevel}>
            <Accordion.Trigger className={cn(look === "plain" && "px-0")}>
              <span className="text-start">{item.question}</span>
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body
              className={cn(
                "[&_.accordion\_\_body-inner]:flex [&_.accordion\_\_body-inner]:flex-col [&_.accordion\_\_body-inner]:gap-3",
                "[&_strong]:text-foreground [&_strong]:[font-weight:500] [&_a]:text-tint [&_a]:underline [&_a]:underline-offset-4",
                look === "plain" && "[&_.accordion\_\_body-inner]:px-0 [&_.accordion\_\_body-inner]:pe-8"
              )}
            >
              {item.answer}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
