import type { ReactNode } from "react";
import { hasWatch } from "@/components/apps/model";
import { listFormat } from "@/content/format";
import { site } from "@/content/site";
import { AppIcon, Heading, Icon, Label, LinkButton, Panel, ReadoutRow, Text, Value, type IconName } from "@/vector";
import { priceLine, purchasePriceRange, purchaseApps, subscriptionApp } from "./models";

type Included = { icon: IconName; text: string };
type Term = { label: string; value: string };

/**
 * One buying model as a panel: the eyebrow and app count, the app icons, the plan name (h2) with its store price
 * once one is set, one sentence, what is included, the billing terms as readout rows and the links out.
 */
function PlanPanel({
  id,
  eyebrow,
  count,
  icons,
  title,
  price,
  summary,
  included,
  terms,
  footer,
}: {
  id: string;
  eyebrow: string;
  count: number;
  icons: { src: string; dark?: string }[];
  title: string;
  /** The store price as the content prints it; nothing while unpriced (the terms state the model). */
  price?: string;
  summary: string;
  included: Included[];
  terms: Term[];
  footer: ReactNode;
}) {
  return (
    <Panel>
      <Panel.Header
        eyebrow={eyebrow}
        meta={<Value value={String(count)} unit={count === 1 ? "app" : "apps"} size="xs" tone="muted" />}
        // The plan name (h2) in the body is the panel's heading, so the eyebrow stays plain.
        heading={false}
      />
      <Panel.Body className="gap-6">
        <div className="flex flex-col gap-4">
          {/* Decorative: the heading names the plan and the apps are listed further down. */}
          <div className="flex flex-wrap gap-2">
            {icons.map((icon) => (
              <AppIcon key={icon.src} src={icon.src} dark={icon.dark} alt="" size={48} />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <Heading level={2} variant="h2" id={`${id}-title`}>
              {title}
            </Heading>
            {price ? <Text tone="secondary">{price}</Text> : null}
          </div>
        </div>
        <Text>{summary}</Text>
        <div className="flex flex-col gap-3">
          <Label id={`${id}-included`}>Included</Label>
          <ul aria-labelledby={`${id}-included`} className="flex flex-col gap-3">
            {included.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <Icon name={item.icon} size={20} tone="muted" className="mt-0.5" />
                <Text as="span" tone="secondary">
                  {item.text}
                </Text>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {terms.map((term) => (
            <ReadoutRow key={term.label} label={term.label}>
              <Text as="span" variant="small">
                {term.value}
              </Text>
            </ReadoutRow>
          ))}
        </div>
      </Panel.Body>
      <Panel.Footer>{footer}</Panel.Footer>
    </Panel>
  );
}

/**
 * The two models side by side (one column on phones). Every line comes from docs/sources/app-facts.json:
 * Pendum One is bought only in the iPhone and Android apps, and the Pendum apps have no account, no server and
 * no network code. Prices and trials come from src/content/apps.ts (the owner's decision of 2026-10-04). "Included" lists only what the subscription buys
 * in the public build: not the free guided setup, and not the web version, which the fact sheet says is never sold
 * as part of a plan. Both panels carry four terms so they stay close in height. The page's primary action is the
 * App Store link in the header; the subscription panel adds the Google Play listing as a text link.
 */
export function PlanPanels() {
  const pendumOne = subscriptionApp;
  const watchApps = listFormat.format(purchaseApps.filter(hasWatch).map((a) => a.name));
  const trialApps = purchaseApps.filter((a) => a.unlock && a.trial);
  const subscriptionTrial = pendumOne?.trial
    ? `${pendumOne.trial.days} days on the ${pendumOne.trial.plan === "month" ? "monthly" : "yearly"} plan, for new subscribers`
    : "None";
  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-start">
      {pendumOne ? (
        <PlanPanel
          id="plan-subscription"
          eyebrow="Model / Subscription"
          count={1}
          icons={[{ src: pendumOne.icon.light, dark: pendumOne.icon.dark }]}
          title={pendumOne.plan ?? pendumOne.name}
          price={priceLine(pendumOne)}
          summary="Training and nutrition, planned and tracked together in one account."
          included={[
            { icon: "sync", text: "One account with the same records on iPhone and Android" },
            { icon: "energy", text: "Daily calorie and macro targets that follow your 7-day trend weight" },
            { icon: "lift", text: "Training programs with sets that progress each week" },
            { icon: "food", text: "Food database search and barcode scan" },
            { icon: "chart", text: "Reports for body, strength and energy expenditure" },
          ]}
          terms={[
            { label: "Billed by", value: "The App Store or Google Play" },
            { label: "Buy in", value: "The iPhone and Android apps" },
            { label: "Cancel in", value: "The store’s subscription settings" },
            { label: "Free trial", value: subscriptionTrial },
          ]}
          footer={
            <>
              <LinkButton href={`/apps/${pendumOne.slug}`} forward>
                See {pendumOne.name}
              </LinkButton>
              {pendumOne.stores.googlePlay ? (
                <LinkButton href={pendumOne.stores.googlePlay} external forward>
                  Get {pendumOne.name} on Google Play
                </LinkButton>
              ) : null}
            </>
          }
        />
      ) : null}
      <PlanPanel
        id="plan-purchase"
        eyebrow="Model / One-time purchase"
        count={purchaseApps.length}
        icons={purchaseApps.map((a) => ({ src: a.icon.light, dark: a.icon.dark }))}
        title={site.series.label}
        price={purchasePriceRange()}
        summary="Four focused apps for body, strength, food and fluids. Buy each one once and keep its records on your phone."
        included={[
          { icon: "lock", text: "No account, no server and no subscription" },
          { icon: "offline", text: "Works with no connection" },
          { icon: "phone", text: "Records in a database on your phone" },
          { icon: "health", text: "Optional Apple Health and Health Connect sync" },
          ...(watchApps ? [{ icon: "watch" as const, text: `Apple Watch apps for ${watchApps}` }] : []),
        ]}
        terms={[
          { label: "Pay", value: "Once for each app" },
          ...(trialApps.length
            ? [{ label: "Free trial", value: `${trialApps[0].trial?.days} days in ${listFormat.format(trialApps.map((a) => a.name))}` }]
            : []),
          { label: "Account", value: "None" },
          { label: "Renewal", value: "None" },
          { label: "Cancel", value: "Nothing to cancel" },
        ]}
        footer={
          <LinkButton href="#each-app" forward>
            See each app
          </LinkButton>
        }
      />
    </div>
  );
}
