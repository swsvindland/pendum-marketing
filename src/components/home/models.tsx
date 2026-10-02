import { ModelStatus } from "@/components/get-app";
import { Section } from "@/components/page";
import { apps, getApp } from "@/content/apps";
import type { App } from "@/content/types";
import { ButtonLink, Icon, Panel, Text, type IconName } from "@/vector";

type Difference = { icon: IconName; title: string; body: string };

/**
 * The same five facts for both models, in the same order, so the rows line up across the two panels: account,
 * where records live, devices, connection, how to buy.
 */
const connected: Difference[] = [
  {
    icon: "person",
    title: "One account",
    body: "Sign in on your phone or in a browser, and your records are there.",
  },
  {
    icon: "cloud",
    title: "Records on the OmegaFyt server",
    body: "Workouts, food and body records are stored with your account, not on one phone.",
  },
  {
    icon: "globe",
    title: "iPhone, Android and the web",
    body: "The same account opens in a web browser.",
  },
  {
    icon: "sync",
    title: "Needs a connection",
    body: "Records are read and saved through the server, so OmegaFyt needs a network connection.",
  },
  {
    icon: "repeat",
    title: "Subscribe in the app",
    body: "Subscriptions are bought in the iPhone or Android app, through the App Store or Google Play.",
  },
];

const offline: Difference[] = [
  {
    icon: "person",
    title: "No account",
    body: "Open the app and start. There is nothing to sign up for.",
  },
  {
    icon: "phone",
    title: "Records on your phone",
    body: "Each app keeps its records in a database on the phone, with no server and no analytics.",
  },
  {
    icon: "watch",
    title: "iPhone and Android",
    body: "Vector Lift and Vector Hydration also have an Apple Watch app.",
  },
  {
    icon: "offline",
    title: "Works offline",
    body: "The apps make no network requests of their own. Health sync is optional and off until you turn it on.",
  },
  {
    icon: "download",
    title: "Buy once",
    body: "Each app is a one-time purchase. There is no subscription.",
  },
];

/**
 * One plan as a Panel. From 768 the panel is a subgrid of the parent's eight rows (header, intro, five facts,
 * footer), so each fact sits level with its counterpart in the other panel; on phones it is the usual stack.
 */
function ModelPanel({
  app,
  eyebrow,
  title,
  intro,
  rows,
  href,
  cta,
}: {
  app: App;
  eyebrow: string;
  title: string;
  intro: string;
  rows: Difference[];
  href: string;
  cta: string;
}) {
  const id = `model-${app.model}-title`;
  return (
    <Panel as="article" aria-labelledby={id} className="gap-0 md:row-span-8 md:grid md:grid-rows-subgrid">
      <Panel.Header eyebrow={eyebrow} meta={<ModelStatus app={app} />} title={title} id={id} />
      <Panel.Body className="gap-0 md:row-span-6 md:grid md:grid-rows-subgrid">
        <Text tone="secondary" className="pt-3 pb-1 text-pretty">
          {intro}
        </Text>
        <ul className="flex flex-col md:row-span-5 md:grid md:grid-rows-subgrid">
          {rows.map((r) => (
            <li key={r.title} className="flex gap-3 border-t border-separator py-3 first:border-t-0">
              <Icon name={r.icon} size={20} tone="muted" className="mt-0.5" />
              <div className="flex min-w-0 flex-col">
                <Text variant="bodyStrong">{r.title}</Text>
                <Text variant="small" tone="muted" className="text-pretty">
                  {r.body}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </Panel.Body>
      <Panel.Footer>
        <ButtonLink href={href} variant="secondary">
          {cta}
        </ButtonLink>
      </Panel.Footer>
    </Panel>
  );
}

/** "Two ways to own it": the subscription and the one-time apps, fact for fact. No prices until they are set. */
export function OwnershipModels() {
  const omegafyt = getApp("omegafyt");
  const purchase = apps.find((a) => a.model === "purchase");
  if (!omegafyt || !purchase) return null;

  return (
    <Section
      id="models"
      eyebrow="Plans / Ownership"
      title="Two ways to own it"
      intro="A subscription that keeps one account in step across your devices, or apps you buy once that keep their records on your phone."
    >
      <div className="grid gap-6 md:grid-cols-2 md:gap-y-0">
        <ModelPanel
          app={omegafyt}
          eyebrow="Plan / Connected"
          title="OmegaFyt"
          intro="Training and nutrition in one app, on one account."
          rows={connected}
          href="/apps/omegafyt"
          cta="View OmegaFyt"
        />
        <ModelPanel
          // The series has no single price: the status names the model only.
          app={{ ...purchase, price: null }}
          eyebrow="Plan / Offline"
          title="Vector series"
          intro="Vector Body, Lift, Macros and Hydration: four focused apps."
          rows={offline}
          href="/apps"
          cta="View Vector apps"
        />
      </div>
    </Section>
  );
}
