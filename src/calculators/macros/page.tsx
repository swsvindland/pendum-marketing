import Link from "next/link";
import { names } from "@/content/apps";
import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { MacrosTool } from "./tool";

export function MacrosPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro={`Daily calories, protein, carbs and fat for a cut, maintenance or a bulk, generated the way ${names.macros} starts a program.`}
      tool={<MacrosTool appName={names.macros} />}
      method={
        <>
          <p>
            Maintenance comes from the <strong>Mifflin-St Jeor equation</strong> and an activity multiplier, as in the{" "}
            <Link href="/calculators/tdee" className="text-tint underline underline-offset-4">
              TDEE calculator
            </Link>
            , or from the maintenance calories you enter. The goal sets a weekly rate as a share of body weight, and
            the rate becomes a daily difference at 7,700 kcal per kg. The calories left after protein are split
            between fat and carbs.
          </p>
          <Formula>
            {`rate (kg/week) = weight (kg)
  × pace (%) / 100
  (negative for a cut, 0 to maintain)
calories = round(maintenance
  + rate × 7,700 / 7)
protein (g) = round(weight (kg)
  × protein (g/kg))
fat (g) = round(max(
  0.6 × weight (kg),
  (calories − 4 × protein)
    × fat share / 9))
carbs (g) = round(
  (calories − 4 × protein
    − 9 × fat) / 4)`}
          </Formula>
          <p>
            The <strong>fat share</strong> is 0.40 for Balanced, 0.25 for More carbs and 0.60 for More fat. Fat never
            drops below 0.6 g per kg, and carbs take the rest. Protein and carbs count 4 kcal per gram and fat 9, so
            after rounding the grams can differ from the calories by a few kcal. Shares in the result are of the energy
            the three macros provide.
          </p>
          <p>
            The <strong>weekly pace</strong> runs from 0.25 to 1% of body weight for a cut and from 0.1 to 0.5% for a
            bulk. {names.macros} recommends 0.5 to 1% for a cut and 0.1 to 0.25% for a bulk; its slider reaches 1.5% for a
            mini-cut of 2 to 4 weeks.
          </p>
          <p>
            The <strong>protein levels</strong> are the four {names.macros} offers: 1.4, 1.6, 2.0 and 2.2 g/kg, with 1.6
            g/kg the default. The ISSN position stand finds 1.4 to 2.0 g/kg a day sufficient for most people who
            exercise, and says 2.3 to 3.1 g/kg may be needed to maximize lean-mass retention in resistance-trained
            people during a calorie deficit. The levels here stop at 2.2 g/kg, below that range.
          </p>
          <p>
            Targets are generated only between 1,500 and 5,000 kcal a day, from a maintenance of 1,200 to 5,000 kcal,
            and only while carbs stay at zero or above. These are the limits {names.macros} uses: product limits, not
            individual safety thresholds.
          </p>
          <p>
            {names.macros} also refuses a cut when BMI is under 18.5 or the goal weight is under BMI 18.5, and it caps
            the weekly rate at the distance to the goal weight. This calculator has no goal weight, so the weight after one week at the chosen
            pace stands in for the goal: a cut is not generated when BMI is under 18.5 now, or would be after that week.
            When the cut is generated, its targets are the ones the app gives for that goal.
          </p>
          <p>
            For example, at 180 cm and 80 kg, cutting at 0.5% a week from a maintenance of 2,600 kcal loses 0.4 kg a
            week, or 440 kcal a day, so calories are 2,160. Protein at 1.6 g/kg is 128 g. Balanced fat is (2,160 − 512) ×
            0.40 / 9 = 73 g, which leaves 248 g of carbs.
          </p>
          <p>
            <strong>7,700 kcal per kg</strong> (3,500 per lb) is a short-term approximation. The energy in a kilogram
            lost depends on body fat, and expenditure falls as weight changes, so over months the real rate drifts from
            the plan.
          </p>
        </>
      }
      caveat={`For adults 18 and over who are not pregnant or breastfeeding. These are starting targets built on estimates. In ${names.macros}, a weekly check-in compares your logged intake with your trend weight and proposes a change, which you accept or keep. Medical nutrition needs and eating disorder care need professional guidance.`}
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
          label:
            "Hall KD, Sacks G, Chandramohan D, et al. Quantification of the effect of energy imbalance on bodyweight. Lancet. 2011;378(9793):826–837.",
          href: "https://pubmed.ncbi.nlm.nih.gov/21872751/",
        },
        { label: "CDC. Adult BMI categories.", href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html" },
      ]}
    />
  );
}
