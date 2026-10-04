import { apps } from "./apps";
import { listFormat } from "./format";
import { site } from "./site";
import type { App, CalculatorMeta, Feature, Price, Question } from "./types";
import { isShipped } from "./version";

/**
 * Pure builders for the site's JSON-LD, reading the content so the markup can never drift from what the pages
 * say. Each builder returns a plain object with its own `@context`, ready for `<JsonLd data={...} />`
 * (src/components/site/json-ld.tsx). Nothing here invents a fact: a null price means no `offers`, a null store link
 * means no `sameAs`, and there is never an `aggregateRating`, a download count or a screenshot (the specimens are
 * fictional readouts, not screenshots). The optional content fields fall back to the required ones
 * (`definition ?? summary`, `updated ?? site.contentUpdated`) so the builders work while the content is filled in.
 */

const SCHEMA = "https://schema.org";

/** An absolute URL on the site for a path (or an absolute URL, returned as is). */
export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

/** The `@id` of the Organization node, referenced by every page's `publisher`. */
export const organizationId = absoluteUrl("/#organization");
/** The `@id` of the WebSite node, referenced by every page's `isPartOf`. */
export const websiteId = absoluteUrl("/#website");

const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

/** Platform names as the site shows them, mapped to the operating systems schema.org expects. */
export const operatingSystemFor = (platform: string) =>
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

/** BCP 47 tags for the language names the content uses. A name not listed here is left out rather than guessed. */
const LANGUAGE_TAGS: Record<string, string> = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Dutch: "nl",
  Swedish: "sv",
  Japanese: "ja",
  Korean: "ko",
  "Simplified Chinese": "zh-Hans",
  "Traditional Chinese": "zh-Hant",
};

/** The BCP 47 tag for a language name as the content writes it, or undefined when it is not known. */
export const languageTag = (name: string): string | undefined => LANGUAGE_TAGS[name.trim()];

// Version gating lives in ./version so apps.ts can gate its own statements without importing this module.
export { compareVersions, isShipped } from "./version";

/** The items of a feature list that are in the public build (see isShipped). */
export function shipped<T extends Pick<Feature, "since">>(items: readonly T[], app: Pick<App, "version">): T[] {
  return items.filter((item) => isShipped(item, app));
}

/** The app's shipped features, for the feature list and the page. */
export const shippedFeatures = (app: App) => shipped(app.features, app);

/** The newest `updated` date across the apps, or the site's content date when none is set yet. */
export function latestUpdate(): string {
  const dates = apps.map((a) => a.updated).filter(isString);
  return dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : site.contentUpdated;
}

/** A schema.org Offer from a price, or nothing while the price is null (an unset price is not a free app). */
export function offerFor(price: Price | null) {
  if (!price) return undefined;
  const amount = price.amount.toFixed(2);
  const offer = { "@type": "Offer", price: amount, priceCurrency: price.currency };
  if (price.period === "once") return offer;
  // A subscription plan: the amount is per billing period, stated so a reader never takes it as a one-time price.
  return {
    ...offer,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: amount,
      priceCurrency: price.currency,
      billingDuration: 1,
      unitCode: price.period === "month" ? "MON" : "ANN",
    },
  };
}

/**
 * The schema.org offers for an app, from its content price: one Offer for a one-time price, one per plan for a
 * subscription. Each says what kind of price it is (a paid download, an in-app unlock after a free trial, a plan
 * with a trial), and `availability` is stated only when the content knows it: InStock for a live listing, PreOrder
 * for a pre-order. Nothing while the app has no price.
 */
export function offersFor(app: Pick<App, "price" | "plans" | "unlock" | "trial" | "released" | "stores">) {
  const list = app.plans?.length ? app.plans : app.price ? [app.price] : [];
  if (!list.length) return undefined;
  const availability =
    app.released && app.stores.state === "live"
      ? `${SCHEMA}/InStock`
      : app.stores.state === "preorder"
        ? `${SCHEMA}/PreOrder`
        : undefined;
  const offers = list.map((price) => {
    const description = app.unlock
      ? `One-time in-app unlock. The download is free${app.trial ? ` with a ${app.trial.days}-day free trial` : ""}.`
      : price.period === "once"
        ? "Paid once when downloaded."
        : app.trial && price.period === (app.trial.plan ?? "year")
          ? `${price.period === "month" ? "Monthly" : "Yearly"} plan with a ${app.trial.days}-day free trial for new subscribers.`
          : `${price.period === "month" ? "Monthly" : "Yearly"} plan.`;
    return { ...offerFor(price)!, description, ...(availability ? { availability } : {}) };
  });
  return offers.length === 1 ? offers[0] : offers;
}

/** The store and web listings that exist today, for `sameAs`. Null links are left out, never guessed. */
export const storeLinks = (app: App) => [app.stores.appStore, app.stores.googlePlay, app.stores.web].filter(isString);

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The site graph for the root layout: the Organization (the publisher, with the touch icon as its logo) and the
 * WebSite that names the family. `sameAs` and `contactPoint` appear only when the content has the data; site.ts
 * has no profile URLs yet, and the support address stays null until the owner sets one.
 */
