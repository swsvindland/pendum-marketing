import { afterEach, describe, expect, it, vi } from "vitest";
import { searchAndAnswerAgents, trainingAgents } from "@/lib/crawlers";

// site.ts reads the origin when it loads, so each case stubs the environment and imports robots.ts afresh.
async function load(origin: string) {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin);
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
  vi.resetModules();
  return import("./robots");
}

afterEach(() => vi.unstubAllEnvs());

type Rule = { userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[] };
const asArray = <T>(value: T | T[] | undefined): T[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

describe("crawlers", () => {
  it("names the search and AI agents once each", () => {
    for (const agent of ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Googlebot", "Bingbot", "Applebot"]) {
      expect(searchAndAnswerAgents).toContain(agent);
    }
    for (const agent of ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "Amazonbot", "meta-externalagent", "CCBot"]) {
      expect(trainingAgents).toContain(agent);
    }
    const named = [...searchAndAnswerAgents, ...trainingAgents];
    expect(new Set(named).size).toBe(named.length);
  });
});

describe("robots", () => {
  it("exports the route function alone, since Next re-exports every named export of a metadata route", async () => {
    const loaded = await load("https://example.test");
    expect(Object.keys(loaded)).toEqual(["default"]);
  });

  it("allows everything but the kit gallery to every crawler, and names the search and AI agents", async () => {
    const { default: robots } = await load("https://example.test");
    const result = robots();
    const rules = asArray(result.rules as Rule | Rule[]);
    expect(rules.length).toBe(3);
    expect(rules[0]).toEqual({ userAgent: "*", allow: "/", disallow: "/kit" });
    expect(rules[1].userAgent).toEqual(searchAndAnswerAgents);
    expect(rules[2].userAgent).toEqual(trainingAgents);
    for (const rule of rules) {
      expect(asArray(rule.allow)).toEqual(["/"]);
      expect(asArray(rule.disallow)).toEqual(["/kit"]);
    }
    expect(result.sitemap).toBe("https://example.test/sitemap.xml");
  });

  it("keeps every crawler out of a build with no real origin", async () => {
    const { default: robots } = await load("");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
