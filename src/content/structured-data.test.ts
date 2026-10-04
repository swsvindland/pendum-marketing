import { describe, expect, it } from "vitest";
import { appMetadata, calculatorMetadata, metaDescription, ogCard, pageMetadata } from "@/components/site/metadata";
import { apps } from "./apps";
import { calculators } from "./calculators";
import { site } from "./site";
import {
  absoluteUrl,
  breadcrumbList,
  compareVersions,
  faqPage,
  isShipped,
  itemList,
  languageTag,
  latestUpdate,
  offerFor,
  organizationId,
  shippedFeatures,
  siteGraph,
  softwareApplication,
  webApplication,
  websiteId,
} from "./structured-data";
import type { App, Feature, Price } from "./types";

// The builders read the content, so these tests run against the real apps and calculators plus a few fixtures for
// the fields the content leaves null (price, store links) or does not exercise yet (version gating).

const roundTrip = <T>(data: T): T => JSON.parse(JSON.stringify(data));
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KNOWN_OS = new Set(["iOS", "Android", "watchOS", "Wear OS", "Web"]);

const sample = apps[0];
const fixture = (overrides: Partial<App>): App => ({ ...sample, ...overrides });
const once: Price = { amount: 14.99, currency: "USD", period: "once", display: "$14.99" };
const monthly: Price = { amount: 4.99, currency: "USD", period: "month", display: "$4.99" };

describe("siteGraph", () => {
  const graph = roundTrip(siteGraph());
  const organization = graph["@graph"][0] as Record<string, unknown>;
  const website = graph["@graph"][1] as Record<string, unknown>;

  it("has an Organization and a WebSite with the ids pages reference", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(organization["@type"]).toBe("Organization");
    expect(organization["@id"]).toBe(organizationId);
    expect(website["@type"]).toBe("WebSite");
    expect(website["@id"]).toBe(websiteId);
    expect(website.publisher).toEqual({ "@id": organizationId });
    expect(organizationId).toBe(absoluteUrl("/#organization"));
    expect(websiteId).toBe(absoluteUrl("/#website"));
  });

  it("names the publisher, the site and the category", () => {
    expect(organization.name).toBe(site.publisher ?? site.name);
    expect(organization.url).toBe(absoluteUrl("/"));
    expect(organization.logo).toEqual({ "@type": "ImageObject", url: absoluteUrl("/apple-icon"), width: 180, height: 180 });
    expect(organization.description).toContain("fitness apps");
    expect(organization.description).toContain(site.series.sentence);
    expect(website.name).toBe(site.name);
    expect(website.alternateName).toBe(`${site.name} fitness apps`);
    expect(website.inLanguage).toBe("en");
    expect(website.description).toBe(site.description);
  });

  it("states a contact point and profiles only when the content has them", () => {
    if (site.supportEmail) {
      expect(organization.contactPoint).toEqual([{ "@type": "ContactPoint", contactType: "customer support", email: site.supportEmail }]);
    } else expect(organization).not.toHaveProperty("contactPoint");
    if (!("sameAs" in site)) expect(organization).not.toHaveProperty("sameAs");
  });
});

