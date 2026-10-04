import { clsx, type ClassValue } from "clsx";

/**
 * The class joiner for the parts that every page carries (text, the native button and segmented control, the
 * glyph, the error states): clsx and the kit's one merge rule, that of several type roles the last one wins, so a
 * `className` role still replaces a part's own. Nothing else is merged: these parts take layout classes only in
 * `className` (margin, width, alignment, wrapping), never a second size, weight, tracking or colour. `cn` (./cn)
 * adds tailwind-merge for the HeroUI-backed parts and the server-only panels; it costs every page 8 KB when a
 * client island imports it, so the islands and what they render use this.
 */
export function cx(...inputs: ClassValue[]) {
  const joined = clsx(inputs);
  const first = joined.indexOf("type-");
  if (first === -1 || first === joined.lastIndexOf("type-")) return joined;
  const words = joined.split(" ");
  let last = -1;
  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].startsWith("type-")) {
      last = i;
      break;
    }
  }
  return words.filter((w, i) => !w.startsWith("type-") || i === last).join(" ");
}
