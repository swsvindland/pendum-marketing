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
        <Panel.Header eyebrow={inputsEyebrow} heading={false} />
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
 * A formula in Plex Mono inside a 1pt border, with no fill. Pages keep each line to about 40 characters, the
 * width of the box on a phone; a longer one wraps rather than clipping, so the box never scrolls and is not a
 * tab stop. `label` names the region when a page has more than one.
 */
export function Formula({ label = "Formula", children }: { label?: string; children: ReactNode }) {
  return (
    <pre
      role="region"
      aria-label={label}
      className="whitespace-pre-wrap [overflow-wrap:anywhere] rounded-control border border-border px-4 py-3 type-readout-xs text-foreground"
    >
      <code>{children}</code>
    </pre>
  );
}
