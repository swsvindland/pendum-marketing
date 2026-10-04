import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/vector";

// Rows draw a 1pt separator above every row but the first, like ReadoutRow and ListRow.
const row = "border-t border-separator py-3 first:border-t-0 first:pt-0 last:pb-0";
// Emphasis inside a fact: foreground at 500, never bold.
const emphasis = "[&_strong]:text-foreground [&_strong]:[font-weight:500]";

/** Plain statements as a ruled list, one fact per row, in body secondary. */
export function FactList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item, i) => (
        <li key={i} className={cn(row, "type-body text-pretty text-foreground-secondary", emphasis)}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export type TermItem = {
  term: string;
  detail: ReactNode;
  /** Makes the term a link (an app's page under its definition). */
  href?: string;
};

/**
 * Term and detail pairs as a ruled description list: the term in body strong (a tint link when `href` is set,
 * with a 44 target inside the 24 line), the detail in small secondary.
 */
export function TermList({ items, className }: { items: TermItem[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col", className)}>
      {items.map(({ term, detail, href }) => (
        <div key={term} className={cn(row, "flex flex-col gap-1")}>
          <dt className="type-body-strong text-foreground">
            {href ? (
              <Link
                href={href}
                className="-my-2.5 inline-flex min-h-11 items-center rounded-mark text-tint underline-offset-4 hover:underline"
              >
                {term}
              </Link>
            ) : (
              term
            )}
          </dt>
          <dd className={cn("type-small text-pretty text-foreground-secondary", emphasis)}>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}
