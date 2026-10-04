import Link from "next/link";
import { GetApp, ModelStatus } from "@/components/get-app";
import { apps } from "@/content/apps";
import { shippedFeatures } from "@/content/structured-data";
import type { App } from "@/content/types";
import { AppIcon, Heading, Icon, Meta, Panel, Text, cn } from "@/vector";

/**
 * The stretched link (A11Y-06): the app's name is the link and its ::after covers the whole panel, so the
 * accessible name equals the visible link text and the card still opens from anywhere. Focus draws on the panel,
 * inside its clipped edge, in the kit's focus token. Controls that sit on the card (the store buttons) are positioned later in the stacking
 * order so they stay pressable.
 */
const stretched =
  "rounded-mark after:absolute after:inset-0 after:rounded-panel after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus";

/** A feature as a list row: the title, and its body when the card goes into detail. A feature with no glyph takes the check. */
function FeatureRow({ feature, body }: { feature: App["features"][number]; body: boolean }) {
  return (
    <li className="flex items-start gap-3 border-t border-separator py-3 last:pb-0">
      <Icon name={feature.icon ?? "check"} size={20} tone="muted" className={cn(body && "mt-0.5")} />
      {body ? (
        <span className="flex min-w-0 flex-col gap-1">
          <Text variant="bodyStrong" as="span">
            {feature.title}
          </Text>
          <Text variant="small" tone="secondary" as="span" className="text-pretty">
            {feature.body}
          </Text>
        </span>
      ) : (
        <Text variant="small" as="span">
          {feature.title}
        </Text>
      )}
    </li>
  );
}

/**
 * One app as a card: icon, name (the link), tagline, how it is sold and where it runs, then up to three shipped
 * features. `wide` lays the subscription app across the row with its store links. `detail` is the /apps index:
 * the wide card then carries the definition and feature bodies, a narrow card its one-sentence summary; the home
 * page keeps every card to its identity, model and feature titles. `primary` makes the first store link the page's
 * one primary action.
 */
export function AppCard({
  app,
  wide = false,
  detail = false,
  primary = false,
}: {
  app: App;
  wide?: boolean;
  detail?: boolean;
  primary?: boolean;
}) {
  const nameId = `app-${app.slug}-name`;
  const features = shippedFeatures(app).slice(0, 3);
  // The index goes into detail: the definition on the wide card, the summary on the others. The home stays short.
  const description = detail ? (wide ? (app.definition ?? app.summary) : app.summary) : null;
  const identity = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={wide ? 64 : 56} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading level={3} variant={wide ? "h2" : "h3"} id={nameId}>
            <Link href={`/apps/${app.slug}`} className={stretched}>
              {app.name}
            </Link>
          </Heading>
          {app.tagline ? (
            <Text variant="small" tone="secondary" className="text-pretty">
              {app.tagline}
            </Text>
          ) : null}
        </div>
        <Icon name="forward" size={16} tone="muted" className="mt-1" />
      </div>
      {description ? (
        <Text tone="secondary" className="max-w-[60ch] text-pretty">
          {description}
        </Text>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <ModelStatus app={app} />
        {app.platforms.length ? (
          <>
            <span className="sr-only">Platforms</span>
            <Meta items={app.platforms} />
          </>
        ) : null}
      </div>
    </div>
  );
  const panel = "transition-[background-color,color] duration-100 ease-standard hover:bg-surface-secondary";

  if (wide) {
    return (
      <Panel as="li" aria-labelledby={nameId} className={cn(panel, "md:col-span-2")}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          {identity}
          {features.length ? (
            <ul className="flex flex-col">
              {features.map((f) => (
                <FeatureRow key={f.title} feature={f} body={detail} />
              ))}
            </ul>
          ) : null}
        </div>
        {/* Above the stretched link's overlay, so the store buttons take the press. */}
        <Panel.Footer className="relative z-10">
          <GetApp app={app} primary={primary} />
        </Panel.Footer>
      </Panel>
    );
  }

  return (
    <Panel as="li" aria-labelledby={nameId} className={panel}>
      {identity}
      {features.length ? (
        <ul className="mt-auto flex flex-col">
          {features.map((f) => (
            <FeatureRow key={f.title} feature={f} body={false} />
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

/**
 * The five apps as one grid: the subscription app wide across the row first, with its store links, then the
 * one-time purchase apps two across from 768. `primary` lets the first store link be the page's one primary (the
 * /apps index); the home page keeps its primary in the hero. `detail` adds each app's summary (the index).
 */
export function AppCards({ detail = false, primary = false }: { detail?: boolean; primary?: boolean }) {
  const subscription = apps.filter((a) => a.model === "subscription");
  const purchase = apps.filter((a) => a.model === "purchase");
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {subscription.map((app) => (
        <AppCard key={app.slug} app={app} wide detail={detail} primary={primary} />
      ))}
      {purchase.map((app) => (
        <AppCard key={app.slug} app={app} detail={detail} />
      ))}
    </ul>
  );
}
