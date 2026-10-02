import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/page";
import { AppPrices } from "@/components/pricing/app-prices";
import { BillingFaq } from "@/components/pricing/billing-faq";
import { CompareTable } from "@/components/pricing/compare-table";
import { PlanPanels } from "@/components/pricing/plan-panel";
import { ButtonLink, LinkButton } from "@/vector";

const description =
  "OmegaFyt Pro is a subscription with an account that syncs across iPhone, Android and the web. Vector Body, Lift, Macros and Hydration are one-time purchases that work offline, with no account.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title: "Pricing · Vector", description },
};

/**
 * The two buying models. No price, trial length or bundle appears until the owner sets one in
 * src/content/apps.ts: each app's `price` renders when set, and the model in words otherwise. The page's one
 * primary action leads to the apps.
 */
export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing / Models"
        title="Two ways to pay"
        subtitle="OmegaFyt is a subscription with an account that syncs across iPhone, Android and the web. The four Vector apps are one-time purchases that work offline, with no account."
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
        title="Side by side"
        intro="What each model means for your account, your records and how you pay. Where the Vector apps differ from each other, the note says which app does what."
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
