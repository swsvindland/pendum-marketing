import type { ReactNode } from "react";
import { cn } from "@/vector/cn";
import { Glyph } from "@/vector/glyph";
import { check } from "@/vector/glyphs/check";

// No "use client" and no hooks: a page renders the table on the server (the reference tables under "How it is
// calculated" are in the HTML before anything is typed) and a tool renders it in the browser. The one check glyph
// is inlined from its module, so the client bundle never carries the icon table.

/**
 * A table of readouts (rep-max tables, zones, plate lists): 1pt rules, the header in the Label style, the first
 * column a row header in small secondary, every other cell end-aligned for `Value`. `gap` is the space before each
 * value column; `sm` fits a six-column table at 375.
 */
export function ReadoutTable({
  caption,
  columns,
  rows,
  highlight,
  highlightLabel,
  gap = "md",
  className,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
  /** Row index drawn in surface-secondary (the visitor's own row). */
  highlight?: number;
  /**
   * What the highlighted row is ("your level", "goal"): a tint check after its first cell, and these words for
   * screen readers, so the fill never carries it alone. Without it, the caller's first cell has to say it.
   */
  highlightLabel?: string;
  gap?: "md" | "sm";
  /** Layout only. */
  className?: string;
}) {
  const pad = gap === "sm" ? "ps-2" : "ps-3";
  return (
    <table className={cn("w-full border-collapse text-start", className)}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-separator">
          {columns.map((c, i) => (
            <th key={c} scope="col" className={cn("pb-2 type-label text-muted", i === 0 ? "text-start" : cn(pad, "text-end"))}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className={cn("border-b border-separator last:border-b-0", r === highlight && "bg-surface-secondary")}>
            {row.map((cell, i) =>
              i === 0 ? (
                <th key={i} scope="row" className="py-3 ps-0 text-start type-small text-foreground-secondary [font-weight:400]">
                  {r === highlight && highlightLabel ? (
                    <span className="inline-flex items-center gap-2">
                      {cell}
                      <Glyph markup={check} name="check" size={16} tone="tint" />
                      <span className="sr-only"> ({highlightLabel})</span>
                    </span>
                  ) : (
                    cell
                  )}
                </th>
              ) : (
                <td key={i} className={cn("py-3 text-end", pad)}>
                  {cell}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
