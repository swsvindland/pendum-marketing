import type { ReactNode } from "react";
import { Label, Panel, Text, Value, cn } from "@/vector";

/**
 * The results side of a calculator: a Panel whose header names the result in DOMAIN / OBJECT form. The summary
 * sentence (`announce`) is a polite live region, so screen readers hear the result once it settles, not each digit.
 */
export function ResultPanel({
  eyebrow,
  meta,
  announce,
  children,
}: {
  eyebrow: string;
  meta?: string;
  /** One plain sentence that states the result ("BMI 24.7, healthy weight."). */
  announce?: string;
  children: ReactNode;
}) {
  return (
    <Panel as="section" aria-labelledby="result-title" className="lg:sticky lg:top-24">
      <Panel.Header eyebrow={eyebrow} meta={meta} />
      <h2 id="result-title" className="sr-only">
        Result
      </h2>
      <p className="sr-only" aria-live="polite">
        {announce ?? ""}
      </p>
      <Panel.Body>{children}</Panel.Body>
    </Panel>
  );
}

/** Start-aligned empty state where the result will be: the code as a Label, the fact, no illustration (§5.7). */
export function EmptyResult({ code = "No input", children }: { code?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <Label>{code}</Label>
      <Text tone="secondary">{children}</Text>
    </div>
  );
}

/** The one hero value of a result, with its caption. */
export function HeroValue({ value, unit, caption }: { value: string; unit?: string; caption?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Value value={value} unit={unit} size="xl" />
      {caption ? <Text variant="small" tone="secondary">{caption}</Text> : null}
    </div>
  );
}

export type Band = { label: string; from: number | null; to: number | null; range: string };

/**
 * A reference scale (§2.5 band): neutral segments separated by 2pt gaps, the current band in foreground-secondary,
 * a 2pt foreground index tick at the value, and every band named in text below. No hues: the word carries it.
 */
export function BandScale({
  bands,
  value,
  min,
  max,
  label,
}: {
  bands: Band[];
  value: number | null;
  /** Visual domain of the scale. */
  min: number;
  max: number;
  label: string;
}) {
  const pos = (n: number) => ((Math.min(max, Math.max(min, n)) - min) / (max - min)) * 100;
  const current = value === null ? -1 : bands.findIndex((b) => (b.from === null || value >= b.from) && (b.to === null || value < b.to));
  return (
    <figure className="flex flex-col gap-3" aria-label={label}>
      <div aria-hidden className="relative h-3">
        <div className="absolute inset-x-0 top-1 flex h-1 gap-0.5">
          {bands.map((b, i) => {
            const start = pos(b.from ?? min);
            const end = pos(b.to ?? max);
            return (
              <span
                key={b.label}
                className={cn("h-full rounded-mark", i === current ? "bg-foreground-secondary" : "bg-surface-tertiary")}
                style={{ width: `${end - start}%` }}
              />
            );
          })}
        </div>
        {value !== null ? (
          <span
            className="absolute top-0 h-3 w-0.5 -translate-x-1/2 bg-foreground rtl:translate-x-1/2"
            style={{ insetInlineStart: `${pos(value)}%` }}
          />
        ) : null}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {bands.map((b, i) => (
          <li key={b.label} className="flex flex-col">
            <span className={cn("type-small", i === current ? "text-foreground [font-weight:500]" : "text-muted")}>
              {b.label}
              {i === current ? <span className="sr-only"> (your result)</span> : null}
            </span>
            <span className="type-readout-xs text-muted">{b.range}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** A two-column table of readouts (rep-max tables, zones, plate lists). Header in the Label style. */
export function ReadoutTable({
  caption,
  columns,
  rows,
  highlight,
}: {
  caption: string;
  columns: string[];
  rows: ReactNode[][];
  /** Row index drawn in surface-secondary (the visitor's own row). */
  highlight?: number;
}) {
  return (
    <table className="w-full border-collapse text-start">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-separator">
          {columns.map((c, i) => (
            <th key={c} scope="col" className={cn("pb-2 type-label text-muted", i === 0 ? "text-start" : "text-end")}>
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
                <th key={i} scope="row" className="py-2.5 ps-0 text-start type-small text-foreground-secondary [font-weight:400]">
                  {cell}
                </th>
              ) : (
                <td key={i} className="py-2.5 text-end">
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
