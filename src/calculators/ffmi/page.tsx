import { names } from "@/content/apps";
import type { CalculatorMeta } from "@/content/types";
import { FFMI_LABEL, ffmiBands, type Sex } from "@/lib/calc/ffmi";
import { LinkButton, Value } from "@/vector";
import { CalculatorFrame, Formula } from "../shared/frame";
import { Reference } from "../shared/reference";
import { ReadoutTable } from "../shared/table";
import { FfmiTool } from "./tool";

/** Median FFMI at ages 18 to 34 in Schutz et al. (2002), kg/m²: the context the page cites beside the bands. */
const SCHUTZ_MEDIAN: Record<Sex, number> = { male: 18.9, female: 15.4 };

export function FfmiPage({ meta }: { meta: CalculatorMeta }) {
  const men = ffmiBands("male");
  const women = ffmiBands("female");
  return (
    <CalculatorFrame
      meta={meta}
      intro="Fat-free mass index is lean mass relative to height. Where BMI counts all of your weight, FFMI counts only what is not fat."
      tool={
        <FfmiTool
          estimateLink={
            <LinkButton href="/calculators/body-fat" forward className="self-start">
              Estimate body fat
            </LinkButton>
          }
        />
      }
      method={
        <>
          <p>
            Lean (fat-free) mass is your weight less its fat. FFMI divides it by the square of height, as BMI does
            with whole body weight. {names.body} computes the same value as BMI × (1 − body fat % ÷ 100). Weight and
            lean mass are in kilograms, height in meters and BF is the body-fat percentage; imperial inputs are
            converted exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) first.
          </p>
          <Formula>
            {`lean       = weight × (1 − BF ÷ 100)
FFMI       = lean ÷ height²
normalized = FFMI + 6.1 × (1.8 − height)`}
          </Formula>
          <p>
            FFMI rises slightly with height. <strong>Normalized FFMI</strong>, from Kouri et al. (1995), adjusts the
            value to a height of 1.8 m: it adds 0.061 for each centimeter under 1.8 m and takes off the same for
            each centimeter over it. The abstract of that paper prints the coefficient as 6.3; this calculator uses
            6.1, the value in common use. From 1.55 to 2.05 m the two differ by 0.05 or less. In the same study,
            normalized FFMI among male athletes who had not used anabolic steroids reached a limit of 25.0.
          </p>
          <p>
            The result is rounded to one decimal and compared with <strong>{names.body}’s bands</strong> for the
            unadjusted FFMI: typical lean mass from 17.0 to 20.0 for men and from 14.0 to 17.0 for women, both ends
            included, with lower and higher lean mass on either side. These are simplified comparisons, not clinical
            cutoffs and not targets. For context, Schutz et al. (2002) found a median FFMI of {SCHUTZ_MEDIAN.male} in
            men and {SCHUTZ_MEDIAN.female} in women aged 18 to 34, in 5,635 white adults in Switzerland measured by
            bioelectrical impedance.
          </p>
          <Reference
            id="ffmi-bands"
            title="FFMI bands beside the Schutz medians"
            note={`Unadjusted FFMI in kg/m², on the one-decimal value, both ends of the typical band included. The bands are ${names.body}’s simplified comparisons; the medians are for ages 18 to 34 in Schutz et al. (2002).`}
          >
            <ReadoutTable
              caption={`${names.body}’s FFMI bands for men and women in kg/m², with the median FFMI at ages 18 to 34 from Schutz et al. (2002)`}
              columns={["Band", "Men", "Women"]}
              rows={[
                ...men.map((band, i) => [
                  FFMI_LABEL[band.category],
                  <Value key="men" value={band.range} size="s" />,
                  <Value key="women" value={women[i].range} size="s" />,
                ]),
                [
                  "Median, ages 18 to 34",
                  <Value key="men" value={SCHUTZ_MEDIAN.male.toFixed(1)} size="s" tone="secondary" />,
                  <Value key="women" value={SCHUTZ_MEDIAN.female.toFixed(1)} size="s" tone="secondary" />,
                ],
              ]}
            />
          </Reference>
          <p>
            The band follows the one-decimal value, so the number and its word always agree. {names.body} applies
            the same bands to the unrounded FFMI, so a result that rounds onto a band edge from outside can be
            named differently there. For a man, 20.04 shows as 20.0 and is typical here, and higher lean mass in
            the app.
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
