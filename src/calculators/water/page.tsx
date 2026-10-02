import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { WaterTool } from "./tool";

export function WaterPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="An estimate of the fluid to drink in a day, from your body weight, exercise and climate, set against the published reference intakes. Needs vary from person to person and from day to day."
      tool={<WaterTool />}
      method={
        <>
          <p>
            There is no single daily requirement for water. Reference intakes come from what healthy people drink, and
            they differ. The <strong>National Academies (NASEM, 2005)</strong> set 3.7 L of total water a day for men
            and 2.7 L for women, about 81 % of it from drinks (3.0 L and 2.2 L). <strong>EFSA (2010)</strong> sets
            2.5 L and 2.0 L of total water for moderate temperatures and activity. Total water includes the water in
            food. Most healthy people meet their needs by drinking to thirst.
          </p>
          <p>The estimate from drinks has three parts.</p>
          {/* Zero intrinsic width, then full width: the formula scrolls on a narrow phone instead of widening the page. */}
          <div className="w-0 min-w-full">
            <Formula>
              {`Baseline = 28 mL × weight (kg)
         = 35 mL/kg × 0.8 from drinks,
           kept within EFSA to NASEM
Exercise = 10 mL × minutes a day
Heat     = 1,000 mL when hot, else 0
Drinks   = baseline + exercise + heat`}
            </Formula>
          </div>
          <p>
            <strong>Baseline.</strong> 35 mL of total water per kg of body weight is the D-A-CH guide value for adults
            aged 19 to 50 (30 mL per kg from 51). About 80 % of total water comes from drinks, so the baseline is 28 mL
            per kg. The per-kg rule is not built for very small or very large bodies, so the baseline stays between
            EFSA’s figure (80 % of its total) and NASEM’s for your sex: 2.0 to 3.0 L for men and 1.6 to 2.2 L for
            women. That covers men from 71 to 107 kg and women from 57 to 79 kg; outside those weights the nearer
            reference applies.
          </p>
          <p>
            <strong>Exercise.</strong> Sweat rates run from about 0.3 to 2.4 L an hour, depending on the activity, the
            heat and the person. For marathon runners who do not know their own rate, ACSM suggests drinking 0.4 to 0.8
            L an hour; the calculator uses the middle, 0.6 L an hour. To learn your own sweat rate, weigh yourself
            before and after an hour of exercise: each kilogram lost, plus what you drank, is about a litre of sweat.
          </p>
          <p>
            <strong>Heat.</strong> The NASEM report puts daily needs at about 3 L for sedentary people in temperate
            climates and about 4 L in hot ones, and far more with hard work in the heat. Choosing hot adds that 1 L.
          </p>
          <p>
            For example, an 80 kg man who exercises 45 minutes a day in a temperate climate gets 28 × 80 = 2,240 mL
            plus 450 mL, 2,690 mL: about 2.7 L, or 11 glasses of 250 mL. Pounds are converted exactly (1 lb =
            0.45359237 kg), and fluid ounces are US fluid ounces (1 fl oz = 29.5735 mL).
          </p>
          <p>
            In <strong>Vector Hydration</strong>, the daily goal starts at 2,500 mL and is yours to set; the app does
            not personalize it. Coffee and tea count toward the goal. Alcohol does not.
          </p>
        </>
      }
      caveat="An estimate for healthy adults, not a prescription. With a heart, kidney or liver condition, or a fluid restriction, follow your clinician’s advice. Pregnancy and breastfeeding raise needs and are not covered here. More is not always better: drinking far beyond sweat losses during long endurance events can cause hyponatremia, a dangerous fall in blood sodium. The kidneys clear at most about 0.7 to 1.0 L an hour."
      sources={[
        {
          label:
            "Institute of Medicine (now NASEM). Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate. Chapter 4, Water. National Academies Press, 2005.",
          href: "https://doi.org/10.17226/10925",
        },
        {
          label:
            "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for water. EFSA Journal 2010;8(3):1459.",
          href: "https://doi.org/10.2903/j.efsa.2010.1459",
        },
        {
          label: "DGE, ÖGE, SGE. D-A-CH reference values for nutrient intake: water.",
          href: "https://www.dge.de/wissenschaft/referenzwerte/wasser/",
        },
        {
          label:
            "Sawka MN, Burke LM, Eichner ER, et al. American College of Sports Medicine position stand. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377–390.",
          href: "https://doi.org/10.1249/mss.0b013e31802ca597",
        },
        {
          label:
            "Rodriguez NR, Di Marco NM, Langley S. American College of Sports Medicine position stand. Nutrition and athletic performance. Med Sci Sports Exerc. 2009;41(3):709–731.",
          href: "https://doi.org/10.1249/MSS.0b013e31890eb86",
        },
      ]}
    />
  );
}
