/**
 * The site's origin for canonical links, Open Graph, the sitemap, robots and JSON-LD, in this order:
 * 1. NEXT_PUBLIC_SITE_URL, set per deployment. TODO(owner): set it to the production domain.
 * 2. Vercel's production domain (VERCEL_PROJECT_PRODUCTION_URL, present on every Vercel build, previews included),
 *    so a deploy without the variable still points at the real site rather than at localhost.
 * 3. Neither: http://localhost:3000, for local work. Such a build is not indexable: `site.indexable` is false and
 *    the root layout marks every page noindex, so a build that escapes without a URL never asks search engines to
 *    index localhost canonicals.
 * Server-only values (no NEXT_PUBLIC_ prefix on 2): import `site` from server code only.
 */
const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

/**
 * Site-wide settings. Values marked TODO are owner decisions that are not in any repo yet (prices, store links,
 * contact address, domain). Leave them null until they are real: every page renders a sensible fallback, and
 * nothing on the site invents a price or a link.
 */
export const site = {
  name: "Vector",
  /** Used in <title> templates and the footer. */
  title: "Vector — fitness apps, precise by design",
  description:
    "Five fitness apps on one design system. OmegaFyt is the connected subscription. Vector Body, Lift, Macros and Hydration are one-time purchases that work offline. Free calculators included.",
  /** The origin (see above). */
  url: configuredUrl ?? "http://localhost:3000",
  /** False when no real origin is known (the localhost fallback): pages are then noindex. */
  indexable: configuredUrl !== undefined,
  /** TODO(owner): a support address that is monitored. */
  supportEmail: null as string | null,
  /** TODO(owner): the legal name shown in the footer. */
  publisher: null as string | null,
} as const;

export const nav = [
  { href: "/apps", label: "Apps" },
  { href: "/pricing", label: "Pricing" },
  { href: "/calculators", label: "Calculators" },
] as const;
