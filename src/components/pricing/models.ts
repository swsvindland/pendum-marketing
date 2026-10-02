import { apps } from "@/content/apps";
import type { App } from "@/content/types";

/** OmegaFyt: the one subscription app (account, server, sync). */
export const subscriptionApp = apps.find((a) => a.model === "subscription");

/** Vector Body, Lift, Macros and Hydration: one-time purchases with no account. */
export const purchaseApps = apps.filter((a) => a.model === "purchase");

/** True once the owner has set a price for at least one Vector app. */
export const purchasePriced = purchaseApps.some((a) => a.price);

/**
 * An app's price as the site may state it: the owner's price when `app.price` is set, otherwise the model in
 * words. Never a number, a trial length or a bundle the owner has not decided (CLAUDE.md content rules).
 */
export function priceText(app: App) {
  if (app.price) return app.price;
  return app.model === "subscription"
    ? "Subscription, priced in the App Store and Google Play"
    : "One-time purchase, price set at launch";
}

/** The price line for the Vector apps as a group. */
export function purchasePriceText() {
  return purchasePriced ? "One-time purchase for each app" : "One-time purchase, price set at launch";
}
