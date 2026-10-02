import type { Specimen as SpecimenData } from "@/content/types";
import { Meter, Panel, ReadoutRow, Text, Value } from "@/vector";

/**
 * An app's main readout drawn as a Vector panel: the eyebrow in DOMAIN / OBJECT form, one hero value, an
 * optional signal meter (the panel's one hero goal) and up to three readout rows. Example data, never a claim:
 * `exampleLabel` sits in the meta slot so it travels with every screenshot of the page.
 */
export function Specimen({
  data,
  tone = "default",
  exampleLabel = "Example",
  className,
}: {
  data: SpecimenData;
  /** live: a 3pt signal start rule, for the one specimen that represents something in progress. */
  tone?: "default" | "live";
  exampleLabel?: string;
  className?: string;
}) {
  return (
    <Panel tone={tone} className={className}>
      <Panel.Header eyebrow={data.eyebrow} meta={data.meta ?? exampleLabel} />
      <Panel.Body>
        <div className="flex flex-col gap-1">
          <Value value={data.hero.value} unit={data.hero.unit} size="xl" />
          {data.hero.caption ? (
            <Text variant="small" tone="secondary">
              {data.hero.caption}
            </Text>
          ) : null}
        </div>
        {data.meter ? (
          <Meter
            tone="signal"
            value={data.meter.value}
            max={data.meter.max}
            target={data.meter.target}
            label={data.eyebrow}
            valueText={data.meter.valueText}
            className="my-1"
          />
        ) : null}
        {data.rows?.length ? (
          <div>
            {data.rows.map((r) => (
              <ReadoutRow key={r.label} label={r.label}>
                <Value value={r.value} unit={r.unit} size="s" />
              </ReadoutRow>
            ))}
          </div>
        ) : null}
      </Panel.Body>
    </Panel>
  );
}
