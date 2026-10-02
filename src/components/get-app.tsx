import type { App } from "@/content/types";
import { ButtonLink, Status, Text } from "@/vector";

/** How an app is sold, as a status word (never a pill badge, §2.6). */
export function ModelStatus({ app, className }: { app: App; className?: string }) {
  return app.model === "subscription" ? (
    <Status state="live" label="Subscription" meta={app.price ?? undefined} className={className} />
  ) : (
    <Status state="ok" label="One-time purchase" meta={app.price ?? undefined} className={className} />
  );
}

/**
 * Store links for an app. A store without a URL yet renders as text ("App Store · Coming soon"), never as a dead
 * button. `primary` makes the first live link the page's one primary action.
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
      {pending.length ? (
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Availability">
          {pending.map((l) => (
            <li key={l.key}>
              <Status state="idle" label={l.label} meta="Coming soon" />
            </li>
          ))}
        </ul>
      ) : null}
      {!live.length ? (
        <Text variant="caption" tone="muted">
          Store links appear here at launch.
        </Text>
      ) : null}
    </div>
  );
}
