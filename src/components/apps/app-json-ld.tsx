import { JsonLd } from "@/components/site/json-ld";
import { softwareApplication } from "@/content/structured-data";
import type { App } from "@/content/types";

/**
 * SoftwareApplication structured data for an app page, built by src/content/structured-data.ts from the same
 * content the page renders: category, systems, shipped features, languages, version, publisher and the store
 * listings that exist. `offers` is left out while the price is null, never set to 0 (an unset price is not a free
 * app), and there is never a rating. Google's Software App rich result needs a price and a rating, so Search
 * Console lists these pages as not eligible for it; the markup is for every engine that reads JSON-LD.
 */
export function AppJsonLd({ app }: { app: App }) {
  return <JsonLd data={softwareApplication(app)} />;
}
