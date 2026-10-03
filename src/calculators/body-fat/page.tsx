import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { BodyFatTool } from "./tool";

export function BodyFatPage({ meta }: { meta: CalculatorMeta }) {
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
            computes them as Vector Body does.
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
%BF = 163.205 × log10(waist + hips − neck)
    − 97.684 × log10(height) − 78.387`}
          </Formula>
          <p>
            As in Vector Body, a result is kept only when it falls between 0 and 75 %. Measurements that give
            anything else, or a circumference term of zero or less (an abdomen no larger than the neck), give no
            estimate. With a weight, fat mass is weight × body fat % ÷ 100 and lean mass is the rest.
          </p>
          <p>
            The result is rounded to one decimal and placed in the <strong>ACE body-fat categories</strong>, with
            the edges Vector Body uses. For men: very low below 6 % (ACE’s essential fat range is 2 to 5 %), lean
            from 6.0 to 13.9 % (the athlete range), typical from 14.0 to 24.9 % (ACE fitness and average together)
            and elevated from 25.0 % (ACE obese). For women: very low below 14 % (essential fat is 10 to 13 %), lean
            from 14.0 to 20.9 %, typical from 21.0 to 31.9 % and elevated from 32.0 %. Very low covers the essential
            fat range and anything below it; the result says which. These are general comparisons, not personal
            targets.
          </p>
          <p>
            The category follows the one-decimal value, so the number and its word always agree. Vector Body
            applies the same edges to the unrounded value, so for a result less than 0.05 below an edge (24.96 %
            for a man, shown as 25.0 %) the app names the category below the one shown here.
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
        {
          label:
            "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men from body circumferences and height. Naval Health Research Center, Report 84-11, 1984.",
          href: "https://apps.dtic.mil/sti/tr/pdf/ADA143890.pdf",
        },
        {
          label:
            "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy women from body circumferences and height. Naval Health Research Center, Report 84-29, 1984.",
          href: "https://apps.dtic.mil/sti/tr/pdf/ADA146456.pdf",
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
