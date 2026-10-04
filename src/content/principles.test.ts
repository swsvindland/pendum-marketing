import { describe, expect, it } from "vitest";
import { apps } from "./apps";
import { listFormat } from "./format";
import { languageClause, principles } from "./principles";

describe("principles", () => {
  it("has four short titles in sentence case and one or two sentences each", () => {
    expect(principles).toHaveLength(4);
    for (const p of principles) {
      expect(p.title.split(" ").length, p.title).toBeLessThanOrEqual(5);
      expect(p.title, p.title).toMatch(/^[A-Z][^.!?]*$/);
      expect(p.body, p.title).toMatch(/\.$/);
      expect(p.body.split(/\.\s/).length, p.title).toBeLessThanOrEqual(2);
      expect(p.body, p.title).not.toMatch(/\b(?:don|can|won|isn|aren)[’']t\b|!/);
    }
    expect(new Set(principles.map((p) => p.title)).size).toBe(principles.length);
  });

  it("names only the apps that ship more than one language, with their shared count", () => {
    const translated = apps.filter((a) => a.languages.length > 1);
    const clause = languageClause();
    if (!translated.length) {
      expect(clause).toBe("");
      return;
    }
    expect(clause).toBe(
      `, and ${listFormat.format(translated.map((a) => a.name))} ${translated.length > 1 ? "offer" : "offers"} ${Math.min(...translated.map((a) => a.languages.length))} interface languages`
    );
    for (const app of apps.filter((a) => a.languages.length <= 1)) expect(clause).not.toContain(app.name);
    expect(principles[3].body).toContain(clause);
  });
});
