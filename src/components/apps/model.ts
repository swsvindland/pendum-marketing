import type { OgImage } from "@/components/site/metadata";
import { listFormat, sentenceCase } from "@/content/format";
import { site } from "@/content/site";
import type { App } from "@/content/types";

/** How an app is sold, in words. Never a price: `app.price` stays null until the owner sets one. */
export function modelLabel(app: App) {
  return app.model === "subscription" ? "Subscription" : "One-time purchase";
}

/** Whether an app runs on a watch as well as the phone (sets the integrations heading and the watch row). */
export function hasWatch(app: App) {
  return app.platforms.some((p) => /watch|wear os/i.test(p));
}

/**
 * The web version in one sentence, read from `stores.web`: described while the address is not public, offered as
 * a place to open once it is. The one place this is said, so no page promises a launch.
 */
export const webNote = (app: App) =>
  app.stores.web
    ? "The same account opens in a browser, with no checkout."
    : "A web version opens the same account in a browser. Its address is not public yet.";

/**
 * The pre-order sentence for an index ("Pre-order on the App Store and pre-register on Google Play; the apps
 * download on release day."), naming only the stores whose pre-order links exist on an app in `preorder` state:
 * a store with no link is never open for pre-order. Empty while no app is in pre-order.
 */
export function preorderSentence(list: readonly App[]) {
  const preorder = list.filter((a) => a.stores.state === "preorder");
  const places = [
    preorder.some((a) => a.stores.appStore) ? "pre-order on the App Store" : "",
    preorder.some((a) => a.stores.googlePlay) ? "pre-register on Google Play" : "",
  ].filter(Boolean);
  if (!places.length) return "";
  return `${sentenceCase(places.join(" and "))}; the apps download on release day.`;
}

/**
 * The per-app Open Graph card drawn by app/apps/[slug]/opengraph-image.tsx, as Next's metadata takes it. The URL
 * carries the day the app's facts were checked as a version, so a redrawn card (a renamed app, a new feature
 * count) is fetched afresh by link previews that cached the old one; the route ignores the query.
 */
export const appOgImage = (app: App): OgImage => ({
  url: `/apps/${app.slug}/opengraph-image?v=${app.updated ?? site.contentUpdated}`,
  width: 1200,
  height: 630,
  alt: `${app.name}: ${app.category ?? "fitness app"} for ${listFormat.format(app.platforms)}. ${modelLabel(app)}.`,
});
