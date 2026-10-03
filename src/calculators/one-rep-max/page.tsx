import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { OneRepMaxTool } from "./tool";

export function OneRepMaxPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Estimate your one-rep max from a set of several reps, without testing a single. The rep-max table turns the estimate into loads for other rep counts."
      tool={<OneRepMaxTool />}
      method={
        <>
          <p>
            This calculator estimates a one-rep max (e1RM) the way Vector Lift does. Reps left in reserve count as
            reps you could have done, so 5 reps with 2 in reserve is 7 reps to failure. An empty reserve field
            counts as 0, a set taken to failure.
          </p>
          <p>
            The estimate is the <strong>Epley</strong> equation on reps to failure. At 1 rep to failure it is the
            weight itself. Kilograms and pounds give the same answer in their own unit.
          </p>
          <Formula>
            {`reps to failure = reps + reps in reserve

e1RM = weight × (1 + reps to failure / 30)
e1RM = weight   (1 rep to failure)`}
          </Formula>
          <p>
            The rep-max table runs Epley backwards. The load for r reps to failure is the e1RM divided by
            (1 + r / 30), and the e1RM itself at 1 rep. The percentage is that load as a share of the e1RM: 94 % for
            2 reps, 86 % for 5 and 75 % for 10. The table counts reps to failure, so the row marked as your set is
            your reps plus your reserve: 7 for 5 reps with 2 in reserve.
          </p>
          <Formula>{`load(r) = e1RM / (1 + r / 30)    r = 2 to 12`}</Formula>
          <p>
            <strong>Brzycki</strong> is shown for comparison up to 10 reps to failure, on the same reps to failure.
            From 2 to 9 reps it reads a little lower than Epley, and the two agree at 1 and at 10 reps. Past 10 the
            Brzycki denominator shrinks quickly and its estimate climbs, so it is left out.
          </p>
          <Formula>{`Brzycki = weight × 36 / (37 − reps to failure)`}</Formula>
          <p>
            Rep-based equations track measured maxes well on average but can miss for one person. LeSuer and
            colleagues compared seven equations, Epley and Brzycki among them, with measured one-rep maxes in
            untrained college students: accuracy differed by lift, and every equation underestimated the deadlift.
            The result also depends on how honest the reserve is.
          </p>
        </>
      }
      caveat="An estimate, not a tested max. Estimates beyond about 12 reps to failure are rough, and Epley overestimates at high reps. Test a heavy single only with a spotter or safety arms."
      sources={[
        { label: "Epley B. Poundage chart. In: Boyd Epley Workout. Lincoln, NE: Body Enterprises, 1985." },
        {
          label:
            "Brzycki M. Strength testing: predicting a one-rep max from reps-to-fatigue. J Phys Educ Recreat Dance. 1993;64(1):88–90.",
          href: "https://doi.org/10.1080/07303084.1993.10606684",
        },
        {
          label:
            "LeSuer DA, McCormick JH, Mayhew JL, Wasserstein RL, Arnold MD. The accuracy of prediction equations for estimating 1-RM performance in the bench press, squat, and deadlift. J Strength Cond Res. 1997;11(4):211–213.",
          href: "https://doi.org/10.1519/00124278-199711000-00001",
        },
      ]}
    />
  );
}
