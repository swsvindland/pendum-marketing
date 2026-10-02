import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

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
