import { Panel, ReadoutRow, Value } from "@/vector";
import type { CostLine } from "./models";

/**
 * What three years cost, one readout row per line, from the owner's own prices only (models.ts threeYearLines).
 * The page renders it only when at least one price exists; it never shows a competitor's price.
 */
export function ThreeYears({ lines }: { lines: CostLine[] }) {
  if (!lines.length) return null;
  return (
    <Panel className="max-w-form">
      <Panel.Header eyebrow="Cost / Three years" title="At today’s store prices" />
      <Panel.Body className="gap-0">
        {lines.map((line) => (
          <ReadoutRow key={line.label} label={line.label} stack>
            <Value value={line.value} size="s" />
          </ReadoutRow>
        ))}
      </Panel.Body>
    </Panel>
  );
}
