import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The joiner for the HeroUI-backed parts and the server-only panels and lists, where a `className` may have to beat
// a slot class or a layout default. The parts every page carries (text, the native button and segmented control,
// the glyph, the error states, the nav islands) use ./cx instead: clsx with the role rule alone, so no island ships
// tailwind-merge (8 KB gzip) on every page.

/** The kit's type roles are one group, so a later role replaces an earlier one. */
const merge = extendTailwindMerge<"type-role">({
  extend: {
    classGroups: {
      "type-role": [
        {
          type: [
            "hero",
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "lead",
            "body",
            "body-strong",
            "small",
            "caption",
            "field-label",
            "button",
            "label",
            "readout-xl",
            "readout-l",
            "readout-m",
            "readout-s",
            "readout-xs",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}
