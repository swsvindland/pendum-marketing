import type { Metadata } from "next";
import { AppCards } from "@/components/apps/app-card";
import { Chooser } from "@/components/apps/chooser";
import { preorderSentence } from "@/components/apps/model";
import { PageHeader, Section } from "@/components/page";
import { JsonLd } from "@/components/site/json-ld";
import { metaDescription, pageMetadata } from "@/components/site/metadata";
import { apps, seriesNames } from "@/content/apps";
import { sentenceCase } from "@/content/format";
import { site } from "@/content/site";
import { appListItems, breadcrumbList, itemList } from "@/content/structured-data";

const subscription = apps.filter((a) => a.model === "subscription");
const purchase = apps.filter((a) => a.model === "purchase");

/** What a visitor on the apps index is told, once: the two models, in the apps' own names. */
const lead = `${seriesNames(subscription)} is the subscription: one account that syncs training and nutrition across iPhone and Android. ${seriesNames(purchase)} are one-time purchases that work offline, with no account.`;

/** The snippet: both models in under 160 characters, with the collective noun in place of the four names. */
const description = metaDescription(
  `${seriesNames(subscription)} is the subscription: one account on iPhone and Android. ${sentenceCase(site.series.sentence)} are one-time purchases that work offline, with no account.`
);

export const metadata: Metadata = pageMetadata({
  title: "Workout, macro, body and water tracking apps",
  description,
  path: "/apps",
});

/**
 * The apps index: the chooser first (the header's "Get the apps" lands on #choose), then the five apps as one
 * grid, the subscription app wide with its store links as the page's one primary action. The models are stated
 * in the lead and in the chooser's intro, not a third time; pricing is one link away from the chooser.
 */
export default function AppsPage() {
  const preorder = preorderSentence(purchase);
  return (
    <>
      <JsonLd data={itemList("Apps", appListItems())} />
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: "Apps" }])} />
      <PageHeader eyebrow="Apps / Choose" crumbs={[{ href: "/", label: "Home" }]} title="Pick your app" subtitle={lead} />
      <Chooser />
      <Section
        id="apps"
        eyebrow={`Apps / ${seriesNames(subscription)} and ${site.series.sentence}`}
        title="The apps"
        intro={preorder || undefined}
        bordered
      >
        <AppCards detail primary />
      </Section>
    </>
  );
}
