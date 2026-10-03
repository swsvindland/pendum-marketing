import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Everything is open to crawlers except the kit gallery, which is a working page, not content. A build with no
 * real origin (no NEXT_PUBLIC_SITE_URL and no Vercel production URL, see site.ts) keeps crawlers out entirely and
 * lists no sitemap, so a preview never gets indexed with localhost addresses.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/kit" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
