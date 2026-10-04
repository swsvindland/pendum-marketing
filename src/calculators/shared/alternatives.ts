import { getApp, names } from "@/content/apps";
import { isShipped } from "@/content/structured-data";
import type { App, CalculatorMeta } from "@/content/types";

// While a calculator's own app is not in a store, the closing panel also offers the released app whose shipped
// features cover the same result. Each sentence is one from the feature's body in src/content/apps.ts (verified
// against the app repos there), named by the feature's title: `alternativeFor` checks the sentence is still in
// that body and the feature is shipped, and alternatives.test.ts fails when either stops being true, so a copy
// change in apps.ts can never leave a stale claim here.

export type Alternative = {
  /** The released app. */
  app: App;
  /** The feature's title in apps.ts. */
  feature: string;
  /** One sentence of that feature's body: what the app does with this calculator's result. */
  sentence: string;
};

const PENDUM_ONE_EXPENDITURE = {
  feature: "Expenditure from your data",
  sentence: `${names.one} estimates the energy you use each day from logged intake and weight change over 14-day windows.`,
};
const PENDUM_ONE_STRENGTH = {
  feature: "Body and strength reports",
  sentence: "Strength charts track an estimated one-rep max for 11 main lifts.",
};

/** The released alternative per calculator slug, where a shipped Pendum One feature covers the result. */
export const ALTERNATIVES: Readonly<Record<string, { app: App["slug"]; feature: string; sentence: string }>> = {
  tdee: { app: "one", ...PENDUM_ONE_EXPENDITURE },
  macros: { app: "one", ...PENDUM_ONE_EXPENDITURE },
  "one-rep-max": { app: "one", ...PENDUM_ONE_STRENGTH },
  "strength-score": { app: "one", ...PENDUM_ONE_STRENGTH },
};

/**
 * The released alternative for a calculator, or null: when its own app is released (nothing to stand in for),
 * when no alternative is listed, when that app is not released, or when the named feature is missing, not shipped
 * in the public build or no longer says the sentence.
 */
export function alternativeFor(meta: CalculatorMeta, own: App | undefined): Alternative | null {
  if (!own || own.released) return null;
  const entry = ALTERNATIVES[meta.slug];
  if (!entry) return null;
  const app = getApp(entry.app);
  if (!app || !app.released || app.slug === own.slug) return null;
  const feature = app.features.find((f) => f.title === entry.feature);
  if (!feature || !isShipped(feature, app) || !feature.body.includes(entry.sentence)) return null;
  return { app, feature: entry.feature, sentence: entry.sentence };
}
