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
 * The route's metadata is the site's calculator metadata (components/site/metadata.ts): the title plus the words
 * `titleSuffix` adds to <title>, the list description with what is true of every calculator, the canonical path
 * and the shared card. Re-exported here so every route picks it up through the registry.
 */
export { calculatorMetadata } from "@/components/site/metadata";
