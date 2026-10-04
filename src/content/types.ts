import type { IconName } from "@/vector";

/**
 * Permanent URL slugs: the route (/apps/<slug>), the icon file (public/apps/<slug>.png), section ids and the keys
 * of `names` in apps.ts. They are not names. A rename changes `App.name` (and `label`, `plan`) and leaves the
 * slug alone, so no inbound link breaks; a slug changes only with a redirect in next.config.ts.
 */
export type AppSlug = "one" | "body" | "lift" | "macros" | "hydration";

/** How an app is sold. `subscription`: Pendum One (account + cloud). `purchase`: one-time, offline, no account. */
export type Model = "subscription" | "purchase";

export type Feature = {
  /** Sentence case, at most 5 words. */
  title: string;
  /** One or two short declarative sentences. No contractions, no exclamation marks. */
  body: string;
  icon?: IconName;
  /**
   * The app version that ships it ("1.8.0"). While `App.version` is older, the site hides it, so nothing from a
   * fact sheet's notYetShipped is claimed and nothing needs a hand edit when the release lands.
   */
  since?: string;
};

/** A price as the store shows it, decided by the owner (docs/sources/owner-decisions.md). Never invented. */
export type Price = {
  /** The amount in `currency` (14.99). */
  amount: number;
  /** ISO 4217 code ("USD"). */
  currency: string;
  /** "once" for a one-time purchase; "month" or "year" for a subscription plan. */
  period: "once" | "month" | "year";
  /** The display string, as the site prints it ("$14.99"). */
  display: string;
};

/** A question and its answer as plain strings, so the same text feeds the page and FAQPage structured data. */
export type Question = {
  /** Sentence case, ends with a question mark. */
  question: string;
  /** The answer. Facts from docs/sources/app-facts.json only; full product names, no prices or links invented. */
  answer: string;
  /** Further paragraphs, each rendered as its own paragraph. */
  paragraphs?: string[];
  /** One link under the answer, when a page answers it better. */
  action?: { href: string; label: string };
};

/** A readout in the app's own vocabulary, drawn as a Vector panel (example data, labelled as such). */
export type Specimen = {
  eyebrow: string;
  meta?: string;
  hero: { value: string; unit?: string; caption?: string };
  meter?: { value: number; max: number; valueText: string; target?: number };
  rows?: { label: string; value: string; unit?: string }[];
};

export type StoreLinks = {
  /** App Store URL once live (or once a pre-order page exists). null renders "Coming soon". */
  appStore: string | null;
  /** Google Play URL once live (or once pre-registration is open). */
  googlePlay: string | null;
  /** Web app URL (Pendum One only). */
  web?: string | null;
  /**
   * "live" when the links open a listing that can be bought today; "preorder" when they open an App Store
   * pre-order or a Google Play pre-registration page (the owner creates those; the site then says what they do).
   */
  state?: "live" | "preorder";
};

