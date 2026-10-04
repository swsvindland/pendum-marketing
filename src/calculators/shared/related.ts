import { calculators, categoryOrder } from "@/content/calculators";
import type { CalculatorMeta } from "@/content/types";

/** Related calculators: never fewer than 3; up to 4, or 5 when four or more share the category or the app. */
export const RELATED_MIN = 3;
export const relatedMax = (close: number) => (close >= 4 ? 5 : 4);

/**
 * The calculators to list beside one: those that share its category or its app (`close`), then one from each
 * category none of them is in, so every list crosses categories and the lone ones (water, heart rate) are reached.
 * Siblings start the cross-category picks at different categories, by their position in their own category, and
 * each takes as many as the siblings need to link every other category between them: the four nutrition
 * calculators reach body, strength, hydration and cardio, one each; the three body and the three strength
 * calculators take two each. With no close calculator (water, heart rate) the list is one from each other category.
 */
export function relatedTo(meta: CalculatorMeta): { items: CalculatorMeta[]; close: boolean } {
  const others = calculators.filter((c) => c.slug !== meta.slug);
  const close = others.filter((c) => c.category === meta.category || (meta.app !== undefined && c.app === meta.app));
  const represented = new Set([meta.category, ...close.map((c) => c.category)]);
  const unrepresented = categoryOrder.filter((category) => !represented.has(category));
  const siblings = calculators.filter((c) => c.category === meta.category);
  const turn = unrepresented.length ? siblings.findIndex((c) => c.slug === meta.slug) % unrepresented.length : 0;
  const rotated = [...unrepresented.slice(turn), ...unrepresented.slice(0, turn)];
  const across = rotated.flatMap((category) => others.filter((c) => c.category === category && !close.includes(c)).slice(0, 1));
  const picks = Math.ceil(across.length / siblings.length);
  const count = Math.max(RELATED_MIN, Math.min(relatedMax(close.length), close.length + picks));
  // Should those not reach the minimum, the rest fill in the content's order.
  const rest = others.filter((c) => !close.includes(c) && !across.includes(c));
  return { items: [...close, ...across, ...rest].slice(0, count), close: close.length > 0 };
}
