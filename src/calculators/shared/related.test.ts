import { describe, expect, it } from "vitest";
import { calculators, categoryOrder, getCalculator } from "@/content/calculators";
import { RELATED_MIN, relatedMax, relatedTo } from "./related";

describe("relatedTo", () => {
  it("lists 3 to 5 other calculators, each once, and at least one from another category", () => {
    for (const meta of calculators) {
      const { items } = relatedTo(meta);
      expect(items.length, meta.slug).toBeGreaterThanOrEqual(RELATED_MIN);
      expect(items.length, meta.slug).toBeLessThanOrEqual(5);
      expect(new Set(items.map((c) => c.slug)).size, meta.slug).toBe(items.length);
      expect(items.map((c) => c.slug), meta.slug).not.toContain(meta.slug);
      expect(items.some((c) => c.category !== meta.category), meta.slug).toBe(true);
    }
  });

  it("reaches every calculator from some other calculator, water and heart rate included", () => {
    const inbound = new Map(calculators.map((c) => [c.slug, 0]));
    for (const meta of calculators) for (const item of relatedTo(meta).items) inbound.set(item.slug, inbound.get(item.slug)! + 1);
    for (const [slug, count] of inbound) expect(count, slug).toBeGreaterThanOrEqual(1);
    // The lone calculators are reached from a body, a nutrition and a strength page, and from each other.
    expect(inbound.get("heart-rate-zones")).toBeGreaterThanOrEqual(4);
    expect(inbound.get("water")).toBeGreaterThanOrEqual(4);
  });

  it("links every other category from each category's siblings between them", () => {
    for (const category of categoryOrder) {
      const siblings = calculators.filter((c) => c.category === category);
      const reached = new Set(siblings.flatMap((meta) => relatedTo(meta).items.map((c) => c.category)));
      for (const other of categoryOrder) if (other !== category) expect(reached.has(other), `${category} to ${other}`).toBe(true);
    }
  });

  it("spreads the cross-category picks across siblings", () => {
    const across = (slug: string) => {
      const meta = getCalculator(slug)!;
      return relatedTo(meta).items.filter((c) => c.category !== meta.category).map((c) => c.slug);
    };
    // Four nutrition calculators, four other categories: one pick each.
    expect(across("tdee")).toEqual(["bmi"]);
    expect(across("macros")).toEqual(["one-rep-max"]);
    expect(across("protein")).toEqual(["water"]);
    expect(across("calorie-deficit")).toEqual(["heart-rate-zones"]);
    // Three body and three strength calculators: two picks each, so the fourth category is reached too.
    expect(across("bmi")).toEqual(["tdee", "one-rep-max"]);
    expect(across("body-fat")).toEqual(["one-rep-max", "water"]);
    expect(across("ffmi")).toEqual(["water", "heart-rate-zones"]);
    expect(across("one-rep-max")).toEqual(["bmi", "tdee"]);
    expect(across("plates")).toEqual(["tdee", "water"]);
    expect(across("strength-score")).toEqual(["water", "heart-rate-zones"]);
  });

  it("gives the lone calculators one from each other category", () => {
    expect(relatedTo(getCalculator("water")!)).toEqual({ items: expect.any(Array), close: false });
    expect(relatedTo(getCalculator("water")!).items.map((c) => c.slug)).toEqual(["bmi", "tdee", "one-rep-max", "heart-rate-zones"]);
    expect(relatedTo(getCalculator("heart-rate-zones")!).items.map((c) => c.slug)).toEqual(["bmi", "tdee", "one-rep-max", "water"]);
  });

  it("allows a fifth only when four or more are close", () => {
    expect(relatedMax(3)).toBe(4);
    expect(relatedMax(4)).toBe(5);
  });
});
