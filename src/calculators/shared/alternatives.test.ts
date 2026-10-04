import { describe, expect, it } from "vitest";
import { getApp } from "@/content/apps";
import { calculators, getCalculator } from "@/content/calculators";
import { isShipped } from "@/content/structured-data";
import { ALTERNATIVES, alternativeFor } from "./alternatives";

describe("alternatives", () => {
  it("names only shipped features whose body says the sentence, so the claim cannot drift from apps.ts", () => {
    for (const [slug, entry] of Object.entries(ALTERNATIVES)) {
      expect(getCalculator(slug), slug).toBeDefined();
      const app = getApp(entry.app)!;
      const feature = app.features.find((f) => f.title === entry.feature);
      expect(feature, `${slug}: feature "${entry.feature}" in ${app.name}`).toBeDefined();
      expect(isShipped(feature!, app), `${slug}: shipped`).toBe(true);
      expect(feature!.body, `${slug}: sentence`).toContain(entry.sentence);
      expect(entry.sentence).toMatch(/\.$/);
    }
  });

  it("offers Pendum One for tdee, macros, one-rep max and strength score while their app is unreleased", () => {
    for (const slug of ["tdee", "macros", "one-rep-max", "strength-score"]) {
      const meta = getCalculator(slug)!;
      const own = getApp(meta.app!)!;
      const alternative = alternativeFor(meta, own);
      if (own.released) {
        expect(alternative, slug).toBeNull();
      } else {
        expect(alternative?.app.slug, slug).toBe("one");
        expect(alternative?.app.released, slug).toBe(true);
      }
    }
  });

  it("offers nothing for the other calculators, for a released app or without an app", () => {
    for (const meta of calculators.filter((c) => !(c.slug in ALTERNATIVES))) {
      expect(alternativeFor(meta, meta.app ? getApp(meta.app) : undefined), meta.slug).toBeNull();
    }
    const tdee = getCalculator("tdee")!;
    expect(alternativeFor(tdee, undefined)).toBeNull();
    expect(alternativeFor(tdee, { ...getApp("macros")!, released: true })).toBeNull();
  });
});
