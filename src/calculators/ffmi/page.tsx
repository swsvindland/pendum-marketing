import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { FfmiTool } from "./tool";

export function FfmiPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Fat-free mass index is lean mass relative to height. Where BMI counts all of your weight, FFMI counts only what is not fat."
      tool={<FfmiTool />}
      method={
        <>
          <p>
            Lean (fat-free) mass is your weight less its fat. FFMI divides it by the square of height, as BMI does
            with whole body weight. Vector Body computes the same value as BMI × (1 − body fat % ÷ 100). Weight and
            lean mass are in kilograms, height in metres and BF is the body-fat percentage; imperial inputs are
            converted exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) first.
          </p>
          <Formula>
            {`lean       = weight × (1 − BF ÷ 100)
FFMI       = lean ÷ height²
normalized = FFMI + 6.1 × (1.8 − height)`}
          </Formula>
          <p>
            FFMI rises slightly with height. <strong>Normalized FFMI</strong>, from Kouri et al. (1995), adjusts the
            value to a height of 1.8 m: it adds 0.061 for each centimetre under 1.8 m and takes off the same for
            each centimetre over it. The abstract of that paper prints the coefficient as 6.3; this calculator uses
            6.1, the value in common use. From 1.55 to 2.05 m the two differ by 0.05 or less. In the same study,
            normalized FFMI among male athletes who had not used anabolic steroids reached a limit of 25.0.
          </p>
          <p>
            The result is rounded to one decimal and compared with <strong>Vector Body’s bands</strong> for the
            unadjusted FFMI: typical lean mass from 17.0 to 20.0 for men and from 14.0 to 17.0 for women, both ends
            included, with lower and higher lean mass on either side. These are simplified comparisons, not clinical
            cutoffs and not targets. For context, Schutz et al. (2002) found a median FFMI of 18.9 in men and 15.4 in
            women aged 18 to 34, in 5,635 white adults in Switzerland measured by bioelectrical impedance.
          </p>
          <p>
            FFMI is only as good as the body-fat figure behind it. An error of 3 points of body fat moves FFMI by
            about 0.7 for a person with a BMI of 24.
          </p>
        </>
      }
      caveat="For adults. FFMI describes body composition; it is not a diagnosis, and the bands are not age-specific."
      sources={[
        {
          label:
            "Kouri EM, Pope HG Jr, Katz DL, Oliva P. Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clin J Sport Med, 1995;5(4):223–228.",
          href: "https://pubmed.ncbi.nlm.nih.gov/7496846/",
        },
        {
          label:
            "Schutz Y, Kyle UU, Pichard C. Fat-free mass index and fat mass index percentiles in Caucasians aged 18–98 y. Int J Obes Relat Metab Disord, 2002;26(7):953–960.",
          href: "https://pubmed.ncbi.nlm.nih.gov/12080449/",
        },
      ]}
    />
  );
}
