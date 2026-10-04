import type { ReactNode } from "react";
import { Heading, Note } from "@/vector";

// Server only: the reference tables under "How it is calculated" are computed from src/lib/calc at build time and
// rendered in the HTML, so a reader (or a crawler) sees the table before anything is typed.

/**
 * A reference table in the method column: an h3 under the "How it is calculated" h2, the table (ReadoutTable from
 * ./table, or a list), and a note on how to read it. The table's own caption stays for screen readers.
 */
export function Reference({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  /** How to read the table: the edges, the example, the caveat that travels with it. */
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <Heading level={3} variant="h4" id={id}>
        {title}
      </Heading>
      {children}
      {note ? <Note className="text-pretty">{note}</Note> : null}
    </div>
  );
}
