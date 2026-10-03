import type { Metadata } from "next";
import { listFormat } from "@/components/site/format";
import { pageMetadata } from "@/components/site/metadata";
import { AppCard } from "@/components/apps/app-card";
import { PageHeader, Section } from "@/components/page";
import { apps } from "@/content/apps";
import { LinkButton } from "@/vector";

const subscription = apps.filter((a) => a.model === "subscription");
const purchase = apps.filter((a) => a.model === "purchase");
const names = (list: typeof apps) => listFormat.format(list.map((a) => a.name));

export const metadata: Metadata = pageMetadata({
  title: "Apps",
  description: `${names(subscription)} is the subscription that syncs across devices. ${names(purchase)} are one-time purchases that work offline, with no account.`,
  path: "/apps",
});

/**
 * The apps index: the subscription app first, across the column, then the one-time purchase apps as a grid of
 * linked panels. No primary button: each panel is the way in, and pricing is one link away.
 */
export default function AppsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Apps / OmegaFyt and Vector series"
        title="Synced, or kept on your phone"
        subtitle={`${names(subscription)} is the subscription: one account that syncs training and nutrition across your devices. ${names(purchase)} are one-time purchases that work offline, with no account.`}
      />

      <Section
        id="subscription"
        eyebrow="Model / Subscription"
        title="One account across your devices"
        intro="Records are stored on a server and open wherever you sign in. Subscriptions are bought in the iPhone and Android apps."
      >
        <ul className="grid gap-6">
          {subscription.map((app) => (
            <AppCard key={app.slug} app={app} wide />
          ))}
        </ul>
      </Section>

      <Section
        id="purchase"
        eyebrow="Model / One-time purchase"
        title="Offline, with no account"
        intro="No server and no analytics. Records live in a database on your phone, and Health sync stays off until you turn it on."
        bordered
      >
        <ul className="grid gap-6 md:grid-cols-2">
          {purchase.map((app) => (
            <AppCard key={app.slug} app={app} />
          ))}
        </ul>
      </Section>

      <Section
        id="compare"
        eyebrow="Pricing / Comparison"
        title="Subscription or one-time purchase"
        intro="The pricing page sets the two models side by side: what each includes and where records are kept."
        action={
          <LinkButton href="/pricing" forward>
            Compare the models
          </LinkButton>
        }
        bordered
      >
        {null}
      </Section>
    </>
  );
}
