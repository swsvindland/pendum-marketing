import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/page";
import { JsonLd } from "@/components/site/json-ld";
import { FactList, TermList } from "@/components/site/lists";
import { metaDescription, pageMetadata } from "@/components/site/metadata";
import { apps, seriesNames } from "@/content/apps";
import { listFormat } from "@/content/format";
import { principles } from "@/content/principles";
import { site } from "@/content/site";
import { breadcrumbList } from "@/content/structured-data";
import { LinkButton, Panel, ReadoutRow, Text, Value } from "@/vector";

const subscription = apps.filter((a) => a.model === "subscription");
/** "Pendum One" */
const subscriptionNames = seriesNames(subscription);
/** "Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration" */
const purchaseNames = seriesNames();
const platforms = listFormat.format([...new Set(apps.flatMap((a) => a.platforms))]);
const publisher = site.publisher;
const email = site.supportEmail;

/** The store listings that exist today, as proof of who publishes the apps. Null links are left out. */
const listings = apps.flatMap((app) => [
  ...(app.stores.appStore ? [{ href: app.stores.appStore, label: `${app.name} on the App Store` }] : []),
  ...(app.stores.googlePlay ? [{ href: app.stores.googlePlay, label: `${app.name} on Google Play` }] : []),
]);

const description = metaDescription(
  `Who makes ${subscriptionNames} and ${site.series.sentence}${publisher ? ` (${publisher})` : ""}, what the ${apps.length} fitness apps are, how they are made and where to get support.`
);

// "About · Vector": the template adds the family name, so the title does not repeat it.
export const metadata: Metadata = pageMetadata({ title: "About", description, path: "/about" });

/**
 * Who makes the apps and what they are, from the content alone: the publisher name both store listings show
 * (site.ts), the listings that exist today as proof (the panel's footer), each app's one-sentence definition
 * (apps.ts), the four principles the home page states (src/content/principles.ts, one list for both pages), and
 * where support is. No location, founding story, team or photo: none is in the content, and nothing here is
 * invented. Prose panels keep the form width (640), about 80 characters a line.
 */
export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: `About ${site.family}` }])} />
      <PageHeader
        eyebrow="Publisher / Apps"
        crumbs={[{ href: "/", label: "Home" }]}
        title={`About ${site.family}`}
        subtitle={`${subscriptionNames} and ${site.series.sentence} are fitness apps for ${platforms}${publisher ? `, published by ${publisher}` : ""}. This page says who makes them, what each app is and how they are made.`}
      />

      <Section
        id="publisher"
        eyebrow="Publisher / Store listings"
        title="Who makes the apps"
        intro={
          publisher
            ? `${publisher} is the publisher named on the ${subscriptionNames} listings in the App Store and on Google Play.`
            : `The publisher is the name shown on the ${subscriptionNames} listings in the App Store and on Google Play.`
        }
      >
        <Panel className="max-w-form">
          <Panel.Header eyebrow="Publisher / Readout" title="At a glance" />
          <Panel.Body className="gap-0">
            {publisher ? (
              <ReadoutRow label="Publisher" stack>
                <Text variant="small" as="span">
                  {publisher}
                </Text>
              </ReadoutRow>
            ) : null}
            <ReadoutRow label="Apps">
              <Value value={String(apps.length)} size="s" />
            </ReadoutRow>
            <ReadoutRow label="Platforms" stack>
              <Text variant="small" as="span">
                {platforms}
              </Text>
            </ReadoutRow>
            <ReadoutRow label="Support" stack>
              {email ? (
                <LinkButton href={`mailto:${email}`} className="-my-3 [overflow-wrap:anywhere]">
                  {email}
                </LinkButton>
              ) : (
                <LinkButton href="/support" className="-my-3">
                  Support page
                </LinkButton>
              )}
            </ReadoutRow>
          </Panel.Body>
          {listings.length ? (
            <Panel.Footer>
              {listings.map((l) => (
                <LinkButton key={l.href} href={l.href} external forward>
                  {l.label}
                </LinkButton>
              ))}
            </Panel.Footer>
          ) : null}
        </Panel>
      </Section>

      <Section
        id="apps"
        eyebrow="Apps / Definitions"
        title="What the apps are"
        intro={`${subscriptionNames} is the subscription, with one account that syncs. ${purchaseNames} are each bought once and keep their records on your phone.`}
        bordered
      >
        <Panel className="max-w-form">
          <TermList
            items={apps.map((app) => ({
              term: app.name,
              href: `/apps/${app.slug}`,
              detail: app.definition ?? app.summary,
            }))}
          />
        </Panel>
      </Section>

      <Section id="principles" eyebrow="Design / Principles" title="How the apps are made" bordered>
        <Panel className="max-w-form">
          <FactList
            items={principles.map((p) => (
              <>
                <strong>{p.title}.</strong> {p.body}
              </>
            ))}
          />
        </Panel>
      </Section>

      <Section id="support" eyebrow="Help / Support" title="How to reach support" bordered>
        <div className="flex flex-col items-start gap-3">
          <Text tone="secondary" className="max-w-[60ch] text-pretty">
            Answers about health sync, backups, reminders, {subscriptionNames} accounts and the calculators are on
            the support page.
            {email ? ` For anything else, write to ${email}.` : ""}
          </Text>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <LinkButton href="/support" forward>
              Open support
            </LinkButton>
            <LinkButton href="/privacy" forward>
              Read the privacy summary
            </LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
}
