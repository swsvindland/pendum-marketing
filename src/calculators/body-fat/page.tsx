import { TermList } from "@/components/site/lists";
import { names } from "@/content/apps";
import type { CalculatorMeta } from "@/content/types";
import { ACE_ESSENTIAL, bodyFatBands, type NavyEquation } from "@/lib/calc/body-fat";
import { Value } from "@/vector";
import { CalculatorFrame, Formula } from "../shared/frame";
import { Reference } from "../shared/reference";
import { ReadoutTable } from "../shared/table";
import { BodyFatTool } from "./tool";

/** ACE's essential fat range for one sex, as the note states it ("2 to 5%"). */
const essential = (sex: NavyEquation) => `${ACE_ESSENTIAL[sex][0]} to ${ACE_ESSENTIAL[sex][1]}%`;

/**
 * The tape sites, as the Navy reports (Hodgdon and Beckett 1984) and AR 600-9 place them and as the tool's field
 * hints word them: the same instruction in both places.
 */
const SITES = [
  { term: "Height", detail: "Without shoes." },
  { term: "Neck (men and women)", detail: "Just below the larynx (Adam’s apple)." },
  { term: "Abdomen (men)", detail: "Around the abdomen at the navel, at the end of a relaxed breath out." },
  { term: "Waist (women)", detail: "At the natural waist, the narrowest point of the abdomen." },
  { term: "Hips (women)", detail: "At the widest point of the buttocks, feet together." },
];

export function BodyFatPage({ meta }: { meta: CalculatorMeta }) {
  const men = bodyFatBands("male");
  const women = bodyFatBands("female");
  return (
    <CalculatorFrame
      meta={meta}
      intro="The US Navy method estimates body-fat percentage from your height and a tape measure: the neck and abdomen, or the neck, waist and hips."
      tool={<BodyFatTool />}
      method={
        <>
          <p>
            Hodgdon and Beckett fitted these equations for the US Navy in 1984, against underwater weighing in 602
            men and 214 women. The US Army prints the same equations in AR 600-9 (2019), Appendix B. This calculator
            computes them as {names.body} does.
          </p>
          <p>
            Every measurement is converted to inches (cm ÷ 2.54) and the logarithms are base 10. The male equation
            uses the abdomen at the navel; the female equation uses the natural waist and the hips.
          </p>
          <Formula>
            {`Male
%BF = 86.010 × log10(abdomen − neck)
    − 70.041 × log10(height) + 36.76

Female
%BF = 163.205
    × log10(waist + hips − neck)
    − 97.684 × log10(height) − 78.387`}
          </Formula>
          <Reference
            id="where-to-measure"
            title="Where to measure"
            note="Tape level and snug, not pressing into the skin. Measure the same sites the same way each time: tape position moves the result more than anything else."
          >
            <TermList items={SITES} />
          </Reference>
          <p>
            As in {names.body}, a result is kept only when it falls between 0 and 75%. Measurements that give
            anything else, or a circumference term of zero or less (an abdomen no larger than the neck), give no
            estimate. With a weight, fat mass is weight × body fat % ÷ 100 and lean mass is the rest.
          </p>
          <p>
            The result is rounded to one decimal and placed in the <strong>ACE body-fat categories</strong>, with
            the edges {names.body} uses.
          </p>
          <Reference
            id="ace-categories"
            title="ACE body-fat categories"
            note={`Percent body fat on the one-decimal value. Very low covers ACE’s essential fat range (${essential("male")} for men, ${essential("female")} for women) and anything below it; the result says which. Lean is ACE’s athlete range, typical its fitness and average ranges together, and elevated its obese range. General comparisons, not personal targets.`}
          >
            <ReadoutTable
              caption={`ACE body-fat categories for men and women, in percent body fat, with the edges ${names.body} uses`}
              columns={["Category", "Men", "Women"]}
              rows={men.map((band, i) => [
                band.label,
                <Value key="men" value={band.range} unit="%" size="s" />,
                <Value key="women" value={women[i].range} unit="%" size="s" />,
              ])}
            />
          </Reference>
          <p>
            The category follows the one-decimal value, so the number and its word always agree.{" "}
            {names.body} applies the same edges to the unrounded value, so for a result less than 0.05 below an
            edge (24.96% for a man, shown as 25.0%) the app names the category below the one shown here.
          </p>
          <p>
            The standard error of the estimate is 3 to 4 percentage points of body fat, so read one result as a
            range. Tape position moves the result more than anything else: measure the same sites the same way each
            time and compare your own readings with each other.
          </p>
        </>
      }
      caveat="For adults. This is an estimate from a tape measure, not a measurement of body fat and not a diagnosis. Small changes in where the tape sits change the result."
      sources={[
        // DTIC (apps.dtic.mil) answers every report and citation URL with a redirect to a maintenance page (checked
        // 2026-10-03), so the two Navy reports are cited by report and DTIC accession number without a link.
        {
          label:
            "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men from body circumferences and height. Naval Health Research Center, Report 84-11, 1984. DTIC ADA143890.",
        },
        {
          label:
            "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy women from body circumferences and height. Naval Health Research Center, Report 84-29, 1984. DTIC ADA146456.",
        },
        {
          label: "U.S. Army. AR 600-9, The Army Body Composition Program (2019), Appendix B, Table B-5.",
          href: "https://tripler.tricare.mil/Portals/138/Army%20Body%20Compostion%20Program.pdf#page=40",
        },
        {
          label: "ACE. Anthropometric measurements: when to use this assessment (2014).",
          href: "https://www.acefitness.org/fitness-certifications/ace-answers/exam-preparation-blog/3815/anthropometric-measurements-when-to-use-this-assessment/",
        },
        {
          label:
            "Foulis SA, et al. Body composition changes during 8 weeks of military training are not accurately captured by circumference-based assessments. Front Physiol, 2023.",
          href: "https://doi.org/10.3389/fphys.2023.1183836",
        },
      ]}
    />
  );
}