describe("softwareApplication", () => {
  for (const app of apps) {
    it(`describes ${app.name} from its content`, () => {
      const data = roundTrip(softwareApplication(app));
      const url = absoluteUrl(`/apps/${app.slug}`);
      expect(data["@context"]).toBe("https://schema.org");
      expect(data["@type"]).toBe("SoftwareApplication");
      expect(data["@id"]).toBe(`${url}#app`);
      expect(data.url).toBe(url);
      expect(data.name).toBe(app.name);
      expect(data.description).toBe(app.definition ?? app.summary);
      expect(data.applicationCategory).toBe("HealthApplication");
      expect(Array.isArray(data.operatingSystem)).toBe(true);
      expect(data.operatingSystem.length).toBeGreaterThan(0);
      for (const os of data.operatingSystem) expect(KNOWN_OS.has(os), os).toBe(true);
      expect(data.featureList).toEqual(shippedFeatures(app).map((f) => f.title));
      expect(data.inLanguage).toContain("en");
      expect(data.isAccessibleForFree).toBe(false);
      expect(data.dateModified).toBe(app.updated ?? site.contentUpdated);
      expect(data.dateModified).toMatch(ISO_DATE);
      expect(data.image).toBe(absoluteUrl(app.icon.light));
      expect(data.publisher).toEqual({ "@id": organizationId });
      expect(data.isPartOf).toEqual({ "@id": websiteId });
      expect(data).not.toHaveProperty("aggregateRating");
      expect(data).not.toHaveProperty("review");
      expect(data).not.toHaveProperty("screenshot");
      // One Offer per subscription plan, else one for the one-time price; never a price of 0.
      const prices = app.plans?.length ? app.plans : app.price ? [app.price] : [];
      const offers = ([] as Record<string, unknown>[]).concat(data.offers ?? []);
      expect(offers.map((o) => o.price)).toEqual(prices.map((p) => p.amount.toFixed(2)));
      for (const o of offers) {
        expect(o["@type"]).toBe("Offer");
        expect(o.price).not.toBe("0.00");
        expect(typeof o.description).toBe("string");
      }
      if (app.released && app.stores.state === "live") for (const o of offers) expect(o.availability).toBe("https://schema.org/InStock");
      if (!app.released && app.stores.state !== "preorder") for (const o of offers) expect(o).not.toHaveProperty("availability");
      if (app.version) expect(data.softwareVersion).toBe(app.version);
      else expect(data).not.toHaveProperty("softwareVersion");
      const links = [app.stores.appStore, app.stores.googlePlay, app.stores.web].filter(Boolean);
      if (links.length) expect(data.sameAs).toEqual(links);
      else expect(data).not.toHaveProperty("sameAs");
      const alternates = [app.category ? `${app.name} ${app.category}` : "", app.storeName ?? ""].filter(Boolean);
      if (alternates.length) expect(data.alternateName).toEqual(alternates.length === 1 ? alternates[0] : alternates);
      if (app.subCategory) expect(data.applicationSubCategory).toBe(app.subCategory);
    });
  }

  it("adds offers only from a Price, and never a price of 0", () => {
    const unpriced = { price: null, plans: undefined, trial: undefined };
    expect(roundTrip(softwareApplication(fixture(unpriced)))).not.toHaveProperty("offers");
    const paid = roundTrip(softwareApplication(fixture({ ...unpriced, price: once, released: false, stores: { appStore: null, googlePlay: null } })));
    expect(paid.offers).toEqual({ "@type": "Offer", price: "14.99", priceCurrency: "USD", description: "Paid once when downloaded." });
    const plan = roundTrip(softwareApplication(fixture({ ...unpriced, price: monthly })));
    expect(plan.offers).toMatchObject({
      price: "4.99",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "4.99", unitCode: "MON", billingDuration: 1 },
    });
    expect(offerFor(null)).toBeUndefined();
    expect(JSON.stringify(softwareApplication(fixture(unpriced)))).not.toMatch(/"price":"0/);
    const unlock = roundTrip(softwareApplication(fixture({ ...unpriced, price: once, unlock: true, trial: { days: 21 } })));
    expect((unlock.offers as { description: string }).description).toBe("One-time in-app unlock. The download is free with a 21-day free trial.");
  });

  it("lists store links as sameAs only once they exist", () => {
    const unlisted = fixture({ stores: { appStore: null, googlePlay: null } });
    expect(roundTrip(softwareApplication(unlisted))).not.toHaveProperty("sameAs");
    const listed = fixture({
      stores: { appStore: "https://apps.apple.com/app/id1", googlePlay: "https://play.google.com/store/apps/details?id=a", state: "live" },
    });
    expect(roundTrip(softwareApplication(listed)).sameAs).toEqual([
      "https://apps.apple.com/app/id1",
      "https://play.google.com/store/apps/details?id=a",
    ]);
  });

  it("maps the site's platform names to schema.org operating systems without repeats", () => {
    const app = fixture({ platforms: ["iPhone", "Android", "Apple Watch", "iPad"] });
    expect(roundTrip(softwareApplication(app)).operatingSystem).toEqual(["iOS", "Android", "watchOS"]);
  });

  it("maps language names to BCP 47 tags and leaves unknown names out", () => {
    expect(languageTag("English")).toBe("en");
    expect(languageTag("Simplified Chinese")).toBe("zh-Hans");
    expect(languageTag("Klingon")).toBeUndefined();
    const app = fixture({ languages: ["English", "Spanish", "Klingon", "Japanese"] });
    expect(roundTrip(softwareApplication(app)).inLanguage).toEqual(["en", "es", "ja"]);
  });

  it("falls back from the optional fields to the required ones", () => {
    const bare = fixture({ definition: undefined, category: undefined, subCategory: undefined, updated: undefined, version: undefined, storeName: undefined });
    const data = roundTrip(softwareApplication(bare));
    expect(data.description).toBe(bare.summary);
    expect(data).not.toHaveProperty("alternateName");
    expect(data).not.toHaveProperty("applicationSubCategory");
    expect(data.dateModified).toBe(site.contentUpdated);
    const categorised = roundTrip(softwareApplication(fixture({ category: "strength training app", subCategory: undefined })));
    expect(categorised.applicationSubCategory).toBe("Strength training app");
  });
});

