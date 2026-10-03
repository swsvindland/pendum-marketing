import { site } from "@/content/site";
import type { App } from "@/content/types";

// Platform names as the site shows them, mapped to the operating systems schema.org expects.
const osFor = (platform: string) =>
  /iphone|ipad|\bios\b/i.test(platform)
    ? "iOS"
    : /apple watch|watchos/i.test(platform)
      ? "watchOS"
      : /wear os/i.test(platform)
        ? "Wear OS"
        : /android/i.test(platform)
          ? "Android"
          : /web|browser/i.test(platform)
            ? "Web"
            : platform;

// An ISO code in the price wins ("4.99 CAD"); otherwise the symbol. A bare "$" is read as US dollars (the owner
// confirms when setting a price). Anything else omits the offer rather than guess at it.
const currencyFor = (price: string) =>
  price.match(/\b[A-Z]{3}\b/)?.[0] ??
  (price.includes("€") ? "EUR" : price.includes("£") ? "GBP" : price.includes("$") ? "USD" : null);

/** A schema.org Offer from a display price ("$4.99"), or nothing when there is no price or it cannot be read. */
function offerFor(price: string | null) {
  if (!price) return undefined;
  const amount = price.match(/\d+(?:[.,]\d{1,2})?/)?.[0]?.replace(",", ".");
  const currency = currencyFor(price);
  if (!amount || !currency) return undefined;
  return { "@type": "Offer", price: amount, priceCurrency: currency };
}

/**
 * SoftwareApplication structured data for an app page, rendered as a plain script tag (Next's JSON-LD guide).
 * `<` is escaped so a string in the content can never close the tag.
 *
 * Kept minimal and valid schema.org on purpose. Google's Software App rich result needs `offers.price` and also an
 * `aggregateRating` or `review`; the site has no ratings and never invents one, so Search Console lists these
 * items as not eligible for that rich result whether or not a price is set. The markup still names the app, its
 * category, systems and page for search engines. `offers` is left out while the price is null, never set to 0:
 * an unset price is not a free app.
 */
export function AppJsonLd({ app }: { app: App }) {
  const offers = offerFor(app.price);
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.summary || app.tagline,
    applicationCategory: "HealthApplication",
    operatingSystem: [...new Set(app.platforms.map(osFor))].join(", ") || undefined,
    url: new URL(`/apps/${app.slug}`, site.url).toString(),
    image: new URL(app.icon.light, site.url).toString(),
    ...(offers ? { offers } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
