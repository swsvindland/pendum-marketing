import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { ProteinTool } from "./tool";

export function ProteinPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="A daily protein range for adults who train, from body weight and goal. Research supports a range rather than one number, so the result is a range with a target inside it."
      tool={<ProteinTool />}
      method={
        <>
          <p>
            Protein is set in grams per kilogram of body weight per day and rounded to whole grams, as Vector Macros
            does. Imperial inputs are converted exactly (1 lb = 0.45359237 kg) first. Each goal uses a published range,
            and its target is one of the protein settings Vector Macros offers (1.4, 1.6, 2.0 or 2.2 g/kg).
          </p>
          <Formula>
            {`protein (g) = round(weight × g/kg)

goal          g/kg      target
Maintain      1.4–2.0   1.6
Build muscle  1.6–2.2   2.0
Lose fat      1.6–2.4   2.2
RDA           0.8

lean mass = weight × (1 − fat % / 100)
deficit: 2.3–3.1 g per kg lean mass`}
          </Formula>
          <p>
            <strong>Maintain.</strong> The International Society of Sports Nutrition puts 1.4 to 2.0 g/kg a day as
            enough for most people who exercise. The target is 1.6 g/kg: in a meta-analysis of 49 trials, Morton and
            colleagues found no further average gain in lean mass from protein beyond about 1.6 g/kg.
          </p>
          <p>
            <strong>Build muscle.</strong> The same meta-analysis placed that point at 1.62 g/kg, with a 95%
            confidence interval reaching 2.20 g/kg, so 1.6 to 2.2 g/kg covers most people who train. The target is
            2.0 g/kg, the setting nearest the middle of that range.
          </p>
          <p>
            <strong>Lose fat.</strong> In a calorie deficit, recommendations for people who train run from 1.6 to
            2.4 g/kg (Hector and Phillips). Needs rise with a bigger deficit and with leanness, so the target is
            2.2 g/kg. A review of lean, resistance-trained people in a deficit found 2.3 to 3.1 g per kg of lean
            mass (Helms and colleagues). Enter a body-fat percentage to see that range in grams.
          </p>
          <p>
            <strong>Per meal.</strong> About 0.4 g/kg a meal over four or more meals reaches 1.6 g/kg a day
            (Schoenfeld and Aragon). The table divides the daily target evenly across 3, 4 and 5 meals.
          </p>
          <p>
            <strong>RDA.</strong> The recommended dietary allowance for adults is 0.8 g/kg a day. It is set to
            prevent deficiency in nearly all healthy adults, not to support training, so it appears as a floor for
            comparison.
          </p>
        </>
      }
      caveat="For healthy adults who train. People with kidney disease, or on a medical or prescribed diet, should ask a clinician before raising protein. Pregnancy and breastfeeding change protein needs."
      sources={[
        {
          label:
            "Jäger R, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.",
          href: "https://doi.org/10.1186/s12970-017-0177-8",
        },
        {
          label:
            "Morton RW, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. Br J Sports Med. 2018;52(6):376–384.",
          href: "https://doi.org/10.1136/bjsports-2017-097608",
        },
        {
          label:
            "Hector AJ, Phillips SM. Protein recommendations for weight loss in elite athletes: a focus on body composition and performance. Int J Sport Nutr Exerc Metab. 2018;28(2):170–177.",
          href: "https://doi.org/10.1123/ijsnem.2017-0273",
        },
        {
          label:
            "Helms ER, et al. A systematic review of dietary protein during caloric restriction in resistance trained lean athletes: a case for higher intakes. Int J Sport Nutr Exerc Metab. 2014;24(2):127–138.",
          href: "https://doi.org/10.1123/ijsnem.2013-0054",
        },
        {
          label:
            "Schoenfeld BJ, Aragon AA. How much protein can the body use in a single meal for muscle-building? Implications for daily protein distribution. J Int Soc Sports Nutr. 2018;15:10.",
          href: "https://doi.org/10.1186/s12970-018-0215-1",
        },
        {
          label:
            "Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. National Academies Press; 2005.",
          href: "https://doi.org/10.17226/10490",
        },
      ]}
    />
  );
}
