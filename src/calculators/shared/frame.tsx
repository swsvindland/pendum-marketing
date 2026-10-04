import type { ReactNode } from "react";
import { PageHeader, Section } from "@/components/page";
import { JsonLd } from "@/components/site/json-ld";
import { toDisclosureItems } from "@/components/site/questions";
import { getApp, priceShort } from "@/content/apps";
import { site } from "@/content/site";
import { breadcrumbList, faqPage, webApplication } from "@/content/structured-data";
import type { App, CalculatorMeta } from "@/content/types";
import { AppIcon, ButtonLink, Callout, Heading, LinkButton, ListRow, Meta, Panel, RowList, Rule, Text } from "@/vector";
import { Disclosures } from "@/vector/disclosure";
import { VectorProvider } from "@/vector/provider";
import { alternativeFor } from "./alternatives";
import { NextStepProvider } from "./next-step";
import { relatedTo } from "./related";

// Server only: the frame reads the site content. Client tools import ToolLayout from ./tool-layout, never this file;
// the re-export is for the pages' Formula and for tools not yet moved over.
export { Formula, ToolLayout } from "./tool-layout";

export type Source = { label: string; href?: string };

/** The parents of every calculator page, drawn in the eyebrow slot; the BreadcrumbList adds the page itself. */
const CRUMBS = [
  { href: "/", label: "Home" },
  { href: "/calculators", label: "Calculators" },
];

/** "October 2, 2026" from an ISO date, read as a calendar day (UTC, so no zone moves it). */
const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/**
 * The next step once a result is shown, for the result panel's footer: what the app does with this number (the
 * content's `next`) and a text link to it, so the page keeps its one primary button in the closing panel.
 */
function NextStep({ meta, app }: { meta: CalculatorMeta; app?: App }) {
  if (!meta.next) return null;
  return (
    <div className="flex flex-col gap-1">
      <Text variant="small" tone="secondary" className="text-pretty">
        {meta.next}
      </Text>
      <LinkButton href={app ? `/apps/${app.slug}` : "/apps"} forward className="self-start">
        {app ? `See ${app.name}` : "See the apps"}
      </LinkButton>
    </div>
  );
}

/**
 * One calculator page: the header, the tool (inputs then result, side by side from 1024), how it is calculated,
 * the sources, common questions, the app that tracks it over time, and related calculators. The tool is the
 * page's one action, so the page has no primary button except the app link in the closing panel. The page emits
 * its BreadcrumbList, its WebApplication (the sources as citations, the review date as dateModified) and, when
 * the content has questions, an FAQPage with the same strings the disclosures show.
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
  /** The method: formulas, constants, reference bands and tables. */
  method: ReactNode;
  sources: Source[];
  /** Shown under the method: limits of the estimate. */
  caveat?: string;
}) {
  const app = meta.app ? getApp(meta.app) : undefined;
  const alternative = alternativeFor(meta, app);
  const related = relatedTo(meta);
  const questions = meta.questions ?? [];
  return (
    <>
      <JsonLd data={breadcrumbList([...CRUMBS.map((c) => ({ name: c.label, href: c.href })), { name: meta.title }])} />
      <JsonLd data={webApplication(meta, sources, meta.reviewed)} />
      <PageHeader crumbs={CRUMBS} title={meta.title} subtitle={intro} />
      <div className="mx-auto flex w-full max-w-data flex-col gap-6 px-gutter py-10 md:py-12">
        <noscript>
          <Callout>
            This calculator runs in your browser and needs JavaScript. The method below gives the same formula to
            work by hand.
          </Callout>
        </noscript>
        <VectorProvider>
          <NextStepProvider step={<NextStep meta={meta} app={app} />}>{tool}</NextStepProvider>
        </VectorProvider>
      </div>

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
                    <a href={s.href} className="inline-flex min-h-11 items-center rounded-mark text-tint underline-offset-4 hover:underline">
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ol>
            {meta.reviewed && site.publisher ? (
              <Text variant="small" tone="muted" className="text-pretty">
                Method and sources checked on{" "}
                <time dateTime={meta.reviewed}>{longDate.format(new Date(`${meta.reviewed}T00:00:00Z`))}</time> by{" "}
                {site.publisher}.
              </Text>
            ) : null}
          </div>
        </div>
      </section>

      {questions.length ? (
        <Section id="questions" bordered eyebrow={`Help / ${meta.short}`} title="Common questions">
          <Disclosures look="plain" className="max-w-form" items={toDisclosureItems(questions)} />
          <JsonLd data={faqPage(questions)} />
        </Section>
      ) : null}

      <div className="border-t border-border">
        <div className="mx-auto grid max-w-data gap-6 px-gutter py-12 md:py-16 lg:grid-cols-2 lg:items-start">
          {app ? (
            <Panel as="section" aria-labelledby="next-title">
              <Panel.Header eyebrow={app.model === "purchase" ? "Track / Offline" : "Track / Synced"} heading={false} />
              <Panel.Body>
                <div className="flex items-center gap-4">
                  <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={56} />
                  <div className="flex flex-col">
                    <Heading level={2} variant="h3" id="next-title">
                      {meta.track ?? `${app.name} tracks it over time`}
                    </Heading>
                    <Text variant="small" tone="muted">
                      {app.model === "purchase"
                        ? `One-time purchase${app.price ? `, ${priceShort(app)}` : ""}. No account.`
                        : `Subscription${app.price ? `, ${priceShort(app)}` : ""}. Syncs across devices.`}
                    </Text>
                  </div>
                </div>
                <Text tone="secondary" className="text-pretty">
                  {meta.next ?? app.tagline}
                </Text>
                {alternative ? (
                  <>
                    <Rule className="mt-1" />
                    <div className="flex items-start gap-4">
                      <AppIcon src={alternative.app.icon.light} dark={alternative.app.icon.dark} alt="" size={40} />
                      <div className="flex min-w-0 flex-col gap-1">
                        <Text variant="bodyStrong" as="span">
                          {alternative.app.name}
                        </Text>
                        <Meta items={["Available now", "Subscription"]} />
                        <Text variant="small" tone="secondary" className="text-pretty">
                          {alternative.sentence}
                        </Text>
                        <LinkButton href={`/apps/${alternative.app.slug}`} forward className="self-start">
                          See {alternative.app.name}
                        </LinkButton>
                      </div>
                    </div>
                  </>
                ) : null}
              </Panel.Body>
              <Panel.Footer>
                <ButtonLink href={`/apps/${app.slug}`} variant="primary" icon="forward" iconPosition="end">
                  See {app.name}
                </ButtonLink>
              </Panel.Footer>
            </Panel>
          ) : (
            <Panel as="section" aria-labelledby="next-title">
              <Panel.Header eyebrow="Track / Apps" heading={false} />
              <Panel.Body>
                <Heading level={2} variant="h3" id="next-title">
                  Five apps on one design system
                </Heading>
                <Text tone="secondary" className="text-pretty">
                  {meta.next ??
                    "A subscription that syncs across devices, or one-time purchases that keep their records on your phone."}
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
