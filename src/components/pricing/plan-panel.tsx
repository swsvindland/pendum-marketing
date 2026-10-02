import type { ReactNode } from "react";
import { AppIcon, Heading, Icon, Label, LinkButton, Panel, ReadoutRow, Text, Value, type IconName } from "@/vector";
import { priceText, purchaseApps, purchasePriceText, subscriptionApp } from "./models";

type Included = { icon: IconName; text: string };
type Term = { label: string; value: string };

/**
 * One buying model as a panel: the eyebrow and app count, the app icons, the plan name (h2) with its price in
 * words, one sentence, what is included, the billing terms as readout rows and one text link out.
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
  price: string;
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
            <Text tone="secondary">{price}</Text>
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
 * OmegaFyt Pro is bought only in the iOS and Android apps, its plans and any trial come from the store, and the
 * Vector apps have no account, no server and no network code.
 */
export function PlanPanels() {
  const omegafyt = subscriptionApp;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {omegafyt ? (
        <PlanPanel
          id="plan-subscription"
          eyebrow="Model / Subscription"
          count={1}
          icons={[{ src: omegafyt.icon.light, dark: omegafyt.icon.dark }]}
          title="OmegaFyt Pro"
          price={priceText(omegafyt)}
          summary="Training and nutrition, planned and tracked together in one account."
          included={[
            { icon: "sync", text: "One account with the same records on iPhone, Android and the web" },
            { icon: "energy", text: "A guided plan with calorie and macro targets from your trend weight" },
            { icon: "lift", text: "Training programs with sets that progress each week" },
            { icon: "food", text: "Food database search and barcode scan" },
            { icon: "chart", text: "Reports for body, strength and energy expenditure" },
          ]}
          terms={[
            { label: "Billed by", value: "The App Store or Google Play" },
            { label: "Buy in", value: "The iPhone and Android apps" },
            { label: "Cancel in", value: "The store’s subscription settings" },
            { label: "Free trial", value: "Only when the store offers one" },
          ]}
          footer={
            <LinkButton href={`/apps/${omegafyt.slug}`} forward>
              See {omegafyt.name}
            </LinkButton>
          }
        />
      ) : null}
      <PlanPanel
        id="plan-purchase"
        eyebrow="Model / One-time purchase"
        count={purchaseApps.length}
        icons={purchaseApps.map((a) => ({ src: a.icon.light, dark: a.icon.dark }))}
        title="Vector apps"
        price={purchasePriceText()}
        summary="Four focused apps for body, lifting, food and water. Buy each one once and keep its records on your phone."
        included={[
          { icon: "lock", text: "No account, no server and no subscription" },
          { icon: "offline", text: "Works with no connection" },
          { icon: "phone", text: "Records in a database on your phone" },
          { icon: "health", text: "Optional Apple Health and Health Connect sync" },
          { icon: "watch", text: "Apple Watch apps for Lift and Hydration" },
        ]}
        terms={[
          { label: "Pay", value: "Once for each app" },
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
