import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { StrengthScoreTool } from "./tool";

export function StrengthScorePage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="DOTS and Wilks scale a powerlifting total by body weight, so a lighter and a heavier lifter can be compared on one number."
      tool={<StrengthScoreTool />}
      method={
        <>
          <p>
            Both scores multiply the total (best squat + bench press + deadlift, in kilograms) by a coefficient that
            falls as body weight rises. Pound inputs are converted exactly (1 lb = 0.45359237 kg) first. The
            coefficients and body-weight limits are the ones OpenPowerlifting uses, and points are rounded to two
            decimals as it shows them.
          </p>
          <p>
            <strong>DOTS</strong> (Dynamic Objective Team Scoring) was introduced by the German federation BVDK and
            written by Tim Konertz. The denominator is a fourth-degree polynomial in body weight x, in kilograms.
            Body weight outside 40 to 210 kg (men) or 40 to 150 kg (women) counts as the nearest end of that range.
          </p>
          <Formula>
            {`DOTS = total × 500
       / (a·x⁴ + b·x³ + c·x² + d·x + e)

Men    a = −0.000001093
       b = 0.0007391293
       c = −0.1918759221
       d = 24.0900756
       e = −307.75076

Women  a = −0.0000010706
       b = 0.0005158568
       c = −0.1126655495
       d = 13.6175032
       e = −57.96288`}
          </Formula>
          <p>
            <strong>Wilks</strong> is Robert Wilks&rsquo; original formula; the IPF has since moved to its own points.
            Its denominator is a fifth-degree polynomial. OpenPowerlifting holds body weight to 40 to 201.9 kg for
            men and 26.51 to 154.53 kg for women, which keeps clear of the polynomial&rsquo;s asymptote at the heavy
            end and of very large coefficients at the light end.
          </p>
          <Formula>
            {`Wilks = total × 500
        / (a + b·x + c·x² + d·x³ + e·x⁴ + f·x⁵)

Men    a = −216.0475144
       b = 16.2606339
       c = −0.002388645
       d = −0.00113732
       e = 0.00000701863
       f = −0.00000001291

Women  a = 594.31747775582
       b = −27.23842536447
       c = 0.82112226871
       d = −0.00930733913
       e = 0.00004731582
       f = −0.00000009054`}
          </Formula>
          <p>
            The scores are for comparing lifters, within a meet or across meets, not for grading one lifter. A score
            is only as comparable as the totals behind it: equipment, federation rules and drug testing all differ.
            Neither formula defines levels such as &ldquo;beginner&rdquo; or &ldquo;elite&rdquo;, so none are shown.
          </p>
        </>
      }
      caveat="For adult powerlifting totals. Federations rank by different formulas, so compare a score only with scores from the same formula."
      sources={[
        {
          label: "OpenPowerlifting. DOTS points (opl-data, crates/coefficients/src/dots.rs).",
          href: "https://gitlab.com/openpowerlifting/opl-data/-/blob/main/crates/coefficients/src/dots.rs",
        },
        {
          label: "OpenPowerlifting. Wilks points (opl-data, crates/coefficients/src/wilks.rs).",
          href: "https://gitlab.com/openpowerlifting/opl-data/-/blob/main/crates/coefficients/src/wilks.rs",
        },
        {
          label: "Vanderburgh PM, Batterham AM. Validation of the Wilks powerlifting formula. Med Sci Sports Exerc. 1999;31(12):1869–1875.",
          href: "https://pubmed.ncbi.nlm.nih.gov/10613442/",
        },
      ]}
    />
  );
}