export type App = {
  slug: AppSlug;
  /**
   * In the stores today. A released app with no link yet tells visitors to search the store; an unreleased one says
   * "Coming soon". Pendum One has public builds (1.7.0); the four Pendum apps have not shipped.
   */
  released: boolean;
  /** Full product name: "Pendum Body", "Pendum One". */
  name: string;
  /** Planned home-screen label ("Body"). Not shown on the site until the rename ships (owner-decisions.md). */
  label: string;
  /** The public build in the stores (released apps). Features whose `since` is newer are hidden. */
  version?: string;
  model: Model;
  /** Sentence case, at most 8 words. */
  tagline: string;
  /** One or two sentences. */
  summary: string;
  /**
   * One sentence an assistant or a search snippet can quote on its own: full name, category, platforms, how it
   * is sold, and the offline / account fact. At most 45 words; it opens the page and the meta description.
   */
  definition?: string;
  /** The category as a sentence-case noun phrase: "strength training app". Pairs with the name everywhere. */
  category?: string;
  /** schema.org applicationSubCategory: "Strength training tracker". */
  subCategory?: string;
  /** The page <title>, absolute (no site suffix): "Pendum Lift: strength training app for iPhone and Android". */
  seoTitle?: string;
  /** Common questions for the app page, objections included. Answers come from app-facts.json only. */
  faq?: Question[];
  /** Where records are backed up, in one sentence (for the at-a-glance table). */
  backup?: string;
  /** What analytics the app sends, in one sentence (for the at-a-glance table). */
  analytics?: string;
  /** ISO date the facts above were last checked against the app repos ("2026-10-02"). */
  updated?: string;
  /**
   * The chooser row ("Which app is for you"): what the visitor wants, in their words, and the facts that answer it,
   * each fact a feature title or caveat from this app so it cannot drift. Apps without one are left out of the chooser.
   * apps.test.ts checks every fact (split on ", ") against the app's shipped features, caveats, definition and summary.
   */
  chooser?: { want: string; facts: string };
  /** One fact a buyer must read before the store button (the Pendum Macros catalog size); shown in the page header. */
  note?: string;
  icon: { light: string; dark?: string };
  /** Glyph used where the icon image is too heavy (lists, chips). */
  glyph: IconName;
  platforms: string[];
  features: Feature[];
  integrations: Feature[];
  privacy: string[];
  languages: string[];
  units?: string;
  specimen: Specimen;
  /** Medical and estimate caveats that must travel with the claims. */
  caveats: string[];
  stores: StoreLinks;
  /**
   * The headline price, as decided in docs/sources/owner-decisions.md. A one-time purchase app: what it costs once
   * (the paid download, or the in-app unlock when `unlock` is set). A subscription app: its yearly plan, with every
   * plan in `plans`. null renders the model in words and never a number.
   */
  price: Price | null;
  /** Every plan of a subscription app, shortest first ("$7.99 a month", "$49.99 a year"). */
  plans?: Price[];
  /**
   * A one-time purchase made inside the app: the download is free, the app runs for `trial.days`, and `price`
   * unlocks it for good. Absent for a paid download, where the price is the download.
   */
  unlock?: boolean;
  /** A free trial: the days it lasts, and for a subscription the plan that carries it (new subscribers only). */
  trial?: { days: number; plan?: "month" | "year" };
  /**
   * The name the store listings still show while it differs from `name` (a rename that has not reached the
   * stores yet). The site says so beside the store links, so a visitor is not surprised by the listing.
   */
  storeName?: string;
  /** The subscription plan's name, when it differs from the app's (subscription apps only). */
  plan?: string;
  /** Calculator slugs that belong with this app. */
  calculators: string[];
};

export type CalculatorCategory = "body" | "strength" | "nutrition" | "hydration" | "cardio";

export type CalculatorMeta = {
  slug: string;
  /** "BMI calculator". Sentence case. */
  title: string;
  /** Short name for lists: "BMI". */
  short: string;
  /** One sentence for lists and the meta description. */
  description: string;
  category: CalculatorCategory;
  /** The app that tracks this over time; none when no app does. */
  app?: AppSlug;
  /**
   * The closing panel's heading when the app does not track this result itself, e.g. "Pendum Lift tracks the
   * estimated one-rep max behind your total". Defaults to "Track it over time in {app}".
   */
  track?: string;
  /**
   * What the app does with the result just computed, one or two sentences from its verified features. Shown
   * beside the result and in the closing panel.
   */
  next?: string;
  /** Words added to <title> only, after the title: "(Mifflin-St Jeor)". */
  titleSuffix?: string;
  /** Questions for the page, answered only from its method text and cited sources. Three to five. */
  questions?: Question[];
  /** ISO date the method and sources were last reviewed ("2026-10-02"). */
  reviewed?: string;
  icon: IconName;
};

/** A design principle shared by the five apps, rendered on the home page and on /about from one list. */
export type Principle = {
  icon: IconName;
  /** Sentence case, at most 5 words. */
  title: string;
  /** One or two sentences that hold for all five apps. */
  body: string;
};
