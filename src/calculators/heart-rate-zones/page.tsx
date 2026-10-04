import type { CalculatorMeta } from "@/content/types";
import { ZONES, zonesByAge } from "@/lib/calc/heart-rate-zones";
import { formatNumber } from "@/lib/units";
import { Value } from "@/vector";
import { CalculatorFrame, Formula } from "../shared/frame";
import { Reference } from "../shared/reference";
import { ReadoutTable } from "../shared/table";
import { HeartRateZonesTool } from "./tool";

export function HeartRateZonesPage({ meta }: { meta: CalculatorMeta }) {
  const byAge = zonesByAge();
  const at40 = byAge.find((row) => row.age === 40);
  return (
    <CalculatorFrame
      meta={meta}
      intro="Five heart rate training zones, from very light to maximum. Estimate your maximum heart rate from your age, or enter one you have measured, and add a resting heart rate for zones based on heart rate reserve."
      tool={<HeartRateZonesTool />}
      method={
        <>
          <p>
            Maximum heart rate comes from the <strong>Tanaka equation</strong>, fitted in a meta-analysis of 351 studies
            (18,712 people) and confirmed in 514 people tested in the laboratory. It held for men and women and for
            sedentary and trained adults alike. The estimate is rounded to a whole bpm before the zones are worked out.
          </p>
          <Formula>
            {`HRmax    = 208 − 0.7 × age (years)
% of max = round(p × HRmax)
Reserve  = round(rest
           + p × (HRmax − rest))
p        = 0.5, 0.6, 0.7, 0.8, 0.9, 1.0`}
          </Formula>
          <p>
            <strong>220 − age</strong> is shown for comparison. It is the older rule of thumb, usually credited to Fox
            and colleagues (1971), and was not derived from a study of its own. The two agree at 40. Above 40, 220 − age
            gives a lower maximum (150 against 159 bpm at 70), the underestimate in older adults that Tanaka reported.
          </p>
          <p>
            With a resting heart rate, the zones use <strong>heart rate reserve</strong>, the method of Karvonen and
            colleagues (1957) that ACSM uses to set exercise intensity. The reserve is maximum minus resting heart rate;
            each zone edge is a percent of the reserve added to the resting rate, so the zones sit higher than the same
            percent of maximum.
          </p>
          <p>The zones and their names:</p>
          <ul className="flex flex-col gap-2">
            {ZONES.map((z) => (
              <li key={z.zone}>
                <strong>
                  Zone {z.zone}, {z.label.toLowerCase()}
                </strong>
                : {z.from} to {z.to}%
              </li>
            ))}
          </ul>
          <p>
            Five zones in 10% steps are a common training convention, the one heart rate monitors use, not a clinical
            standard. For comparison, ACSM classes 64 to 76% of maximum (40 to 59% of reserve) as moderate and 77 to
            95% of maximum (60 to 89% of reserve) as vigorous.
          </p>
          <p>
            Each edge is rounded to a whole bpm, halves up. A zone runs from its lower edge to 1 bpm below the next
            zone’s, and zone 5 ends at the maximum, so no reading falls in two zones. For example, at age 40 the maximum
            is 208 − 28 = 180 bpm, and the zones are 90–107, 108–125, 126–143, 144–161 and 162–180 bpm. With a resting
            heart rate of 60 bpm, the reserve is 120 bpm and zone 2 runs from 60 + 72 = 132 to 143 bpm.
          </p>
          <Reference
            id="zones-by-age"
            title="Zones by age"
            note={`Beats per minute, from the Tanaka maximum rounded to a whole bpm. Each zone runs from the number shown to 1 bpm below the next; zone 5 ends at the maximum for that age${at40 ? ` (${formatNumber(at40.maxHr)} bpm at 40)` : ""}. Any age formula has a typical error of 7 to 11 bpm, and a measured maximum or a resting heart rate changes every row: the tool works them in.`}
          >
            <div className="overflow-x-auto">
              <ReadoutTable
                gap="sm"
                caption="The five training zones in beats per minute by age, 20 to 70, from the Tanaka maximum heart rate"
                columns={["Age", ...ZONES.map((z) => `Zone ${z.zone}`)]}
                rows={byAge.map((row) => [
                  <Value key="age" value={formatNumber(row.age)} size="xs" />,
                  ...row.zones.map((z) => (
                    <Value key={z.zone} value={`${formatNumber(z.low)}–${formatNumber(z.high)}`} size="xs" />
                  )),
                ])}
              />
            </div>
          </Reference>
        </>
      }
      caveat="For healthy adults. Any age formula has a typical error of 7 to 11 bpm, and your true maximum can differ from it by 20 bpm or more. Medications such as beta blockers lower heart rate and change these zones. A laboratory exercise test or a field test measures your maximum more accurately. With a heart condition, or symptoms during exercise, ask your clinician before training by heart rate."
      sources={[
        {
          label:
            "Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol. 2001;37(1):153–156.",
          href: "https://doi.org/10.1016/S0735-1097(00)01054-8",
        },
        {
          label:
            "Karvonen MJ, Kentala E, Mustala O. The effects of training on heart rate; a longitudinal study. Ann Med Exp Biol Fenn. 1957;35(3):307–315.",
          href: "https://pubmed.ncbi.nlm.nih.gov/13470504/",
        },
        {
          label:
            "Garber CE, Blissmer B, Deschenes MR, et al. American College of Sports Medicine position stand. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults. Med Sci Sports Exerc. 2011;43(7):1334–1359.",
          href: "https://doi.org/10.1249/MSS.0b013e318213fefb",
        },
        { label: "American College of Sports Medicine. ACSM’s Guidelines for Exercise Testing and Prescription. 11th ed. Wolters Kluwer, 2021." },
        {
          label:
            "Robergs RA, Landwehr R. The surprising history of the “HRmax = 220 − age” equation. J Exerc Physiol Online. 2002;5(2):1–10.",
          href: "https://www.asep.org/asep/asep/Robergs2.pdf",
        },
        {
          label:
            "Fox SM, Naughton JP, Haskell WL. Physical activity and the prevention of coronary heart disease. Ann Clin Res. 1971;3(6):404–432.",
          href: "https://pubmed.ncbi.nlm.nih.gov/4945367/",
        },
      ]}
    />
  );
}
