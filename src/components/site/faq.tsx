import type { ReactNode } from "react";
import { Icon, Panel, Text } from "@/vector";

export type Question = { question: string; answer: ReactNode };

/**
 * Questions as native disclosure rows in a row panel (§5.6 geometry): 44 minimum, px-4 py-3, a separator inset 16
 * above every row but the first, and a down glyph that flips when open. No script: <details> does the work, so
 * every answer is in the page and found by in-page search.
 */
export function Faq({ items }: { items: Question[] }) {
  return (
    <Panel inset="none">
      <ul className="flex flex-col">
        {items.map(({ question, answer }) => (
          <li
            key={question}
            className="relative before:absolute before:start-4 before:end-0 before:top-0 before:h-px before:bg-separator first:before:hidden"
          >
            <details className="group">
              <summary
                className={
                  "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 " +
                  "transition-colors duration-100 ease-standard hover:bg-surface-secondary active:bg-surface-secondary " +
                  "focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden"
                }
              >
                <Text variant="bodyStrong" as="span">
                  {question}
                </Text>
                <Icon name="down" size={16} tone="muted" className="group-open:-scale-y-100" />
              </summary>
              <div className="flex flex-col gap-3 px-4 pt-1 pb-4 type-body text-pretty text-foreground-secondary [&_strong]:text-foreground [&_strong]:[font-weight:500]">
                {answer}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
