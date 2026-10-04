import { describe, expect, it } from "vitest";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { site } from "@/content/site";
import { absoluteUrl, latestUpdate } from "@/content/structured-data";
import { GET } from "./llms.txt/route";

// /llms.txt is generated from the content, so the silence list (CLAUDE.md content rules and the audit's
// AI-SEARCH-12) is checked on the output: no price, trial, rating, download count, hype or speed word, and no
// store link while an app's listings are null.

const response = GET();
const text = await response.text();
const lines = text.split("\n");
const lineFor = (name: string) => lines.find((l) => l.startsWith(`- [${name}](`));

describe("/llms.txt", () => {
  it("is served as plain text that can be cached", () => {
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("cache-control")).toContain("public");
    expect(text.endsWith("\n")).toBe(true);
  });

  it("opens with the site name and the family sentence", () => {
    expect(lines[0]).toBe(`# ${site.name}`);
    expect(lines[2]).toBe(`> ${site.description}`);
    expect(text).toContain(`App facts checked ${latestUpdate()}; site content updated ${site.contentUpdated}.`);
  });

  it("lists every app with its page URL, definition and sale model", () => {
    for (const app of apps) {
      const line = lineFor(app.name);
      expect(line, app.slug).toBeDefined();
      expect(line).toContain(`](${absoluteUrl(`/apps/${app.slug}`)}): `);
      expect(line).toContain(app.definition ?? app.summary);
      expect(line).toContain(app.model === "subscription" ? "Subscription" : "One-time purchase");
      for (const platform of app.platforms) expect(line).toContain(platform);
    }
  });

  it("lists every calculator with its page URL and description", () => {
    for (const c of calculators) {
      const line = lineFor(c.title);
      expect(line, c.slug).toBeDefined();
      expect(line).toContain(`](${absoluteUrl(`/calculators/${c.slug}`)}): ${c.description}`);
    }
  });

  it("points at the pricing, privacy and support pages", () => {
    for (const path of ["/pricing", "/privacy", "/support", "/apps", "/sitemap.xml"]) expect(text).toContain(`](${absoluteUrl(path)})`);
  });

  it("states only the content's prices and trials, and no rating or download count", () => {
    // Every amount in the file is one the content sets (apps.ts price and plans); nothing else carries a currency.
    const contentPrices = new Set(apps.flatMap((a) => [a.price, ...(a.plans ?? [])]).filter(Boolean).map((p) => p!.display));
    for (const m of text.matchAll(/[$€£¥]\s?\d[\d,]*(?:\.\d\d)?/g)) expect(contentPrices, m[0]).toContain(m[0]);
    expect(text).not.toMatch(/\d\s?(USD|EUR|GBP)\b/);
    expect(text).not.toMatch(/\bfrom \d/i);
    // A free trial is named only for an app whose content sets one.
    const trialApps = apps.filter((a) => a.trial);
    for (const line of text.split("\n").filter((l) => /free trial/i.test(l)))
      expect(trialApps.some((a) => line.startsWith(`- [${a.name}](`)), line).toBe(true);
    expect(text).not.toMatch(/\b(rating|ratings|stars|downloads|users)\b/i);
    expect(text).not.toMatch(/#1\b/);
  });

  it("uses no hype or speed words and no absolute privacy claim", () => {
    expect(text).not.toMatch(/\b(revolutionary|seamless|powerful|ultimate|fast|instant|instantly|best)\b/i);
    expect(text).not.toMatch(/never leaves/i);
  });

  it("never ends a URL with a full stop, so a naive extractor keeps the address whole", () => {
    // A URL runs to whitespace or a closing bracket; the character after it is never ".".
    for (const m of text.matchAll(/https?:\/\/[^\s<>()\]]+/g)) {
      const after = text[m.index + m[0].length];
      expect(after, m[0]).not.toBe(".");
      expect(m[0].endsWith("."), m[0]).toBe(false);
    }
    for (const app of apps) {
      for (const link of [app.stores.appStore, app.stores.googlePlay, app.stores.web].filter(Boolean) as string[]) {
        expect(text).toContain(`<${link}>`);
      }
    }
  });

  it("links a store only once the content has the listing", () => {
    for (const app of apps) {
      const line = lineFor(app.name) ?? "";
      const links = [app.stores.appStore, app.stores.googlePlay, app.stores.web].filter(Boolean) as string[];
      for (const link of links) expect(line, app.slug).toContain(link);
      if (!links.length) {
        expect(line, app.slug).not.toMatch(/apps\.apple\.com|play\.google\.com/);
        // The only URL on the line is the app's own page.
        expect(line.match(/https?:\/\//g)?.length, app.slug).toBe(1);
        expect(line, app.slug).toContain(app.released ? "In the App Store and Google Play." : "Not yet in the stores.");
      }
    }
  });
});
