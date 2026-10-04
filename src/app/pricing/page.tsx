import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/page";
import { AppPrices } from "@/components/pricing/app-prices";
import { BillingFaq } from "@/components/pricing/billing-faq";
import { CompareTable } from "@/components/pricing/compare-table";
import { priceLine, purchasePriceRange, purchasePriced, subscriptionApp, threeYearLines } from "@/components/pricing/models";
import { PlanPanels } from "@/components/pricing/plan-panel";
import { ThreeYears } from "@/components/pricing/three-years";
import { JsonLd } from "@/components/site/json-ld";
import { metaDescription, pageMetadata } from "@/components/site/metadata";
import { sentenceCase } from "@/content/format";
import { site } from "@/content/site";
import { breadcrumbList, isShipped } from "@/content/structured-data";
import { ButtonLink, LinkButton } from "@/vector";

const pendumOne = subscriptionApp;
// The subscription app's name and its plan. The fallbacks only keep the types: the page is about this app.
const subscriptionName = pendumOne?.name ?? "The subscription app";
const plan = pendumOne?.plan ?? subscriptionName;
const appStore = pendumOne?.stores.state === "live" ? pendumOne.stores.appStore : null;

/**
 * The one honest cost sentence (docs/sources/app-facts.json omegafyt.subscription.whatIsFree): creating an
 * account is free, and so is the guided setup once the build that ships it (1.8.0) is the public one. Prices
 * come from src/content/apps.ts (the owner's decision of 2026-10-04).
 */
const freePart =
  pendumOne && isShipped({ since: "1.8.0" }, pendumOne)
    ? "creating the account and the guided setup are free"
    : "creating the account is free";

const description = metaDescription(
  `Two ways to pay: ${plan}, a subscription billed by the App Store or Google Play, and ${site.series.sentence}, each bought once, with no account and no server.`
);

export const metadata: Metadata = pageMetadata({ title: "Pricing", description, path: "/pricing" });

/**
 * The two buying models with their prices, all read from src/content/apps.ts (each app's `price`, `plans`, `unlock`
 * and `trial`); an app without a price would show the model in words and never a number. The page's one
 * primary action is the thing that can be bought today, Pendum One in the App Store, once its listing is live;
 * before that it is "Choose your app". The "Three years" panel exists only once a price does.
 */
/** The header in three sentences: the subscription and its price, the old store name while it lags, the apps. */
const subscriptionPrice = pendumOne ? priceLine(pendumOne) : undefined;
const subtitle = [
  `${subscriptionName} is a subscription with an account that syncs across iPhone and Android: ${freePart}${
    subscriptionPrice ? `, and the subscription is ${subscriptionPrice}` : `, and the ${plan} plans are on the paywall in the app`
  }.`,
  pendumOne?.storeName ? `The store listings still show its former name, ${pendumOne.storeName}.` : "",
  `${sentenceCase(site.series.sentence)} are one-time purchases that work offline, with no account${
    purchasePriceRange() ? `: ${purchasePriceRange()}` : ""
  }.`,
]
  .filter(Boolean)
  .join(" ");

export default function PricingPage() {
  const lines = threeYearLines();
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: "Pricing" }])} />
      <PageHeader
        eyebrow="Subscription / One-time purchase"
        crumbs={[{ href: "/", label: "Home" }]}
        title="Two ways to pay"
        subtitle={subtitle}
        actions={
          appStore && pendumOne ? (
            <>
              <ButtonLink href={appStore} external variant="primary" icon="external" iconPosition="end">
                Get {pendumOne.name}
              </ButtonLink>
              <LinkButton href="/apps#choose" forward>
                Choose your app
              </LinkButton>
            </>
          ) : (
            <>
              <ButtonLink href="/apps#choose" variant="primary" icon="forward" iconPosition="end">
                Choose your app
              </ButtonLink>
              <LinkButton href="#compare" forward>
                Compare the models
              </LinkButton>
            </>
          )
        }
      />
      <section aria-label="Plans">
        <div className="mx-auto flex max-w-data flex-col gap-6 px-gutter py-12 md:py-16">
          <PlanPanels />
        </div>
      </section>
      <Section
        id="compare"
        eyebrow="Compare / Models"
        title="Account, records and payment"
        intro={`Where ${site.series.sentence} differ from each other, the note says which app does what.`}
        bordered
      >
        <CompareTable />
      </Section>
      {lines.length ? (
        <Section
          id="three-years"
          eyebrow="Cost / Three years"
          title="Three years of use"
          intro="What three years cost at today’s store prices. Prices can change."
          bordered
        >
          <ThreeYears lines={lines} />
        </Section>
      ) : null}
      <Section
        id="each-app"
        eyebrow="Purchase / Offline"
        title={`Each ${site.family} app`}
        intro={
          purchasePriced
            ? "Each app is its own one-time purchase with its own records. Buy the ones you use."
            : "Each app is its own one-time purchase with its own records. Buy the ones you use."
        }
        bordered
      >
        <AppPrices />
      </Section>
      <Section
        id="billing"
        eyebrow="Help / Billing"
        title="Common questions"
        action={
          <LinkButton href="/support" forward>
            Open support
          </LinkButton>
        }
        bordered
      >
        <BillingFaq />
      </Section>
    </>
  );
}
