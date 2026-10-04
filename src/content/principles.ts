import { apps } from "./apps";
import { listFormat } from "./format";
import type { Principle } from "./types";

/**
 * The languages clause of the last principle, from the app data: it names only the apps that ship more than one
 * interface language and is empty when none does. It is spliced into a sentence, so it opens with ", and" and
 * carries no full stop.
 */
export function languageClause(): string {
  const translated = apps.filter((a) => a.languages.length > 1);
  if (!translated.length) return "";
  const count = Math.min(...translated.map((a) => a.languages.length));
  const names = listFormat.format(translated.map((a) => a.name));
  return `, and ${names} ${translated.length > 1 ? "offer" : "offers"} ${count} interface languages`;
}

/**
 * Four principles from the design system's character (design-system §1), one sentence each, true of all five
 * apps. The home page draws them as a grid and /about as a fact list, both from this one list, so the two cannot
 * drift. The account, server and analytics facts of the four Pendum apps are stated once, in the chooser and on
 * each app page, not again here.
 */
export const principles: Principle[] = [
  {
    icon: "lock",
    title: "Health sync is opt-in",
    body: "In every app, Apple Health and Health Connect sync is off until you turn it on.",
  },
  {
    icon: "ruler",
    title: "Every value in text",
    body: "Measurements are set in a fixed-width face with the unit beside them, and a meter or color never carries meaning on its own.",
  },
  {
    icon: "document",
    title: "One design system",
    body: "All five apps share the same type, rules and readouts, so a number reads the same way in each of them.",
  },
  {
    icon: "language",
    title: "Your units, your language",
    body: `Every app takes kilograms or pounds, centimeters or inches, milliliters or fluid ounces where they apply${languageClause()}.`,
  },
];
