/**
 * The site's origin for canonical links, Open Graph, the sitemap, robots and JSON-LD, in this order:
 * 1. NEXT_PUBLIC_SITE_URL, set per deployment. TODO(owner): set it to the production domain.
 * 2. Vercel's production domain (VERCEL_PROJECT_PRODUCTION_URL, present on every Vercel build, previews included),
 *    so a deploy without the variable still points at the real site rather than at localhost.
 * 3. Neither: http://localhost:3000, for local work. Such a build is not indexable: `site.indexable` is false and
 *    the root layout marks every page noindex, so a build that escapes without a URL never asks search engines to
 *    index localhost canonicals.
 * Server-only values (no NEXT_PUBLIC_ prefix on 2): read `url` and `indexable` from server code only. The names
 * are plain strings; a client part (the wordmark inside the root error boundary) may import them.
 */
const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

/**
 * Site-wide settings. Values marked TODO are owner decisions that are not in any repo yet (prices, store links,
 * contact address, domain). Leave them null until they are real: every page renders a sensible fallback, and
 * nothing on the site invents a price or a link.
 */
/** The family name. `name`, `series` and `title` below are built from it, so renaming the family is this one string. */
const family = "Pendum";

export const site = {
  name: family,
  /** The family name shown in the wordmark, the OG card, the footer and "More from {family}". Never written in page code. */
  family,
  /** The one collective noun for the four one-time purchase apps: a label and its sentence form. */
  series: { label: `${family} apps`, sentence: `the ${family} apps` },
  /** The day the site's content was last checked against the app repos; index pages report it as lastModified. */
  contentUpdated: "2026-10-03",
  /** Used in <title> templates and the footer. */
  title: `${family}: precise fitness apps for iPhone and Android`,
  /** The meta description: category first, then the two models, under 160 characters. */
  description:
    `Fitness apps for iPhone and Android: Pendum One, a subscription that syncs, and the four ${family} apps, bought once and kept on your phone. Free calculators.`,
  /** The origin (see above). */
  url: configuredUrl ?? "http://localhost:3000",
  /** False when no real origin is known (the localhost fallback): pages are then noindex. */
  indexable: configuredUrl !== undefined,
  /** TODO(owner): a support address that is monitored. */
  supportEmail: null as string | null,
  /**
   * The publisher's legal name, as both store listings show it (App Store seller name for id6755430666 and the
   * Google Play developer name, checked 2026-10-03). TODO(owner): confirm it is the name to show.
   */
  publisher: "Svindland Software LLC" as string | null,
} as const;

export const nav = [
  { href: "/apps", label: "Apps" },
  { href: "/pricing", label: "Pricing" },
  { href: "/calculators", label: "Calculators" },
] as const;