describe("shipped features", () => {
  const features: Feature[] = [
    { title: "Always", body: "." },
    { title: "Since 1.7", body: ".", since: "1.7.0" },
    { title: "Since 1.8", body: ".", since: "1.8.0" },
    { title: "Since 1.10", body: ".", since: "1.10.0" },
  ];

  it("compares versions numerically", () => {
    expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
    expect(compareVersions("1.7.0", "1.7")).toBe(0);
    expect(compareVersions("1.7.0", "1.8.0")).toBe(-1);
  });

  it("hides a feature whose since is newer than the public version", () => {
    const app = fixture({ version: "1.7.0", features });
    expect(shippedFeatures(app).map((f) => f.title)).toEqual(["Always", "Since 1.7"]);
    expect(roundTrip(softwareApplication(app)).featureList).toEqual(["Always", "Since 1.7"]);
    expect(shippedFeatures(fixture({ version: "1.10.0", features })).map((f) => f.title)).toEqual(features.map((f) => f.title));
  });

  it("claims only unmarked features while an app has no public version", () => {
    expect(shippedFeatures(fixture({ version: undefined, features })).map((f) => f.title)).toEqual(["Always"]);
    expect(isShipped({ since: "1.0.0" }, { version: undefined })).toBe(false);
    expect(isShipped({}, { version: undefined })).toBe(true);
  });

  it("never lists a feature newer than the version for any app in the content", () => {
    for (const app of apps) {
      const data = roundTrip(softwareApplication(app));
      for (const feature of app.features) {
        if (feature.since && (!app.version || compareVersions(feature.since, app.version) > 0)) {
          expect(data.featureList, `${app.slug}: ${feature.title}`).not.toContain(feature.title);
        }
      }
    }
  });
});

describe("webApplication", () => {
  const meta = calculators[0];
  const sources = [
    { label: "A paper", href: "https://pubmed.ncbi.nlm.nih.gov/1/" },
    { label: "A book with no link" },
    { label: "A standard", href: "https://www.cdc.gov/x" },
  ];

  it("describes a free browser tool with its linked sources as citations", () => {
    const data = roundTrip(webApplication(meta, sources, "2026-10-02"));
    const url = absoluteUrl(`/calculators/${meta.slug}`);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("WebApplication");
    expect(data["@id"]).toBe(`${url}#tool`);
    expect(data.url).toBe(url);
    expect(data.name).toBe(meta.title);
    expect(data.description).toBe(meta.description);
    expect(data.applicationCategory).toBe("UtilitiesApplication");
    expect(data.applicationSubCategory).toBe("Fitness calculator");
    expect(data.operatingSystem).toBe("Any");
    expect(data.browserRequirements).toBe("Requires JavaScript");
    expect(data.isAccessibleForFree).toBe(true);
    expect(data.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(data.inLanguage).toBe("en");
    expect(data.dateModified).toBe("2026-10-02");
    expect(data.publisher).toEqual({ "@id": organizationId });
    expect(data.isPartOf).toEqual({ "@id": websiteId });
    expect(data.citation).toEqual(["https://pubmed.ncbi.nlm.nih.gov/1/", "https://www.cdc.gov/x"]);
    expect(data).not.toHaveProperty("aggregateRating");
  });

  it("dates the method from the argument, then the content, then the site", () => {
    expect(roundTrip(webApplication(meta, [], "2026-01-01")).dateModified).toBe("2026-01-01");
    expect(roundTrip(webApplication({ ...meta, reviewed: "2026-02-02" })).dateModified).toBe("2026-02-02");
    expect(roundTrip(webApplication({ ...meta, reviewed: undefined })).dateModified).toBe(site.contentUpdated);
    expect(roundTrip(webApplication(meta, []))).not.toHaveProperty("citation");
  });

  it("builds for every calculator in the content", () => {
    for (const c of calculators) {
      const data = roundTrip(webApplication(c));
      expect(data.name).toBe(c.title);
      expect(data.dateModified).toMatch(ISO_DATE);
    }
  });
});

describe("itemList", () => {
  it("numbers the items in order with absolute URLs", () => {
    const data = roundTrip(itemList("Fitness calculators", [{ name: "BMI calculator", url: "/calculators/bmi" }, { name: "TDEE calculator", url: "/calculators/tdee" }]));
    expect(data["@type"]).toBe("ItemList");
    expect(data.name).toBe("Fitness calculators");
    expect(data.numberOfItems).toBe(2);
    expect(data.itemListOrder).toBe("https://schema.org/ItemListOrderAscending");
    expect(data.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "BMI calculator", url: absoluteUrl("/calculators/bmi") },
      { "@type": "ListItem", position: 2, name: "TDEE calculator", url: absoluteUrl("/calculators/tdee") },
    ]);
  });
});

