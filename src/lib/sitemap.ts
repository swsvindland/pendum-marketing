import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { site } from "@/content/site";

// The sitemap's builders, out of src/app/sitemap.ts: Next's metadata-route loader re-exports every named export of
// a route file from the generated route, so the route exports `default` alone and the tests import from here.

/** A public route and the files that define what it shows. */
export type Route = { path: string; files: string[] };

/** Runs git with the given arguments in the project and returns its output. */
export type GitRunner = (args: string[]) => string;

const runGit: GitRunner = (args) =>
  execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

/**
 * Every public route, built from the content so a new app or calculator is listed without an edit here, each with
 * the source files whose last commit dates it. The kit gallery is left out (robots disallows it) and so is
 * /llms.txt (a file, not a page).
 */
export function routes(): Route[] {
  const content = { site: "src/content/site.ts", apps: "src/content/apps.ts", calculators: "src/content/calculators.ts" };
  return [
    { path: "/", files: ["src/app/page.tsx", "src/components/home", content.site, content.apps] },
    { path: "/apps", files: ["src/app/apps/page.tsx", "src/components/apps", content.apps] },
    ...apps.map((a) => ({ path: `/apps/${a.slug}`, files: ["src/app/apps/[slug]", "src/components/apps", content.apps] })),
    { path: "/pricing", files: ["src/app/pricing", "src/components/pricing", content.apps] },
    { path: "/calculators", files: ["src/app/calculators/page.tsx", content.calculators, content.apps] },
    ...calculators.map((c) => ({
      path: `/calculators/${c.slug}`,
      files: [`src/app/calculators/${c.slug}`, `src/calculators/${c.slug}`, `src/lib/calc/${c.slug}.ts`, content.calculators],
    })),
    { path: "/privacy", files: ["src/app/privacy"] },
    { path: "/support", files: ["src/app/support"] },
    { path: "/about", files: ["src/app/about", content.site, content.apps] },
  ];
}

/**
 * The commit date (ISO 8601 with offset) of the last commit touching any of the files, or undefined when git is
 * unavailable, nothing is committed, any of the files has uncommitted changes (its content is then newer than any
 * commit), or the repository is a shallow clone. In a shallow clone the boundary commit appears to introduce every
 * file, so `git log -1 -- <file>` would date every route to the latest deploy's commit: a consistently inaccurate
 * lastmod, which search engines discard, so the caller falls back to the content date instead. Hosts build from
 * shallow clones by default (on Vercel, VERCEL_DEEP_CLONE=true restores the full history and with it the real
 * per-route dates).
 */
export function gitDate(files: readonly string[], run: GitRunner = runGit): string | undefined {
  try {
    if (run(["status", "--porcelain", "--", ...files]).trim()) return undefined;
    if (run(["rev-parse", "--is-shallow-repository"]).trim() === "true") return undefined;
    return run(["log", "-1", "--format=%cI", "--", ...files]).trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * The sitemap entries: an absolute URL and a lastModified per route, from git when the route's files are committed
 * and clean in a full clone, else the day the content was last checked (site.contentUpdated). No changeFrequency
 * or priority: Google ignores both and uses lastmod only when it is accurate.
 */
export function buildSitemap(dateFor: (files: readonly string[]) => string | undefined = gitDate): MetadataRoute.Sitemap {
  const cache = new Map<string, string | undefined>();
  const lastModified = (files: readonly string[]) => {
    const key = files.join("\0");
    if (!cache.has(key)) cache.set(key, dateFor(files));
    return cache.get(key) ?? site.contentUpdated;
  };
  return routes().map(({ path, files }) => ({ url: new URL(path, site.url).toString(), lastModified: lastModified(files) }));
}