export function siteGraph() {
  const subscriptionNames = apps.filter((a) => a.model === "subscription").map((a) => a.name);
  const platforms = [...new Set(apps.flatMap((a) => a.platforms))];
  const sameAs = ((site as { sameAs?: readonly string[] }).sameAs ?? []).filter(isString);
  const organization = {
    "@type": "Organization",
    "@id": organizationId,
    name: site.publisher ?? site.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/apple-icon"), width: 180, height: 180 },
    description: `Developer of ${listFormat.format([...subscriptionNames, site.series.sentence])}: fitness apps for ${listFormat.format(platforms)}.`,
    ...(sameAs.length ? { sameAs } : {}),
    ...(site.supportEmail
      ? { contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: site.supportEmail }] }
      : {}),
  };
  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: absoluteUrl("/"),
    name: site.name,
    alternateName: `${site.name} fitness apps`,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": organizationId },
  };
  return { "@context": SCHEMA, "@graph": [organization, website] };
}

/**
 * SoftwareApplication for an app page. Google's Software App rich result needs `offers.price` and a rating or
 * review; the site has no ratings and never invents one, so Search Console lists these as not eligible whether or
 * not a price is set. The markup still states, for every engine that reads JSON-LD, what the app is: its category
 * and subcategory, systems, shipped features, languages, version, publisher and the listings that exist.
 */
export function softwareApplication(app: App) {
  const url = absoluteUrl(`/apps/${app.slug}`);
  const offers = offersFor(app);
  const sameAs = storeLinks(app);
  const alternateNames = [app.category ? `${app.name} ${app.category}` : "", app.storeName ?? ""].filter(Boolean);
  const inLanguage = app.languages.map(languageTag).filter(isString);
  const subCategory = app.subCategory ?? (app.category ? sentenceCase(app.category) : undefined);
  return {
    "@context": SCHEMA,
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: app.name,
    ...(alternateNames.length ? { alternateName: alternateNames.length === 1 ? alternateNames[0] : alternateNames } : {}),
    url,
    description: app.definition ?? app.summary,
    applicationCategory: "HealthApplication",
    ...(subCategory ? { applicationSubCategory: subCategory } : {}),
    operatingSystem: [...new Set(app.platforms.map(operatingSystemFor))],
    featureList: shippedFeatures(app).map((f) => f.title),
    ...(inLanguage.length ? { inLanguage } : {}),
    isAccessibleForFree: false,
    dateModified: app.updated ?? site.contentUpdated,
    image: absoluteUrl(app.icon.light),
    publisher: { "@id": organizationId },
    isPartOf: { "@id": websiteId },
    ...(app.version ? { softwareVersion: app.version } : {}),
    ...(offers ? { offers } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** A cited source as a calculator page lists it; only the ones with a link become `citation` URLs. */
export type Citation = { label: string; href?: string };

/**
 * WebApplication for a calculator page: a free browser tool, with the page's linked sources as citations and the
 * date its method was last reviewed (the argument, then the content's `reviewed`, then the site's content date).
 */
export function webApplication(meta: CalculatorMeta, sources: readonly Citation[] = [], reviewed?: string) {
  const url = absoluteUrl(`/calculators/${meta.slug}`);
  const citation = sources.map((s) => s.href).filter(isString);
  return {
    "@context": SCHEMA,
    "@type": "WebApplication",
    "@id": `${url}#tool`,
    name: meta.title,
    url,
    description: meta.description,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Fitness calculator",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: "en",
    dateModified: reviewed ?? meta.reviewed ?? site.contentUpdated,
    publisher: { "@id": organizationId },
    isPartOf: { "@id": websiteId },
    ...(citation.length ? { citation } : {}),
  };
}

/** One entry of an ItemList: a name and a path or URL. */
export type ListItem = { name: string; url: string };

/** An ordered ItemList (the apps index, the calculators index). URLs are made absolute. */
export function itemList(name: string, items: readonly ListItem[]) {
  return {
    "@context": SCHEMA,
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

/** The apps as ItemList entries, in site order. */
export const appListItems = (): ListItem[] => apps.map((a) => ({ name: a.name, url: `/apps/${a.slug}` }));

/** Calculators as ItemList entries, in the content's order. */
export const calculatorListItems = (list: readonly CalculatorMeta[]): ListItem[] =>
  list.map((c) => ({ name: c.title, url: `/calculators/${c.slug}` }));

/** One crumb: the last one is the current page and gets no `item` URL, as Google's breadcrumb guide allows. */
export type Crumb = { name: string; href?: string };

/** A BreadcrumbList from the trail, e.g. Home › Calculators › TDEE calculator. */
export function breadcrumbList(items: readonly Crumb[]) {
  const last = items.length - 1;
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(i < last && crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}

/**
 * FAQPage from plain-string questions, the same strings the page renders, so the markup matches the visible text.
 * Further paragraphs join the answer with blank lines. No rich result since May 2026; this is entity value only.
 */
export function faqPage(questions: readonly Question[]) {
  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: [q.answer, ...(q.paragraphs ?? [])].join("\n\n") },
    })),
  };
}
