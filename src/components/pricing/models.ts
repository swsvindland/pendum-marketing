import { apps, priceShort, purchaseApps } from "@/content/apps";
import { site } from "@/content/site";
import type { App, Price } from "@/content/types";

// The subscription app and the one-time purchase apps are the content's (src/content/apps.ts).
export { purchaseApps, subscriptionApp } from "@/content/apps";

/** True once the owner has set a price for at least one of the purchase apps. */
export const purchasePriced = purchaseApps.some((a) => a.price);

/**
 * The price line under a plan name ("$7.99 a month or $49.99 a year"), or nothing while the app has no price. The
 * model is already in the panel's eyebrow and terms, so an unpriced plan carries no placeholder line.
 */
export const priceLine = (app: App) => priceShort(app) || undefined;

/**
 * The purchase apps' prices as a range for the plan panel ("$4.99 to $19.99 each"), or nothing until every one of
 * them has a price in one currency.
 */
export function purchasePriceRange(list: readonly App[] = purchaseApps) {
  const prices = list.map((a) => a.price);
  if (!prices.length || prices.some((p) => !p) || new Set(prices.map((p) => p!.currency)).size > 1) return undefined;
  const amounts = prices.map((p) => p!.amount);
  const currency = prices[0]!.currency;
  const low = money(Math.min(...amounts), currency);
  const high = money(Math.max(...amounts), currency);
  return low === high ? `${low} each, once` : `${low} to ${high} each, once`;
}

/** A money amount in the price's currency, as the store would print it ("$59.97"). */
export const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

/** What one price costs over three years: once, 36 monthly renewals or 3 yearly ones. */
export const threeYearAmount = (price: Price) =>
  price.period === "once" ? price.amount : price.period === "month" ? price.amount * 36 : price.amount * 3;

export type CostLine = { label: string; value: string };

/**
 * The lines of the "Three years" panel, computed only from prices the owner has set in the content: each priced
 * one-time app once, the whole set once when every one of them is priced in one currency, and the subscription
 * plan over 36 months or 3 years. Empty while no app has a price, so the page omits the panel.
 */
export function threeYearLines(list: readonly App[] = apps): CostLine[] {
  const lines: CostLine[] = [];
  const purchase = list.filter((a) => a.model === "purchase");
  const priced = purchase.filter((a): a is App & { price: Price } => a.price !== null);
  for (const app of priced) lines.push({ label: `${app.name}, once`, value: money(app.price.amount, app.price.currency) });
  const currency = priced[0]?.price.currency;
  if (priced.length > 1 && priced.length === purchase.length && priced.every((a) => a.price.currency === currency)) {
    const sum = priced.reduce((total, a) => total + a.price.amount, 0);
    lines.push({ label: `All ${priced.length} ${site.series.label}, once`, value: money(sum, currency) });
  }
  for (const app of list.filter((a) => a.model === "subscription")) {
    if (!app.price) continue;
    const plan = app.plan ?? app.name;
    const label =
      app.price.period === "month"
        ? `${plan}, monthly for 36 months`
        : app.price.period === "year"
          ? `${plan}, yearly for 3 years`
          : `${plan}, once`;
    lines.push({ label, value: money(threeYearAmount(app.price), app.price.currency) });
  }
  return lines;
}