describe("breadcrumbList", () => {
  it("links every crumb but the current page", () => {
    const data = roundTrip(
      breadcrumbList([
        { name: "Home", href: "/" },
        { name: "Calculators", href: "/calculators" },
        { name: "TDEE calculator", href: "/calculators/tdee" },
      ])
    );
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Calculators", item: absoluteUrl("/calculators") },
      { "@type": "ListItem", position: 3, name: "TDEE calculator" },
    ]);
  });
});

describe("faqPage", () => {
  it("carries the same strings the page renders, paragraphs included", () => {
    const data = roundTrip(
      faqPage([
        { question: "Does it work offline?", answer: "Yes.", paragraphs: ["Every record stays on the phone."] },
        { question: "Is there an account?", answer: "No." },
      ])
    );
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toEqual([
      { "@type": "Question", name: "Does it work offline?", acceptedAnswer: { "@type": "Answer", text: "Yes.\n\nEvery record stays on the phone." } },
      { "@type": "Question", name: "Is there an account?", acceptedAnswer: { "@type": "Answer", text: "No." } },
    ]);
  });
});

describe("content dates", () => {
  it("keeps the site's content date at or after every app and calculator date", () => {
    expect(site.contentUpdated).toMatch(ISO_DATE);
    for (const app of apps) if (app.updated) expect(app.updated <= site.contentUpdated, app.slug).toBe(true);
    for (const c of calculators) if (c.reviewed) expect(c.reviewed <= site.contentUpdated, c.slug).toBe(true);
    expect(latestUpdate() <= site.contentUpdated).toBe(true);
    expect(latestUpdate()).toMatch(ISO_DATE);
  });
});

