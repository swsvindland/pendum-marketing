import type { CalculatorCategory, CalculatorMeta } from "./types";

/** The free calculators. Each slug has a page under /calculators/[slug] and a component in components/calculators. */
export const calculators: CalculatorMeta[] = [
  {
    slug: "bmi",
    title: "BMI calculator",
    short: "BMI",
    description: "Body mass index from height and weight, with the adult screening category.",
    category: "body",
    app: "body",
    icon: "scale",
  },
  {
    slug: "body-fat",
    title: "Body fat calculator",
    short: "Body fat",
    description: "Body-fat percentage from a tape measure, using the US Navy circumference method.",
    category: "body",
    app: "body",
    icon: "ruler",
  },
  {
    slug: "ffmi",
    title: "FFMI calculator",
    short: "FFMI",
    description: "Fat-free mass index: lean mass relative to height, raw and normalized to 1.8 m.",
    category: "body",
    app: "body",
    icon: "weight",
  },
  {
    slug: "tdee",
    title: "TDEE calculator",
    short: "TDEE",
    description: "Resting metabolic rate and total daily energy expenditure from the Mifflin-St Jeor equation.",
    category: "nutrition",
    app: "macros",
    icon: "energy",
  },
  {
    slug: "macros",
    title: "Macro calculator",
    short: "Macros",
    description: "Daily calories, protein, fat and carbohydrate for a cut, maintenance or a bulk.",
    category: "nutrition",
    app: "macros",
    icon: "food",
  },
  {
    slug: "protein",
    title: "Protein calculator",
    short: "Protein",
    description: "A daily protein range for your body weight and training goal.",
    category: "nutrition",
    app: "macros",
    icon: "food",
  },
  {
    slug: "calorie-deficit",
    title: "Goal date calculator",
    short: "Goal date",
    description: "How long a weight change takes at a weekly rate, and the daily calorie change it needs.",
    category: "nutrition",
    app: "macros",
    icon: "date",
  },
  {
    slug: "one-rep-max",
    title: "One-rep max calculator",
    short: "One-rep max",
    description: "Estimated one-rep max from a set of reps, with a rep-max table for programming.",
    category: "strength",
    app: "lift",
    icon: "record",
  },
  {
    slug: "plates",
    title: "Plate calculator",
    short: "Plates",
    description: "The plates to load on each side of the bar for a target weight, in kilograms or pounds.",
    category: "strength",
    app: "lift",
    icon: "lift",
  },
  {
    slug: "strength-score",
    title: "Strength score calculator",
    short: "DOTS score",
    description: "DOTS and Wilks scores for comparing a powerlifting total across body weights.",
    category: "strength",
    app: "lift",
    icon: "chart",
  },
  {
    slug: "water",
    title: "Water intake calculator",
    short: "Water intake",
    description: "A daily fluid estimate from body weight and exercise, set against reference intakes.",
    category: "hydration",
    app: "hydration",
    icon: "water",
  },
  {
    slug: "heart-rate-zones",
    title: "Heart rate zone calculator",
    short: "Heart rate zones",
    description: "Five training zones from your age, or from your maximum and resting heart rate.",
    category: "cardio",
    icon: "pulse",
  },
];

export const categoryLabel: Record<CalculatorCategory, string> = {
  body: "Body composition",
  strength: "Strength",
  nutrition: "Nutrition",
  hydration: "Hydration",
  cardio: "Cardio",
};

export const categoryOrder: CalculatorCategory[] = ["body", "nutrition", "strength", "hydration", "cardio"];

export function getCalculator(slug: string) {
  return calculators.find((c) => c.slug === slug);
}
