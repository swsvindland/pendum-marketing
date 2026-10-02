import type { MetadataRoute } from "next";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { site } from "@/content/site";

type Entry = { path: string; priority: number; changeFrequency: "monthly" | "yearly" };

/**
 * Every public route, built from the content so a new app or calculator is listed without an edit here. The kit
 * gallery is left out (robots.ts disallows it). No lastModified: the site has no real edit dates to report.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { path: "/", priority: 1, changeFrequency: "monthly" },
    { path: "/apps", priority: 0.9, changeFrequency: "monthly" },
    ...apps.map((a): Entry => ({ path: `/apps/${a.slug}`, priority: 0.9, changeFrequency: "monthly" })),
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/calculators", priority: 0.8, changeFrequency: "monthly" },
    ...calculators.map((c): Entry => ({ path: `/calculators/${c.slug}`, priority: 0.7, changeFrequency: "yearly" })),
    { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/support", priority: 0.4, changeFrequency: "yearly" },
  ];
  return entries.map(({ path, priority, changeFrequency }) => ({
    url: new URL(path, site.url).toString(),
    changeFrequency,
    priority,
  }));
}
