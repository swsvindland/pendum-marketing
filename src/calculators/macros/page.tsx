import Link from "next/link";
import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { MacrosTool } from "./tool";

export function MacrosPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Daily calories, protein, carbs and fat for a cut, maintenance or a bulk, generated the way Vector Macros starts a program."
      tool={<MacrosTool />}
      method={
        <>
          <p>
            Maintenance comes from the <strong>Mifflin-St Jeor equation</strong> and an activity multiplier, as in the{" "}
            <Link href="/calculators/tdee" className="text-tint underline-offset-4 hover:underline">
              TDEE calculator
            </Link>
            , or from the maintenance calories you enter. The goal sets a weekly rate as a share of body weight, and
            the rate becomes a daily difference at 7,700 kcal per kg. The calories left after protein are split
            between fat and carbs.
          </p>
          {/* w-0 min-w-full: the long lines scroll inside the formula instead of widening the method column. */}
          <div className="w-0 min-w-full">
            <Formula>
              {`rate (kg/week) = weight (kg) × pace (%) / 100, negative for a cut, 0 to maintain
calories = round(maintenance + rate × 7,700 / 7)
protein (g) = round(weight (kg) × protein (g/kg))
fat (g) = round(max(0.6 × weight (kg), (calories − 4 × protein) × fat share / 9))
carbs (g) = round((calories − 4 × protein − 9 × fat) / 4)`}
            </Formula>
          </div>
          <p>
            The <strong>fat share</strong> is 0.40 for Balanced, 0.25 for More carbs and 0.60 for More fat. Fat never
            drops below 0.6 g per kg, and carbs take the rest. Protein and carbs count 4 kcal per gram and fat 9, so
            after rounding the grams can differ from the calories by a few kcal. Shares in the result are of the energy
            the three macros provide.
          </p>
          <p>
            The <strong>weekly pace</strong> runs from 0.25 to 1% of body weight for a cut and from 0.1 to 0.5% for a
            bulk. Vector Macros recommends 0.5 to 1% for a cut and 0.1 to 0.25% for a bulk; its slider reaches 1.5% for a
            mini-cut of 2 to 4 weeks.
          </p>
          <p>
            The <strong>protein levels</strong> (1.4, 1.6, 2.0 and 2.2 g/kg) follow the ISSN position stand: 1.4 to 2.0
            g/kg a day is sufficient for most people who exercise, and higher intakes can help keep lean mass during a
            calorie deficit. 1.6 g/kg is the default.
          </p>
          <p>
            Targets are generated only between 1,500 and 5,000 kcal a day, from a maintenance of 1,200 to 5,000 kcal,
            and only while carbs stay at zero or above. A cut is not generated when BMI is under 18.5. These are the
            limits Vector Macros uses: product limits, not individual safety thresholds.
          </p>
          <p>
            For example, 80 kg cutting at 0.5% a week from a maintenance of 2,600 kcal loses 0.4 kg a week, or 440 kcal a
            day, so calories are 2,160. Protein at 1.6 g/kg is 128 g. Balanced fat is (2,160 − 512) × 0.40 / 9 = 73 g,
            which leaves 248 g of carbs.
          </p>
          <p>
            <strong>7,700 kcal per kg</strong> (3,500 per lb) is a short-term approximation. The energy in a kilogram
            lost depends on body fat, and expenditure falls as weight changes, so over months the real rate drifts from
            the plan.
          </p>
        </>
      }
      caveat="For adults 18 and over who are not pregnant or breastfeeding. These are starting targets built on estimates. In Vector Macros, a weekly check-in compares your logged intake with your trend weight and proposes a change, which you accept or keep. Medical nutrition needs and eating disorder care need professional guidance."
      sources={[
        {
          label:
            "Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241–247.",
          href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
        },
        {
          label:
            "Jäger R, Kerksick CM, Campbell BI, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.",
          href: "https://doi.org/10.1186/s12970-017-0177-8",
        },
        {
          label: "Hall KD. What is the required energy deficit per unit weight loss? Int J Obes. 2008;32(3):573–576.",
          href: "https://pubmed.ncbi.nlm.nih.gov/17848938/",
        },
        {
          label: "NIDDK. Body Weight Planner.",
          href: "https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner",
        },
        { label: "CDC. Adult BMI categories.", href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html" },
      ]}
    />
  );
}
