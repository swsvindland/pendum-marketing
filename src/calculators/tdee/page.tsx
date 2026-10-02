import type { CalculatorMeta } from "@/content/types";
import { ACTIVITY_LEVELS } from "@/lib/calc/tdee";
import { formatNumber } from "@/lib/units";
import { CalculatorFrame, Formula } from "../shared/frame";
import { TdeeTool } from "./tool";

export function TdeePage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Total daily energy expenditure (TDEE) is the energy you use in a day: your resting energy plus your activity. It is the intake that would hold your weight steady."
      tool={<TdeeTool />}
      method={
        <>
          <p>
            Resting energy, or basal metabolic rate, comes from the <strong>Mifflin-St Jeor equation</strong> in the
            rounded form Vector Macros uses for a program&rsquo;s starting estimate. Imperial inputs are converted
            exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) first.
          </p>
          {/* w-0 min-w-full: the long lines scroll inside the formula instead of widening the method column. */}
          <div className="w-0 min-w-full">
            <Formula>
              {`Resting (kcal/day) = 10 × weight (kg) + 6.25 × height (cm) − 5 × age (years) + s
s = +5 (male equation) or −161 (female equation)
TDEE = round(resting × activity multiplier)`}
            </Formula>
          </div>
          <p>
            The published equation uses 9.99 for weight and 4.92 for age, with 166 kcal between the male and female
            forms. The rounded coefficients differ from it by a few kcal a day. The study measured 498 healthy adults
            aged 19 to 78 by indirect calorimetry.
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
            For example, a 30-year-old man who is 180 cm tall and weighs 80 kg rests at 800 + 1,125 − 150 + 5 = 1,780
            kcal a day. Active (× 1.55) gives 2,759 kcal a day. Ages 18 to 100, heights 120 to 230 cm and weights 35 to
            350 kg are accepted, as in the app.
          </p>
        </>
      }
      caveat="An estimate for adults 18 and over. The equation predicts resting energy from size and age, not body composition, and the activity multipliers are coarse. Vector Macros starts from this estimate, then a weekly check-in compares your logged intake with your trend weight and proposes a change, which you accept or keep."
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
