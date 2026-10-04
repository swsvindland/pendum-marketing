import { apps } from "@/content/apps";
import { categoryLabel, getCalculator } from "@/content/calculators";
import type { App, CalculatorMeta } from "@/content/types";
import { ButtonLink, Label, LinkButton, Status, Text, cn } from "@/vector";
import { PriceReadout } from "./apps/price";

/**
 * How an app is sold, in words: a muted Label ("Subscription", "One-time purchase") with its price beside it as
 * kit readouts ("$19.99 once", "$7.99 a month or $49.99 a year"). A sales model is not a state, so it carries no status dot (§2.6) and spends none of the
 * page's signal (§2.4).
 */
export function ModelStatus({ app, className }: { app: App; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Label>{app.model === "subscription" ? "Subscription" : "One-time purchase"}</Label>
      <PriceReadout app={app} />
    </span>
  );
}

const stores = { appStore: "in the App Store", googlePlay: "on Google Play" } as const;

/** Where a released app can be had today, from the links the content has. */
function listedIn(app: App) {
  const places = [app.stores.appStore && "in the App Store", app.stores.googlePlay && "on Google Play"].filter(
    (s): s is string => Boolean(s)
  );
  return places.length ? `is ${places.join(" and ")}` : "is released";
}

/**
 * What an unreleased app's visitor can do today, from the content: the free calculators in the app's category and
 * the app that is in the stores. Nothing here invents a date, a price or a link. The calculators are a real, live
 * action, so they take the Button look; with `primary` they are the page's one primary action, since no store link
 * exists yet to be it (design-system: one primary per screen).
 */
function NotYet({ app, primary }: { app: App; primary: boolean }) {
  const calculators = app.calculators.map(getCalculator).filter((c): c is CalculatorMeta => Boolean(c));
  const category = calculators[0]?.category;
  const group = category ? categoryLabel[category].toLowerCase() : undefined;
  const released = apps.find((a) => a.slug !== app.slug && a.released);
  const sentence = [
    `${app.name} is not in the stores yet.`,
    group
      ? `The ${group} ${calculators.length === 1 ? "calculator is" : "calculators are"} free now${released ? "," : "."}`
      : "",
    released ? `${group ? "and " : ""}${released.name} ${listedIn(released)} today.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-3">
      <Text variant="small" tone="secondary" className="max-w-[60ch] text-pretty">
        {sentence}
      </Text>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <ButtonLink
          href={category ? `/calculators#${category}` : "/calculators"}
          variant={primary ? "primary" : "secondary"}
          icon="forward"
          iconPosition="end"
        >
          Open the calculators
        </ButtonLink>
        {released ? (
          <LinkButton href={`/apps/${released.slug}`} forward>
            See {released.name}
          </LinkButton>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Store links for an app, never a dead button. `primary` makes the first live link the page's one primary action.
 * State "live": "Get {app} on the App Store" buttons. State "preorder": "Pre-order for iPhone" and "Pre-register on
 * Android", with what each store then does. A store without a link is never open for pre-order, so a pending store
 * always reads "Coming soon", whatever the state. The web link is listed only once `stores.web` holds an address:
 * while it is not public the Details panel describes the web version (model.ts webNote) and nothing promises a
 * launch. A released app whose link is not in the site yet says where to look; an app that has not shipped lists
 * each store as "Coming soon" and points at what can be done today. Below 640 the store buttons are full width,
 * one under the other; from 640 they sit inline.
 */
export function GetApp({ app, primary = false }: { app: App; primary?: boolean }) {
  const preorder = app.stores.state === "preorder";
  const links = [
    {
      key: "appStore",
      label: "App Store",
      href: app.stores.appStore,
      cta: preorder ? "Pre-order for iPhone" : `Get ${app.name} on the App Store`,
      then: "The App Store downloads the app on release day.",
    },
    {
      key: "googlePlay",
      label: "Google Play",
      href: app.stores.googlePlay,
      cta: preorder ? "Pre-register on Android" : `Get ${app.name} on Google Play`,
      then: "Google Play sends a notification.",
    },
    ...(app.stores.web
      ? [{ key: "web", label: "Web", href: app.stores.web, cta: `Open ${app.name} on the web`, then: "" }]
      : []),
  ];
  const live = links.filter((l) => l.href);
  const pending = links.filter((l): l is (typeof links)[number] & { key: keyof typeof stores } => !l.href && l.key in stores);
  // A released app is in the stores: say where to look. An unreleased one lists each store as coming.
  const searchable = app.released ? pending.map((l) => stores[l.key]) : [];
  const comingSoon = app.released ? [] : pending;
  const caption = preorder ? live.map((l) => l.then).filter(Boolean).join(" ") : "";
  return (
    <div className="flex flex-col gap-3">
      {live.length ? (
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {live.map((l, i) => (
            <ButtonLink
              key={l.key}
              href={l.href!}
              external
              variant={primary && i === 0 ? "primary" : "secondary"}
              icon="external"
              iconPosition="end"
              className="w-full sm:w-auto"
            >
              {l.cta}
            </ButtonLink>
          ))}
        </div>
      ) : null}
      {caption ? (
        <Text variant="small" tone="secondary" className="max-w-[60ch] text-pretty">
          {caption}
        </Text>
      ) : null}
      {app.storeName && live.length ? (
        <Text variant="small" tone="secondary" className="max-w-[60ch] text-pretty">
          The store listings still show its former name, {app.storeName}.
        </Text>
      ) : null}
      {searchable.length ? (
        <Text variant="small" tone="secondary">
          Search for {app.name} {searchable.join(" or ")}.
        </Text>
      ) : null}
      {comingSoon.length ? (
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Availability">
          {comingSoon.map((l) => (
            <li key={l.key}>
              <Status state="idle" label={l.label} meta="Coming soon" />
            </li>
          ))}
        </ul>
      ) : null}
      {!app.released && !live.length ? <NotYet app={app} primary={primary} /> : null}
    </div>
  );
}
