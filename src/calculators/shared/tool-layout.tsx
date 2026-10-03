import type { ReactNode } from "react";
import { Panel } from "@/vector";

// The parts of a calculator page that its client tool also uses. Nothing here reaches the site content, so a tool
// that imports this module ships only its own code; the page frame (frame.tsx) stays on the server.

/** The tool layout: inputs in a Panel at start, the result at end (stacked under 1024). */
export function ToolLayout({
  inputs,
  result,
  inputsEyebrow = "Input / Measurements",
}: {
  inputs: ReactNode;
  result: ReactNode;
  inputsEyebrow?: string;
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Panel as="section" aria-labelledby="inputs-title">
        <Panel.Header eyebrow={inputsEyebrow} />
        <h2 id="inputs-title" className="sr-only">
          Your details
        </h2>
        <Panel.Body className="gap-4">{inputs}</Panel.Body>
      </Panel>
      {result}
    </div>
  );
}

/**
 * A formula in Plex Mono inside a 1pt border, with no fill. Long lines scroll rather than wrap, so the box is a
 * named region in the tab order and the arrow keys scroll it. `label` names it when a page has more than one.
 */
export function Formula({ label = "Formula", children }: { label?: string; children: ReactNode }) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label={label}
      className="overflow-x-auto rounded-control border border-border px-4 py-3 type-readout-xs text-foreground"
    >
      <code>{children}</code>
    </pre>
  );
}
