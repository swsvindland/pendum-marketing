import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { searchAndAnswerAgents, trainingAgents } from "@/lib/crawlers";

/**
 * The site wants to be found and cited by search engines and AI assistants, so every crawler is allowed everywhere
 * except the kit gallery, which is a working page, not content.
 *
 * The AI agents are named even though `*` already allows them: a named group is what hosting and CDN "block AI
 * bots" presets, and future edits to the `*` group, are checked against, and it records the decision. A named
 * group replaces the `*` group for that bot, so each repeats the /kit exclusion. Who is who is documented with
 * the lists in src/lib/crawlers.ts (only `default` is exported here: Next's metadata-route loader re-exports
 * every named export of this file from its generated route).
 *
 * Owner checklist that this file cannot cover: if the domain is on Cloudflare, new zones block AI crawlers by
 * default (since 2025-07-01), so turn that off or allow-list the agents named; on Vercel, do not enable the
 * "block AI bots" firewall template; leave snippet controls (nosnippet, max-snippet) alone, Google's AI features
 * take their text from ordinary snippets.
 *
 * A build with no real origin (no NEXT_PUBLIC_SITE_URL and no Vercel production URL, see site.ts) keeps crawlers
 * out entirely and lists no sitemap, so a preview never gets indexed with localhost addresses.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/kit" },
      { userAgent: searchAndAnswerAgents, allow: "/", disallow: "/kit" },
      { userAgent: trainingAgents, allow: "/", disallow: "/kit" },
    ],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
