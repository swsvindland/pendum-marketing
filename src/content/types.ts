import type { IconName } from "@/vector";

export type AppSlug = "omegafyt" | "body" | "lift" | "macros" | "hydration";

/** How an app is sold. `subscription`: OmegaFyt (account + cloud). `purchase`: one-time, offline, no account. */
export type Model = "subscription" | "purchase";

export type Feature = {
  /** Sentence case, at most 5 words. */
  title: string;
  /** One or two short declarative sentences. No contractions, no exclamation marks. */
  body: string;
  icon?: IconName;
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
  /** TODO(owner): App Store URL once live. null renders "Coming to the App Store". */
  appStore: string | null;
  /** TODO(owner): Google Play URL once live. */
  googlePlay: string | null;
  /** Web app URL (OmegaFyt only). */
  web?: string | null;
};

export type App = {
  slug: AppSlug;
  /** Full product name: "Vector Body", "OmegaFyt". */
  name: string;
  /** Home-screen label: "Body". */
  label: string;
  model: Model;
  /** Sentence case, at most 8 words. */
  tagline: string;
  /** One or two sentences. */
  summary: string;
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
   * TODO(owner): display price. null renders the model in words ("One-time purchase", "Subscription") and never a
   * number. For OmegaFyt the prices come from the stores at purchase time.
   */
  price: string | null;
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
  /** The app that tracks this over time. */
  app: AppSlug;
  icon: IconName;
};
