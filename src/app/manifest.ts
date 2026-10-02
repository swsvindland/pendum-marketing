import type { MetadataRoute } from "next";
import { brand } from "@/components/site/brand";
import { site } from "@/content/site";

/**
 * The web manifest. A manifest takes one colour per field, so it carries the light canvas; the dark canvas is set
 * per scheme in layout.tsx's viewport themeColor. The site opens in the browser: it is not an app to install.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    lang: "en",
    start_url: "/",
    display: "browser",
    background_color: brand.canvas,
    theme_color: brand.canvas,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
