import { describe, expect, it, vi } from "vitest";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { site } from "@/content/site";
import { buildSitemap, gitDate, routes } from "@/lib/sitemap";
import * as route from "./sitemap";

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

describe("routes", () => {
  it("lists every public page once, with the files that define it", () => {
    const list = routes();
    const paths = list.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.length).toBe(7 + apps.length + calculators.length);
    for (const app of apps) expect(paths).toContain(`/apps/${app.slug}`);
    for (const c of calculators) expect(paths).toContain(`/calculators/${c.slug}`);
    for (const path of ["/", "/apps", "/pricing", "/calculators", "/privacy", "/support", "/about"]) expect(paths).toContain(path);
    expect(paths).not.toContain("/kit");
    expect(paths).not.toContain("/llms.txt");
    for (const r of list) {
      expect(r.files.length, r.path).toBeGreaterThan(0);
      for (const f of r.files) expect(f, r.path).toMatch(/^src\//);
    }
  });
});

describe("buildSitemap", () => {
  it("emits an absolute URL and the git date per route, and nothing else", () => {
    const entries = buildSitemap(() => "2026-10-02T21:07:52-04:00");
    expect(entries.length).toBe(routes().length);
    for (const entry of entries) {
      expect(Object.keys(entry).sort()).toEqual(["lastModified", "url"]);
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.url.startsWith(site.url)).toBe(true);
      expect(entry.lastModified).toBe("2026-10-02T21:07:52-04:00");
    }
    expect(entries[0].url).toBe(new URL("/", site.url).toString());
    expect(entries.map((e) => e.url)).toContain(new URL("/calculators/tdee", site.url).toString());
  });

  it("falls back to the content date when git has no date for a route", () => {
    for (const entry of buildSitemap(() => undefined)) expect(entry.lastModified).toBe(site.contentUpdated);
  });

  it("asks git once per distinct file set", () => {
    const dateFor = vi.fn(() => "2026-10-01T00:00:00+00:00");
    buildSitemap(dateFor);
    const distinct = new Set(routes().map((r) => r.files.join("\0"))).size;
    expect(dateFor).toHaveBeenCalledTimes(distinct);
    expect(distinct).toBeLessThan(routes().length);
  });
});

describe("gitDate", () => {
  const files = ["src/content/apps.ts"];
  /** A git that answers each command as a full, clean clone would. */
  const clean = (args: string[]) =>
    args[0] === "status" ? "" : args[0] === "rev-parse" ? "false\n" : "2026-10-02T21:07:52-04:00\n";

  it("returns the last commit date of clean, committed files in a full clone", () => {
    const run = vi.fn(clean);
    expect(gitDate(files, run)).toBe("2026-10-02T21:07:52-04:00");
    expect(run).toHaveBeenCalledWith(["status", "--porcelain", "--", ...files]);
    expect(run).toHaveBeenCalledWith(["rev-parse", "--is-shallow-repository"]);
    expect(run).toHaveBeenCalledWith(["log", "-1", "--format=%cI", "--", ...files]);
  });

  it("returns nothing for a file with uncommitted changes, without asking for its log", () => {
    const run = vi.fn((args: string[]) => (args[0] === "status" ? " M src/content/apps.ts\n" : clean(args)));
    expect(gitDate(files, run)).toBeUndefined();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("returns nothing in a shallow clone, without asking for a log that would date every file to the boundary commit", () => {
    const run = vi.fn((args: string[]) => (args[0] === "rev-parse" ? "true\n" : clean(args)));
    expect(gitDate(files, run)).toBeUndefined();
    expect(run).not.toHaveBeenCalledWith(["log", "-1", "--format=%cI", "--", ...files]);
  });

  it("returns nothing when git is unavailable or the files were never committed", () => {
    expect(gitDate(files, () => { throw new Error("git: command not found"); })).toBeUndefined();
    expect(gitDate(files, (args) => (args[0] === "log" ? "" : clean(args)))).toBeUndefined();
  });

  it("reads a real repository when one is present", () => {
    const date = gitDate(["package.json"]);
    expect(date === undefined || ISO_DATETIME.test(date), String(date)).toBe(true);
  });
});

describe("app/sitemap.ts", () => {
  it("exports the route function alone, since Next re-exports every named export of a metadata route", () => {
    expect(Object.keys(route)).toEqual(["default"]);
  });

  it("dates every route from git or the content date", () => {
    for (const entry of route.default()) {
      const date = String(entry.lastModified);
      expect(date === site.contentUpdated || ISO_DATETIME.test(date), `${entry.url}: ${date}`).toBe(true);
    }
  });
});
