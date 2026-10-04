"use client";

import type { ReactNode } from "react";
import { cn } from "@/vector/cn";
import { Panel } from "@/vector/panel";
import { Label, Text, Value } from "@/vector/text";
import { SettledAnnouncement } from "./announce";
import { useNextStep } from "./next-step";

// Leaf imports only: the barrel re-exports Icon, which reads the whole icon table, and a client file must not ship
// it. The one glyph a result needs (the highlight check) is in ./table.

export { firstInvalid } from "./measure";
export { ReadoutTable } from "./table";

/**
 * The results side of a calculator: a Panel whose header names the result in DOMAIN / OBJECT form. The summary
 * sentence (`announce`) goes to a polite live region once it settles, so screen readers hear the result, not each
 * digit on the way to it. Once there is a result, the footer offers the next step the frame provides (what the app
 * does with this number, and the link to it); an empty state shows no footer.
 */
export function ResultPanel({
  eyebrow,
  meta,
  announce,
  hasResult = announce !== undefined,
  children,
}: {
  eyebrow: string;
  meta?: string;
  /** One plain sentence that states the result ("BMI 24.7, healthy weight."). */
  announce?: string;
  /** Whether a result is shown. Defaults to whether there is a sentence to announce. */
  hasResult?: boolean;
  children: ReactNode;
}) {
  const next = useNextStep();
  return (
    <Panel as="section" aria-labelledby="result-title" className="lg:sticky lg:top-24">
      <Panel.Header eyebrow={eyebrow} meta={meta} heading={false} />
      <h2 id="result-title" className="sr-only">
        Result
      </h2>
      <SettledAnnouncement text={announce ?? ""} />
      <Panel.Body>{children}</Panel.Body>
      {next && hasResult ? <Panel.Footer>{next}</Panel.Footer> : null}
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

/**
 * The empty state for a filled form with one entry out of range: it names the field (from `firstInvalid`) rather
 * than asking for everything again. `outcome` is the result as the "No input" sentence ends ("your BMI").
 */
export function CheckInput({ field, outcome }: { field: string; outcome: string }) {
  return (
    <EmptyResult code="Check input">
      Correct the {field} to see {outcome}.
    </EmptyResult>
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
