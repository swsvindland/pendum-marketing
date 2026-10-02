import type { ReactNode } from "react";
import { Section } from "@/components/page";
import type { App } from "@/content/types";
import { Callout, Panel, ReadoutRow, Text, Value } from "@/vector";
import { listFormat, modelLabel } from "./model";

/**
 * A ReadoutRow for a value that is a sentence: the label above and the text below, start-aligned, on the same
 * 1pt rule. A paragraph set flush to the end edge is hard to read on a phone.
 */
function ProseRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-separator py-3 first:border-t-0">
      <Text variant="small" tone="secondary" as="span">
        {label}
      </Text>
      <Text variant="small" as="span" className="text-pretty">
        {children}
      </Text>
    </div>
  );
}

/**
 * The spec sheet: how the app is sold, the account, platforms, languages and units as readout rows in a panel,
 * beside the caveats that travel with its claims ("Good to know"). Two columns from 1024, stacked below.
 */
export function AppDetails({ app }: { app: App }) {
  const languages = app.languages;
  return (
    <Section id="details" eyebrow={`${app.label} / Specification`} title="Details" bordered>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel>
          <Panel.Body>
            <div>
              <ReadoutRow label="Sold as">
                <Text variant="small" as="span">
                  {modelLabel(app)}
                </Text>
              </ReadoutRow>
              {app.price ? (
                <ReadoutRow label="Price">
                  <Value value={app.price} size="s" />
                </ReadoutRow>
              ) : null}
              <ReadoutRow label="Account">
                <Text variant="small" as="span">
                  {app.model === "subscription" ? "Required" : "None"}
                </Text>
              </ReadoutRow>
              {app.platforms.length ? (
                <ReadoutRow label="Platforms">
                  <Text variant="small" as="span" className="block py-3 text-pretty">
                    {listFormat.format(app.platforms)}
                  </Text>
                </ReadoutRow>
              ) : null}
              {languages.length === 1 ? (
                <ReadoutRow label="Language">
                  <Text variant="small" as="span">
                    {languages[0]}
                  </Text>
                </ReadoutRow>
              ) : languages.length > 1 ? (
                <div className="border-t border-separator pb-3">
                  <ReadoutRow label="Languages">
                    <Value value={String(languages.length)} unit="languages" size="s" />
                  </ReadoutRow>
                  <Text variant="caption" tone="muted" className="text-pretty">
                    {listFormat.format(languages)}
                  </Text>
                </div>
              ) : null}
              {app.units ? <ProseRow label="Units">{app.units}</ProseRow> : null}
            </div>
          </Panel.Body>
        </Panel>
        {app.caveats.length ? (
          <Callout tone="info" title="Good to know">
            <ul className="flex flex-col gap-3">
              {app.caveats.map((c) => (
                <li key={c} className="text-pretty">
                  {c}
                </li>
              ))}
            </ul>
          </Callout>
        ) : null}
      </div>
    </Section>
  );
}
