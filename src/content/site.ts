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
  /** TODO(owner): the production domain. NEXT_PUBLIC_SITE_URL overrides it per deployment. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
