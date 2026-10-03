import type { ReactNode } from "react";
import { getApp } from "@/content/apps";
import { calculators, categoryLabel, categoryOrder } from "@/content/calculators";
import type { CalculatorMeta } from "@/content/types";
import { AppIcon, ButtonLink, Heading, LinkButton, ListRow, Panel, RowList, Text } from "@/vector";
import { PageHeader } from "@/components/page";

// Server only: the frame reads the site content. Client tools import ToolLayout from ./tool-layout, never this file;
// the re-export is for the pages' Formula and for tools not yet moved over.
export { Formula, ToolLayout } from "./tool-layout";

export type Source = { label: string; href?: string };

/** Related calculators: up to 4 that share the category or the app, and never fewer than 3. */
const RELATED_MIN = 3;
const RELATED_MAX = 4;

/**
 * The calculators that share this one's category or app, then, to reach RELATED_MIN, one from each other category
 * in the content's order, round by round. Water and heart rate are alone in theirs and share no app.
 */
function relatedTo(meta: CalculatorMeta) {
  const others = calculators.filter((c) => c.slug !== meta.slug);
  const close = others.filter((c) => c.category === meta.category || (meta.app !== undefined && c.app === meta.app));
  const rest = categoryOrder
    .filter((category) => category !== meta.category)
    .map((category) => others.filter((c) => c.category === category && !close.includes(c)));
  const spread: CalculatorMeta[] = [];
  for (let round = 0; rest.some((list) => round < list.length); round++)
    for (const list of rest) if (list[round]) spread.push(list[round]);
  const count = Math.max(RELATED_MIN, Math.min(RELATED_MAX, close.length));
  return { items: [...close, ...spread].slice(0, count), close: close.length > 0 };
}

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
  const related = relatedTo(meta);
  return (
    <>
      <PageHeader eyebrow={`Calculator / ${categoryLabel[meta.category]}`} title={meta.title} subtitle={intro} />
      <div className="mx-auto w-full max-w-data px-gutter py-10 md:py-12">{tool}</div>

      <section aria-labelledby="method-title" className="border-t border-border">
        <div className="mx-auto grid max-w-data grid-cols-[minmax(0,1fr)] gap-10 px-gutter py-12 md:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
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
            <Heading level={3}>Sources</Heading>
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

      <div className="border-t border-border">
        <div className="mx-auto grid max-w-data gap-6 px-gutter py-12 md:py-16 lg:grid-cols-2">
          {app ? (
            <Panel as="section" aria-labelledby="next-title">
              <Panel.Header eyebrow={app.model === "purchase" ? "Track / Offline" : "Track / Synced"} />
              <Panel.Body>
                <div className="flex items-center gap-4">
                  <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={56} />
                  <div className="flex flex-col">
                    <Heading level={2} variant="h3" id="next-title">
                      {meta.track ?? `Track it over time in ${app.name}`}
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
            <Panel as="section" aria-labelledby="next-title">
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
          <Panel as="section" inset="none" aria-labelledby="related-title">
            <div className="px-4 pt-4 min-[600px]:px-6 min-[600px]:pt-6">
              <Heading level={2} variant="h3" id="related-title">
                {related.close ? "Related calculators" : "More calculators"}
              </Heading>
            </div>
            <RowList className="mt-2">
              {related.items.map((c) => (
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
      </div>
    </>
  );
}
