import type { Specimen as SpecimenData } from "@/content/types";
import { Meter, Panel, ReadoutRow, Text, Value } from "@/vector";

/**
 * An app's main readout drawn as a Vector panel: the eyebrow in DOMAIN / OBJECT form, its main value, an
 * optional meter and up to three readout rows. Example data, never a claim: `exampleLabel` sits in the meta slot
 * so it travels with every screenshot of the page. The caption is a phrase, so a number in it stays Inter (§3.3).
 */
export function Specimen({
  data,
  tone = "default",
  signal = false,
  hero = signal,
  exampleLabel = "Example",
  className,
}: {
  data: SpecimenData;
  /** live: a 3pt signal start rule, for the one specimen that represents something in progress. */
  tone?: "default" | "live";
  /** The page's one hero meter (§2.4: at most one signal meter per page). Others draw the neutral meter. */
  signal?: boolean;
  /**
   * The page's one hero value (§3.2: readoutXL once per screen); others are readoutL. Defaults to `signal`, since
   * the specimen that carries the page's hero meter is its hero.
   */
  hero?: boolean;
  exampleLabel?: string;
  className?: string;
}) {
  return (
    <Panel tone={tone} className={className}>
      {/* An example of an app screen, not a section of the page: its eyebrow stays out of the heading list. */}
      <Panel.Header eyebrow={data.eyebrow} meta={data.meta ?? exampleLabel} heading={false} />
      <Panel.Body>
        <div className="flex flex-col gap-1">
          <Value value={data.hero.value} unit={data.hero.unit} size={hero ? "xl" : "l"} />
          {data.hero.caption ? (
            <Text variant="small" tone="secondary">
              {data.hero.caption}
            </Text>
          ) : null}
        </div>
        {data.meter ? (
          <Meter
            tone={signal ? "signal" : "neutral"}
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
