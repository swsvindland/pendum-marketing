import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Everything is open to crawlers except the kit gallery, which is a working page, not content. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/kit" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
