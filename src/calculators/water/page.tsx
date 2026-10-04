import { names } from "@/content/apps";
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
            and 2.7 L for women, about 81% of it from drinks (3.0 L and 2.2 L). <strong>EFSA (2010)</strong> sets
            2.5 L and 2.0 L of total water for moderate temperatures and activity. Total water includes the water in
            food. Most healthy people meet their needs by drinking to thirst.
          </p>
          <p>The estimate from drinks has three parts.</p>
          <Formula>
            {`Baseline = 19 mL × weight (kg),
           kept between EFSA and NASEM
19 mL/kg = 35 mL/kg × 1,410 / 2,600,
           D-A-CH’s split from drinks,
           to a whole mL
Exercise = 10 mL × minutes a day
Heat     = 1,000 mL when hot, else 0
Drinks   = baseline + exercise + heat`}
          </Formula>
          <p>
            <strong>Baseline.</strong> The <strong>D-A-CH</strong> reference values (Germany, Austria and Switzerland)
            give 35 mL of total water per kg of body weight for adults aged 19 to 50. Their total includes the water
            the body makes as it burns food, which the NASEM and EFSA totals leave out. They put the part from drinks
            at 1,410 of 2,600 mL a day for ages 25 to 50 (54%), and 1,470 of 2,700 mL for 19 to 24. So the baseline
            from drinks is 35 × 1,410 / 2,600 = 18.98 mL, rounded to 19 mL per kg.
          </p>
          <p>
            The per-kg rule is not built for every body, so the baseline stays between EFSA’s figure (80% of its
            total) and NASEM’s for your sex: 2.0 to 3.0 L for men and 1.6 to 2.2 L for women. 19 mL per kg falls in
            that range for men from 105.3 to 157.8 kg and for women from 84.3 to 115.7 kg. At lighter weights the
            baseline is EFSA’s figure, and at heavier ones NASEM’s. D-A-CH’s value from age 51 is lower, 30 mL per kg;
            the calculator does not ask your age and uses the value for 19 to 50 for every adult. Where the baseline
            is EFSA’s figure, the lower value would not change it.
          </p>
          <p>
            <strong>Exercise.</strong> Sweat rates run from about 0.3 to 2.4 L an hour, depending on the activity, the
            heat and the person. For marathon runners who do not know their own rate, ACSM suggests drinking 0.4 to 0.8
            L an hour; the calculator uses the middle, 0.6 L an hour. To learn your own sweat rate, weigh yourself
            before and after an hour of exercise: each kilogram lost, plus what you drank, is about a liter of sweat.
          </p>
          <p>
            <strong>Heat.</strong> The NASEM report puts daily needs at about 3 L for sedentary people in temperate
            climates and about 4 L in hot ones, and far more with hard work in the heat. Choosing hot adds that 1 L.
          </p>
          <p>
            For example, a 70 kg woman who exercises 30 minutes a day in a temperate climate gets 19 × 70 = 1,330 mL.
            That is below EFSA’s 1,600 mL, so her baseline is 1,600 mL. With 300 mL for exercise, the total is 1.9 L,
            or 7.6 glasses of 250 mL. A 110 kg man who exercises 60 minutes gets 19 × 110 = 2,090 mL plus 600 mL,
            2,690 mL: 2.7 L, or 10.8 glasses. Pounds are converted exactly (1 lb = 0.45359237 kg), and fluid ounces
            are US fluid ounces (1 fl oz = 29.5735 mL). The parts are shown to 10 mL (0.1 fl oz), the total is their
            sum rounded to 0.1 L (a whole fl oz), and each difference from a reference intake is taken between the
            numbers as shown.
          </p>
          <p>
            In <strong>{names.hydration}</strong>, the daily goal starts at 2,500 mL and is yours to set; the app does
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
