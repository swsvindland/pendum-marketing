import type { ReactNode } from "react";
import { Section } from "@/components/page";
import type { App } from "@/content/types";
import { Callout, LinkButton, Panel, Text, cn } from "@/vector";
import { webNote } from "./model";

/**
 * A readout row for a value that is a sentence: the label above and the text below, start-aligned, on the same
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
 * What is left after the at-a-glance table states the facts: the caveats that travel with the app's claims
 * ("Good to know") and, for an app with a web version (stores.web present), the Web row. The web sentence comes
 * from webNote, so it describes the version while its address is not public and never promises a launch. The
 * section has no eyebrow: the heading says all there is to say (§10). Support is one link away for the rest.
 */
export function AppDetails({ app }: { app: App }) {
  const web = app.stores.web !== undefined;
  if (!web && !app.caveats.length) return null;
  return (
    <Section id="details" title="Details" bordered>
      <div className={cn("grid items-start gap-6", web && "lg:grid-cols-2")}>
        {web ? (
          <Panel>
            <Panel.Body>
              <div>
                <ProseRow label="Web">{webNote(app)}</ProseRow>
              </div>
            </Panel.Body>
          </Panel>
        ) : null}
        {app.caveats.length ? (
          <div className={cn("flex flex-col gap-4", !web && "max-w-form")}>
            <Callout tone="info" title="Good to know">
              <ul className="flex flex-col gap-3">
                {app.caveats.map((c) => (
                  <li key={c} className="text-pretty">
                    {c}
                  </li>
                ))}
              </ul>
            </Callout>
            <div>
              <LinkButton href="/support" forward>
                Open support
              </LinkButton>
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
