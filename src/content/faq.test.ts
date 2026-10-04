import { describe, expect, it } from "vitest";
import { analyticsSentence, apps, seriesNames, subscriptionApp } from "./apps";
import { billingQuestions, homeQuestions, supportGroups } from "./faq";
import { lowerFirst } from "./format";

const all = [...homeQuestions, ...billingQuestions, ...supportGroups.flatMap((g) => g.items)];

describe("site questions", () => {
  it("asks each question once per list and ends every question with a question mark", () => {
    for (const list of [homeQuestions, billingQuestions, ...supportGroups.map((g) => g.items)]) {
      expect(new Set(list.map((q) => q.question)).size).toBe(list.length);
    }
    for (const q of all) expect(q.question).toMatch(/\?$/);
  });

  it("opens at most one billing answer with the full four-name list", () => {
    const list = seriesNames();
    expect(billingQuestions.filter((q) => q.answer.replace(/^(Yes|No)\. /, "").startsWith(list)).length).toBeLessThanOrEqual(1);
  });

  it("states Pendum One's analytics from the version-gated sentence", () => {
    if (!subscriptionApp) return;
    const q = homeQuestions.find((q) => /analytics/i.test(q.question));
    expect(q?.answer).toContain(`${subscriptionApp.name}: ${lowerFirst(analyticsSentence(subscriptionApp))}`);
  });

  it("states only the content's prices and trials, and no store link", () => {
    const prices = new Set(apps.flatMap((a) => [a.price, ...(a.plans ?? [])]).filter(Boolean).map((p) => p!.display));
    const trialDays = new Set(apps.map((a) => a.trial?.days).filter(Boolean).map(String));
    for (const q of all) {
      const text = [q.answer, ...(q.paragraphs ?? [])].join(" ");
      for (const m of text.matchAll(/\$\d[\d,]*(?:\.\d\d)?/g)) expect(prices, `${q.question}: ${m[0]}`).toContain(m[0]);
      for (const m of text.matchAll(/(\d+)-day (?:free )?trial/g)) expect(trialDays, `${q.question}: ${m[0]}`).toContain(m[1]);
      expect(text, q.question).not.toMatch(/apps\.apple\.com|play\.google\.com/);
    }
  });
});
