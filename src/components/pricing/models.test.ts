import { describe, expect, it } from "vitest";
import { apps } from "@/content/apps";
import type { App } from "@/content/types";
import { money, priceLine, purchasePriceRange, threeYearAmount, threeYearLines } from "./models";

const priced = (slug: App["slug"], amount: number, period: "once" | "month" | "year" = "once"): App => {
  const app = apps.find((a) => a.slug === slug)!;
  return { ...app, plans: undefined, unlock: undefined, trial: undefined, price: { amount, currency: "USD", period, display: money(amount, "USD") } };
};
const unpriced = (app: App): App => ({ ...app, price: null, plans: undefined, trial: undefined, unlock: undefined });

describe("priceLine", () => {
  it("reads the price with its period, and nothing while the price is null", () => {
    expect(priceLine(unpriced(apps[0]))).toBeUndefined();
    expect(priceLine(priced("lift", 19.99))).toBe("$19.99 once");
  });

  it("states the content's prices: plans for the subscription, the trial before an unlock", () => {
    const byslug = Object.fromEntries(apps.map((a) => [a.slug, a]));
    expect(priceLine(byslug.one)).toBe("$7.99 a month or $49.99 a year");
    expect(priceLine(byslug.lift)).toBe("$19.99 once after a 21-day free trial");
    expect(priceLine(byslug.body)).toBe("$9.99 once");
    expect(purchasePriceRange()).toBe("$4.99 to $19.99 each, once");
  });
});

describe("threeYearAmount", () => {
  it("counts a one-time price once, a monthly plan 36 times and a yearly plan 3 times", () => {
    expect(threeYearAmount({ amount: 19.99, currency: "USD", period: "once", display: "$19.99" })).toBeCloseTo(19.99);
    expect(threeYearAmount({ amount: 7.99, currency: "USD", period: "month", display: "$7.99" })).toBeCloseTo(287.64);
    expect(threeYearAmount({ amount: 49.99, currency: "USD", period: "year", display: "$49.99" })).toBeCloseTo(149.97);
  });
});

describe("threeYearLines", () => {
  it("is empty while no app has a price", () => {
    expect(threeYearLines(apps.map(unpriced))).toEqual([]);
  });

  it("states the content's prices over three years", () => {
    expect(threeYearLines()).toEqual([
      { label: "Pendum Body, once", value: "$9.99" },
      { label: "Pendum Lift, once", value: "$19.99" },
      { label: "Pendum Macros, once", value: "$19.99" },
      { label: "Pendum Hydration, once", value: "$4.99" },
      { label: "All 4 Pendum apps, once", value: "$54.96" },
      { label: "Pendum One, yearly for 3 years", value: "$149.97" },
    ]);
  });

  it("lists only the priced apps, and the set only when every one-time app is priced", () => {
    const some = apps.map((a) => (a.slug === "lift" ? priced("lift", 19.99) : unpriced(a)));
    expect(threeYearLines(some)).toEqual([{ label: "Pendum Lift, once", value: "$19.99" }]);

    const all = apps.map((a) => {
      if (a.model === "purchase") return priced(a.slug, 10);
      return priced(a.slug, 49.99, "year");
    });
    expect(threeYearLines(all)).toEqual([
      { label: "Pendum Body, once", value: "$10.00" },
      { label: "Pendum Lift, once", value: "$10.00" },
      { label: "Pendum Macros, once", value: "$10.00" },
      { label: "Pendum Hydration, once", value: "$10.00" },
      { label: "All 4 Pendum apps, once", value: "$40.00" },
      { label: "Pendum One, yearly for 3 years", value: "$149.97" },
    ]);
  });

  it("states a monthly plan over 36 months", () => {
    const monthly = apps.map((a) => (a.model === "subscription" ? priced(a.slug, 7.99, "month") : unpriced(a)));
    expect(threeYearLines(monthly)).toEqual([{ label: "Pendum One, monthly for 36 months", value: "$287.64" }]);
  });
});
