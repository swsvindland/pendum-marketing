import type { ComponentType } from "react";
import type { CalculatorMeta } from "@/content/types";
import { BmiPage } from "./bmi/page";
import { BodyFatPage } from "./body-fat/page";
import { FfmiPage } from "./ffmi/page";
import { TdeePage } from "./tdee/page";
import { MacrosPage } from "./macros/page";
import { ProteinPage } from "./protein/page";
import { CalorieDeficitPage } from "./calorie-deficit/page";
import { OneRepMaxPage } from "./one-rep-max/page";
import { PlatesPage } from "./plates/page";
import { StrengthScorePage } from "./strength-score/page";
import { WaterPage } from "./water/page";
import { HeartRateZonesPage } from "./heart-rate-zones/page";

/** Slug → page body. Every slug in content/calculators.ts has one; the route 404s on anything else. */
export const calculatorPages: Record<string, ComponentType<{ meta: CalculatorMeta }>> = {
  bmi: BmiPage,
  "body-fat": BodyFatPage,
  ffmi: FfmiPage,
  tdee: TdeePage,
  macros: MacrosPage,
  protein: ProteinPage,
  "calorie-deficit": CalorieDeficitPage,
  "one-rep-max": OneRepMaxPage,
  plates: PlatesPage,
  "strength-score": StrengthScorePage,
  water: WaterPage,
  "heart-rate-zones": HeartRateZonesPage,
};
