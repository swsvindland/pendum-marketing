import type { App } from "@/content/types";
import { ButtonLink, Label, Status, Text, cn } from "@/vector";

/**
 * How an app is sold, in words: a muted Label ("Subscription", "One-time purchase") with the price as readout meta
 * once the owner sets one. A sales model is not a state, so it carries no status dot (§2.6) and spends none of the
 * page's signal (§2.4).
 */
export function ModelStatus({ app, className }: { app: App; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Label>{app.model === "subscription" ? "Subscription" : "One-time purchase"}</Label>
      {app.price ? <span className="type-readout-xs text-muted">{app.price}</span> : null}
    </span>
  );
}

const stores = { appStore: "in the App Store", googlePlay: "on Google Play" } as const;
const inStores = (key: string): key is keyof typeof stores => key in stores;

/**
 * Store links for an app, never a dead button. `primary` makes the first live link the page's one primary action.
 * A released app whose store link is not in the site yet says how to find it ("Search for OmegaFyt in the App
 * Store"); an app that has not shipped lists each store as "Coming soon".
 */
export function GetApp({ app, primary = false }: { app: App; primary?: boolean }) {
  const links = [
    { key: "appStore", label: "App Store", href: app.stores.appStore, cta: `Get ${app.label} on the App Store` },
    { key: "googlePlay", label: "Google Play", href: app.stores.googlePlay, cta: `Get ${app.label} on Google Play` },
    ...(app.stores.web !== undefined
      ? [{ key: "web", label: "Web", href: app.stores.web ?? null, cta: `Open ${app.name} on the web` }]
      : []),
  ];
  const live = links.filter((l) => l.href);
  const pending = links.filter((l) => !l.href);
  // A released app is in the stores: say where to look. The web address is only ever linked, never searched for.
  const searchable = app.released ? pending.flatMap((l) => (inStores(l.key) ? [stores[l.key]] : [])) : [];
  const comingSoon = pending.filter((l) => !(app.released && inStores(l.key)));
  return (
    <div className="flex flex-col gap-3">
      {live.length ? (
        <div className="flex flex-wrap gap-3">
          {live.map((l, i) => (
            <ButtonLink
              key={l.key}
              href={l.href!}
              external
              variant={primary && i === 0 ? "primary" : "secondary"}
              icon="external"
              iconPosition="end"
            >
              {l.cta}
            </ButtonLink>
          ))}
        </div>
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
      {!app.released && !live.length ? (
        <Text variant="caption" tone="muted">
          Store links appear here at launch.
        </Text>
      ) : null}
    </div>
  );
}