describe("metadata helpers", () => {
  it("keeps the site template unless the title is absolute", () => {
    const templated = pageMetadata({ title: "Pricing", description: "d", path: "/pricing" });
    expect(templated.title).toBe("Pricing");
    expect(templated.openGraph?.title).toBe(`Pricing · ${site.name}`);
    expect(templated.openGraph).toMatchObject({ locale: "en_US", url: "/pricing", siteName: site.name, images: [ogCard] });
    expect(templated.alternates?.canonical).toBe("/pricing");
    const absolute = pageMetadata({ title: "Pendum Lift: strength training app", description: "d", path: "/apps/lift", absolute: true });
    expect(absolute.title).toEqual({ absolute: "Pendum Lift: strength training app" });
    expect(absolute.openGraph?.title).toBe("Pendum Lift: strength training app");
  });

  it("takes a card drawn for the page in place of the shared one", () => {
    const card = { url: "/apps/lift/opengraph-image", width: 1200, height: 630, alt: "Pendum Lift" };
    const data = pageMetadata({ title: "t", description: "d", path: "/apps/lift", image: card });
    expect(data.openGraph?.images).toEqual([card]);
    expect(data.twitter).toMatchObject({ images: [card] });
  });

  it("cuts a description at a sentence, a clause or a word, never past the limit", () => {
    expect(metaDescription("Short.")).toBe("Short.");
    const two = "A first sentence that is long enough to matter here. A second sentence that pushes the whole thing past the limit for a search snippet by a good margin.";
    expect(metaDescription(two, 80)).toBe("A first sentence that is long enough to matter here.");
    const clause = "Pendum Lift is a strength training app for iPhone and Android, with an Apple Watch app, that builds a program for your gym and keeps every workout on the phone";
    const cut = metaDescription(clause, 100);
    expect(cut.length).toBeLessThanOrEqual(100);
    expect(cut).toBe("Pendum Lift is a strength training app for iPhone and Android, with an Apple Watch app.");
    const words = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen";
    const atWord = metaDescription(words, 30);
    expect(atWord.length).toBeLessThanOrEqual(30);
    expect(atWord).toBe("one two three four five six.");
    expect(metaDescription("  spaced   out  text  ")).toBe("spaced out text");
  });

  it("steps back from a stub after a long clause and cuts before a conjunction rather than after one", () => {
    const list = "A tracker for iPhone and Android that builds a program for your gym, prescribes load, reps and reps in reserve for every set.";
    expect(metaDescription(list, 100)).toBe("A tracker for iPhone and Android that builds a program for your gym.");
    const subordinate = "A water tracker for iPhone, Android and Apple Watch that logs drinks toward a daily goal with caffeine and alcohol totals and reminders, and keeps the log on the phone.";
    expect(metaDescription(subordinate, 120)).toBe("A water tracker for iPhone, Android and Apple Watch that logs drinks toward a daily goal.");
    expect(metaDescription("one two three and four five six seven eight nine ten eleven", 20)).toBe("one two three.");
    expect(metaDescription("alpha beta gamma of delta epsilon zeta", 21)).toBe("alpha beta gamma.");
    const shortList = "An app for iPhone and Android: one account keeps workouts, food, body measurements, supplements and soreness on the server.";
    expect(metaDescription(shortList, 90)).toBe("An app for iPhone and Android: one account keeps workouts, food, body measurements.");
    for (const app of apps) {
      const description = String(appMetadata(app).description);
      expect(description, app.slug).not.toMatch(/\b(and|or|with|for|the|a|of|to|that|in|on)\.$/i);
    }
  });

  it("builds app metadata from the definition and the seo title", () => {
    for (const app of apps) {
      const data = appMetadata(app);
      expect(data.alternates?.canonical).toBe(`/apps/${app.slug}`);
      expect(String(data.description).length, app.slug).toBeLessThanOrEqual(160);
      expect(String(data.description), app.slug).toMatch(/[.!?]$/);
      if (app.seoTitle) expect(data.title).toEqual({ absolute: app.seoTitle });
      else expect(data.title).toBe(app.name);
    }
    const titled = appMetadata(fixture({ seoTitle: "Pendum One: workout and nutrition tracker", definition: "Pendum One is a subscription training app." }));
    expect(titled.title).toEqual({ absolute: "Pendum One: workout and nutrition tracker" });
    expect(titled.openGraph?.title).toBe("Pendum One: workout and nutrition tracker");
    expect(titled.description).toBe("Pendum One is a subscription training app.");
    const card = { url: "/apps/one/opengraph-image", width: 1200, height: 630, alt: "Pendum One" };
    expect(appMetadata(sample, { image: card }).openGraph?.images).toEqual([card]);
  });

  it("builds calculator metadata with the title suffix in the title only", () => {
    const meta = calculators[0];
    const plain = calculatorMetadata(meta);
    expect(plain.title).toBe(meta.title);
    expect(plain.alternates?.canonical).toBe(`/calculators/${meta.slug}`);
    expect(String(plain.description)).toContain(meta.description);
    expect(String(plain.description).length).toBeLessThanOrEqual(160);
    const suffixed = calculatorMetadata({ ...meta, titleSuffix: "(Mifflin-St Jeor)" });
    expect(suffixed.title).toBe(`${meta.title} (Mifflin-St Jeor)`);
    expect(String(suffixed.description)).not.toContain("Mifflin");
    for (const c of calculators) expect(String(calculatorMetadata(c).description).length, c.slug).toBeLessThanOrEqual(160);
  });
});
