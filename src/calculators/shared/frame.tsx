import type { ReactNode } from "react";
import { getApp } from "@/content/apps";
import { calculators, categoryLabel } from "@/content/calculators";
import type { CalculatorMeta } from "@/content/types";
import { AppIcon, ButtonLink, Heading, Label, LinkButton, ListRow, Panel, RowList, Text } from "@/vector";
import { PageHeader } from "@/components/page";

export type Source = { label: string; href?: string };

/**
 * One calculator page: the header, the tool (inputs then result, side by side from 1024), how it is calculated,
 * the sources, the app that tracks it over time, and related calculators. The tool is the page's one action, so
 * the page has no primary button except the app link in the closing panel.
 */
export function CalculatorFrame({
  meta,
  intro,
  tool,
  method,
  sources,
  caveat,
}: {
  meta: CalculatorMeta;
  /** One or two sentences under the title. */
  intro: string;
  tool: ReactNode;
  /** The method: formulas, constants, reference bands. */
  method: ReactNode;
  sources: Source[];
  /** Shown under the method: limits of the estimate. */
  caveat?: string;
}) {
  const app = meta.app ? getApp(meta.app) : undefined;
  const related = calculators.filter((c) => c.slug !== meta.slug && (c.category === meta.category || c.app === meta.app)).slice(0, 4);
  return (
    <>
      <PageHeader eyebrow={`Calculator / ${categoryLabel[meta.category]}`} title={meta.title} subtitle={intro} />
      <div className="mx-auto w-full max-w-data px-gutter py-10 md:py-12">{tool}</div>

      <section aria-labelledby="method-title" className="border-t border-border">
        <div className="mx-auto grid max-w-data gap-10 px-gutter py-12 md:py-16 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <Label>Method</Label>
            <Heading level={2} id="method-title">
              How it is calculated
            </Heading>
            <div className="flex flex-col gap-4 type-body text-foreground-secondary [&_strong]:text-foreground [&_strong]:[font-weight:500]">
              {method}
            </div>
            {caveat ? (
              <Text variant="small" tone="muted" className="border-s-2 border-border-strong ps-3">
                {caveat}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <Label as="h2">Sources</Label>
            <ol className="flex flex-col gap-3">
              {sources.map((s) => (
                <li key={s.label} className="type-small text-foreground-secondary">
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-tint underline-offset-4 hover:underline">
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="next-title" className="border-t border-border">
        <div className="mx-auto grid max-w-data gap-6 px-gutter py-12 md:py-16 lg:grid-cols-2">
          {app ? (
            <Panel>
              <Panel.Header eyebrow={app.model === "purchase" ? "Track / Offline" : "Track / Synced"} />
              <Panel.Body>
                <div className="flex items-center gap-4">
                  <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={56} />
                  <div className="flex flex-col">
                    <Heading level={2} variant="h3" id="next-title">
                      Track it over time in {app.name}
                    </Heading>
                    <Text variant="small" tone="muted">
                      {app.model === "purchase" ? "One-time purchase. No account." : "Subscription. Syncs across devices."}
                    </Text>
                  </div>
                </div>
                {app.tagline ? <Text tone="secondary">{app.tagline}</Text> : null}
              </Panel.Body>
              <Panel.Footer>
                <ButtonLink href={`/apps/${app.slug}`} variant="primary" icon="forward" iconPosition="end">
                  See {app.name}
                </ButtonLink>
              </Panel.Footer>
            </Panel>
          ) : (
            <Panel>
              <Panel.Header eyebrow="Track / Apps" />
              <Panel.Body>
                <Heading level={2} variant="h3" id="next-title">
                  Five apps on one design system
                </Heading>
                <Text tone="secondary">
                  A subscription that syncs across devices, or one-time purchases that keep every record on your phone.
                </Text>
              </Panel.Body>
              <Panel.Footer>
                <ButtonLink href="/apps" variant="primary" icon="forward" iconPosition="end">
                  See the apps
                </ButtonLink>
              </Panel.Footer>
            </Panel>
          )}
          <Panel inset="none">
            <div className="px-4 pt-4 min-[600px]:px-6 min-[600px]:pt-6">
              <Label as="h2">Related calculators</Label>
            </div>
            <RowList className="mt-2">
              {related.map((c) => (
                <ListRow key={c.slug} title={c.title} description={c.description} icon={c.icon} href={`/calculators/${c.slug}`} />
              ))}
            </RowList>
            <div className="mt-auto border-t border-separator px-4 py-3 min-[600px]:px-6">
              <LinkButton href="/calculators" forward>
                All calculators
              </LinkButton>
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}

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

/** A formula in Plex Mono on a surface-secondary band, scrollable rather than wrapped. */
export function Formula({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-control border border-border bg-surface-secondary px-4 py-3 type-readout-xs text-foreground">
      <code>{children}</code>
    </pre>
  );
}
