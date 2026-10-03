import type { Metadata } from "next";
import { pageMetadata } from "@/components/site/metadata";
import { getCalculator, type CalculatorSlug } from "@/content/calculators";
import type { CalculatorMeta } from "@/content/types";

// Each calculator has its own static route, src/app/calculators/<slug>/page.tsx, so a page references only its own
// tool and ships no other calculator's code. content/calculators.ts stays the one source of titles, descriptions,
// the sitemap and the lists; these helpers read it for a route.

/** The content entry for a route. The slug is typed, so a route for a calculator that is not listed fails to compile. */
export function calculatorMeta(slug: CalculatorSlug): CalculatorMeta {
  const meta = getCalculator(slug);
  if (!meta) throw new Error(`No calculator "${slug}" in content/calculators.ts`);
  return meta;
}

/**
 * The route's metadata: the title and the list description, plus what is true of every calculator. Units are
 * remembered in this browser, so the line is about what is typed, not "nothing stored".
 */
export function calculatorMetadata(meta: CalculatorMeta): Metadata {
  return pageMetadata({
    title: meta.title,
    description: `${meta.description} Free, with no sign-up. Nothing you type is sent anywhere.`,
    path: `/calculators/${meta.slug}`,
  });
}
