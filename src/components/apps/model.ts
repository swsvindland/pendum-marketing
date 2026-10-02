import type { App } from "@/content/types";

/** How an app is sold, in words. Never a price: `app.price` stays null until the owner sets one. */
export function modelLabel(app: App) {
  return app.model === "subscription" ? "Subscription" : "One-time purchase";
}

/** "A, B and C": the site's lists take no serial comma, so en-GB rather than en-US. */
export const listFormat = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" });

/** Whether an app runs on a watch as well as the phone (sets the integrations heading). */
export function hasWatch(app: App) {
  return app.platforms.some((p) => /watch|wear os/i.test(p));
}
