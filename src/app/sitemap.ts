import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap";

// Only `default` is exported: Next's metadata-route loader re-exports every named export of this file from its
// generated route, so the builders live in src/lib/sitemap.ts, where the tests import them.

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap();
}
