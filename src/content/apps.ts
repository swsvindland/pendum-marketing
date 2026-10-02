import type { App, AppSlug } from "./types";

// Placeholder until the verified fact sheets land; replaced wholesale.
const stub = (slug: AppSlug, name: string, label: string, model: App["model"]): App => ({
  slug,
  name,
  label,
  model,
  tagline: "",
  summary: "",
  icon: { light: `/apps/${slug}.png` },
  glyph: "lift",
  platforms: [],
  features: [],
  integrations: [],
  privacy: [],
  languages: [],
  specimen: { eyebrow: "", hero: { value: "" } },
  caveats: [],
  stores: { appStore: null, googlePlay: null },
  price: null,
  calculators: [],
});

export const apps: App[] = [
  stub("omegafyt", "OmegaFyt", "OmegaFyt", "subscription"),
  stub("body", "Vector Body", "Body", "purchase"),
  stub("lift", "Vector Lift", "Lift", "purchase"),
  stub("macros", "Vector Macros", "Macros", "purchase"),
  stub("hydration", "Vector Hydration", "Hydration", "purchase"),
];

export function getApp(slug: string) {
  return apps.find((a) => a.slug === slug);
}
