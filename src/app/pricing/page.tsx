import type { Metadata } from "next";
import { pageMetadata } from "@/components/site/metadata";
import { PageHeader, Section } from "@/components/page";
import { AppPrices } from "@/components/pricing/app-prices";
import { BillingFaq } from "@/components/pricing/billing-faq";
import { CompareTable } from "@/components/pricing/compare-table";
import { PlanPanels } from "@/components/pricing/plan-panel";
import { ButtonLink, LinkButton } from "@/vector";

const description =
  "OmegaFyt is the subscription, with one account that keeps your records in step on iPhone and Android. Vector Body, Lift, Macros and Hydration are one-time purchases that work offline, with no account.";

export const metadata: Metadata = pageMetadata({ title: "Pricing", description, path: "/pricing" });

/**
 * The two buying models. No price, trial length or bundle appears until the owner sets one in
 * src/content/apps.ts: each app's `price` renders when set, and the model in words otherwise. The page's one
 * primary action leads to the apps.
 */
export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Subscription / One-time purchase"
        title="Two ways to pay"
        subtitle="OmegaFyt is a subscription with an account that syncs across iPhone and Android. The four Vector apps are one-time purchases that work offline, with no account."
        actions={
          <>
            <ButtonLink href="/apps" variant="primary" icon="forward" iconPosition="end">
              See the apps
            </ButtonLink>
            <LinkButton href="#compare" forward>
              Compare the models
            </LinkButton>
          </>
        }
      />
      <Section>
        <PlanPanels />
      </Section>
      <Section
        id="compare"
        eyebrow="Compare / Models"
        title="Account, records and payment"
        intro="Where the Vector apps differ from each other, the note says which app does what."
        bordered
      >
        <CompareTable />
      </Section>
      <Section
        id="each-app"
        eyebrow="Purchase / Offline"
        title="Each Vector app"
        intro="Each app is its own one-time purchase with its own records. Buy the ones you use."
        bordered
      >
        <AppPrices />
      </Section>
      <Section id="billing" eyebrow="Help / Billing" title="Common questions" bordered>
        <BillingFaq />
      </Section>
    </>
  );
}
