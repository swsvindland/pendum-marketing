import { names } from "@/content/apps";
import type { CalculatorMeta } from "@/content/types";
import { ACTIVITY_LEVELS, PROFILE_LIMITS, tdeeExample } from "@/lib/calc/tdee";
import { formatNumber } from "@/lib/units";
import { Value } from "@/vector";
import { CalculatorFrame, Formula } from "../shared/frame";
import { Reference } from "../shared/reference";
import { ReadoutTable } from "../shared/table";
import { TdeeTool } from "./tool";

export function TdeePage({ meta }: { meta: CalculatorMeta }) {
  // The worked example, every number from the lib: a 30-year-old man, 180 cm and 80 kg.
  const example = tdeeExample();
  const p = example.profile;
  const active = example.levels.find((l) => l.activity === "moderate") ?? example.levels[0];
  return (
    <CalculatorFrame
      meta={meta}
      intro="Total daily energy expenditure (TDEE) is the energy you use in a day: your resting energy plus your activity. It is the intake that would hold your weight steady."
      tool={<TdeeTool />}
      method={
        <>
          <p>
            Resting energy is resting energy expenditure (REE) as the <strong>Mifflin-St Jeor equation</strong> predicts
            it, in the simplified form for each sex that {names.macros} uses for a program&rsquo;s starting estimate.
            Imperial inputs are converted exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) first.
          </p>
          <Formula>
            {`REE (kcal/day) = 10 × weight (kg)
  + 6.25 × height (cm)
  − 5 × age (years) + s
s = +5 (male) or −161 (female)
TDEE = round(REE × activity multiplier)`}
          </Formula>
          <p>
            The paper gives two forms. The full regression uses 9.99 for weight and 4.92 for age, with 166 kcal between
            men and women. The simplified form above is published alongside it, and its authors report that it predicts
            as well. Over the accepted inputs the two differ by less than 8 kcal a day of resting energy. The study
            measured 498 healthy adults aged 19 to 78 by indirect calorimetry.
          </p>
          <p>
            The <strong>activity multipliers</strong> are the conventional factors, not part of the Mifflin study:
          </p>
          <ul className="flex flex-col gap-2">
            {ACTIVITY_LEVELS.map((l) => (
              <li key={l.value}>
                <strong>{l.label}</strong>, × {formatNumber(l.multiplier, 3, 1)}: {l.description.toLowerCase()}
              </li>
            ))}
          </ul>
          <p>
            For example, a {p.age}-year-old man who is {p.heightCm} cm tall and weighs {p.weightKg} kg rests at{" "}
            {formatNumber(10 * p.weightKg)} + {formatNumber(6.25 * p.heightCm)} − {formatNumber(5 * p.age)} + 5 ={" "}
            {formatNumber(example.resting)} kcal a day. {active.label} (× {formatNumber(active.multiplier, 3, 1)}) gives{" "}
            {formatNumber(active.kcal)} kcal a day. Ages {PROFILE_LIMITS.age.min} to {PROFILE_LIMITS.age.max}, heights{" "}
            {PROFILE_LIMITS.heightCm.min} to {PROFILE_LIMITS.heightCm.max} cm and weights {PROFILE_LIMITS.weightKg.min} to{" "}
            {PROFILE_LIMITS.weightKg.max} kg are accepted, as in the app.
          </p>
          <Reference
            id="tdee-example"
            title="The example at each activity level"
            note={`Resting energy ${formatNumber(example.resting)} kcal a day times each multiplier, rounded to a whole kcal: the same table the tool fills from your own numbers.`}
          >
            <ReadoutTable
              caption={`TDEE of the worked example, a ${p.age}-year-old man of ${p.heightCm} cm and ${p.weightKg} kg, at each activity level`}
              columns={["Activity", "Multiplier", "TDEE"]}
              rows={example.levels.map((l) => [
                l.label,
                <Value key="multiplier" value={formatNumber(l.multiplier, 3, 1)} size="s" tone="secondary" />,
                <Value key="kcal" value={formatNumber(l.kcal)} unit="kcal/day" size="s" />,
              ])}
            />
          </Reference>
        </>
      }
      caveat="An estimate for adults 18 and over who are not pregnant or breastfeeding. The equation predicts resting energy from size and age, not body composition, and the activity multipliers are coarse. Treat the result as a starting point and adjust it against your own weight trend."
      sources={[
        {
          label:
            "Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241–247.",
          href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
        },
      ]}
    />
  );
}
