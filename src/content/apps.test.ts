import { describe, expect, it } from "vitest";
import { ANALYTICS_SINCE, analyticsSentence, apps, names, purchaseApps, seriesNames, subscriptionApp } from "./apps";
import { lowerFirst } from "./format";
import { shipped } from "./structured-data";
import { compareVersions } from "./version";

describe("app names", () => {
  it("keys every app's full name by its slug", () => {
    for (const app of apps) expect(names[app.slug]).toBe(app.name);
  });

  it("splits the apps by model", () => {
    expect(subscriptionApp?.model).toBe("subscription");
    expect(purchaseApps.every((a) => a.model === "purchase")).toBe(true);
    expect(purchaseApps.length + (subscriptionApp ? 1 : 0)).toBe(apps.length);
  });

  it("lists the purchase apps' full names without a serial comma", () => {
    const list = seriesNames();
    for (const app of purchaseApps) expect(list).toContain(app.name);
    expect(list).toMatch(/ and [^,]+$/);
  });
});

describe("chooser rows and header notes", () => {
  it("gives every app a chooser row whose facts restate its own shipped content", () => {
    for (const app of apps) {
      expect(app.chooser, app.slug).toBeDefined();
      const { want, facts } = app.chooser!;
      expect(want, app.slug).toMatch(/^I /);
      expect(want, app.slug).not.toMatch(/[.!?]$/);
      expect(facts, app.slug).not.toMatch(/[.!?]$/);
      const sources = [
        ...shipped([...app.features, ...app.integrations], app).flatMap((f) => [f.title, f.body]),
        ...app.caveats,
        app.definition ?? "",
        app.summary,
      ].map((text) => text.toLowerCase());
      for (const fact of facts.split(", ")) {
        expect(sources.some((text) => text.includes(fact.toLowerCase())), `${app.slug}: "${fact}"`).toBe(true);
      }
    }
  });

  it("restates a caveat in each header note, numbers included", () => {
    const noted = apps.filter((a) => a.note);
    expect(noted.map((a) => a.slug)).toEqual(["macros"]);
    for (const app of noted) {
      expect(app.note, app.slug).toMatch(/\.$/);
      for (const number of app.note!.match(/\d[\d,.]*/g) ?? []) {
        expect(app.caveats.some((c) => c.includes(number)), `${app.slug}: ${number}`).toBe(true);
      }
    }
  });
});

describe("analyticsSentence", () => {
  const subscription = { model: "subscription" as const };
  const present =
    "The iPhone and Android apps send usage events and error reports to PostHog; events leave out weight, height, sex and measurements.";

  it("says the public build sends none until the version that first sends analytics", () => {
    const gated = analyticsSentence({ ...subscription, version: "1.7.0" });
    expect(gated).toBe(`None in the current build. From version ${ANALYTICS_SINCE} ${lowerFirst(present)}`);
    expect(analyticsSentence({ ...subscription, version: undefined })).toBe(gated);
    expect(analyticsSentence({ ...subscription, version: ANALYTICS_SINCE })).toBe(present);
    expect(analyticsSentence({ ...subscription, version: "1.10.0" })).toBe(present);
    expect(analyticsSentence({ ...subscription, version: "1.8.0" }, "the Pendum One iPhone and Android apps")).toBe(
      `The Pendum One ${present.slice(4)}`
    );
  });

  it("gates every Pendum One analytics statement on its version", () => {
    if (!subscriptionApp) return;
    const sentence = analyticsSentence(subscriptionApp);
    const live = compareVersions(subscriptionApp.version ?? "0", ANALYTICS_SINCE) >= 0;
    expect(sentence.startsWith("None in the current build.")).toBe(!live);
    expect(subscriptionApp.analytics).toBe(sentence);
    expect(subscriptionApp.privacy).toContain(`Analytics: ${lowerFirst(sentence)}`);
    const question = subscriptionApp.faq?.find((q) => /analytics/i.test(q.question));
    expect(question?.answer).toBe(analyticsSentence(subscriptionApp, `the ${subscriptionApp.name} iPhone and Android apps`));
    for (const text of [subscriptionApp.analytics, ...subscriptionApp.privacy, ...(subscriptionApp.faq ?? []).map((q) => q.answer)]) {
      if (!live && /PostHog/.test(text ?? "")) expect(text).toContain(`From version ${ANALYTICS_SINCE}`);
    }
  });

  it("returns a purchase app's own sentence unchanged", () => {
    for (const app of purchaseApps) {
      expect(analyticsSentence(app)).toBe(app.analytics);
      expect(analyticsSentence(app)).not.toMatch(/PostHog/);
    }
  });
});

describe("page titles", () => {
  it("keeps each seoTitle to about 65 characters, opening with the name and its category", () => {
    for (const app of apps) {
      if (!app.seoTitle) continue;
      expect(app.seoTitle.length, app.slug).toBeLessThanOrEqual(70);
      expect(app.seoTitle, app.slug).toMatch(new RegExp(`^${app.name}: `));
      if (app.category) expect(app.seoTitle, app.slug).toContain(app.category.split(" ")[0]);
    }
  });
});
