import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { CalorieDeficitTool } from "./tool";

export function CalorieDeficitPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="How long a change in weight takes at a weekly pace set as a share of body weight, the date it lands on, and the daily calorie change it needs at the start."
      tool={<CalorieDeficitTool />}
      method={
        <>
          <p>
            The pace is a percentage of your current weight each week, so each week’s step is worked out from
            the weight the week before. The projection steps one week at a time and counts the last part-week as a
            fraction. This is how Vector Macros projects its goal date. Imperial inputs are converted exactly
            (1 lb = 0.45359237 kg) first.
          </p>
          <Formula>
            {`step       = weight × pace / 100
next week  = weight − step   (lose)
           = weight + step   (gain)
last week  = left / step
             (once left ≤ step)
days       = ceil(weeks × 7)
goal date  = today + days

first week = min(distance, step)
kcal a day = first week × 7,700 / 7
maintenance ≥ 1,500 + kcal a day   (lose)`}
          </Formula>
          <p>
            For 80 kg to 75 kg at 0.5% a week, the first step is 0.4 kg. After 12 weeks the weight is 75.33 kg, the
            13th step is 0.38 kg and 0.33 kg is left, so the goal comes at 12.9 weeks, 91 days from today. The daily
            change at the start is 0.4 × 7,700 / 7 = 440 kcal below maintenance.
          </p>
          <p>
            <strong>Paces.</strong> A loss of 0.25%, 0.5%, 0.75% or 1% a week, or a gain of 0.1%, 0.25% or 0.5% a
            week. Vector Macros marks 0.5–1% as the band that suits most people losing weight and 0.1–0.25% for
            gaining; a higher gain adds more fat alongside the muscle. Because the step is a share of weight, it
            shrinks as you lose and grows as you gain, and the calorie change follows it.
          </p>
          <p>
            <strong>7,700 kcal per kilogram.</strong> This is the familiar 3,500 kcal per pound, about 32.2 MJ/kg, and
            it is a short-term approximation. As weight falls, the energy the body uses falls with it, so a fixed
            deficit brings less loss over time than this model shows (Hall and colleagues 2011). The energy in a
            kilogram lost also depends on body fat: it is lower for leaner people, who lose more lean tissue (Hall
            2008). The NIDDK Body Weight Planner models both for a longer plan.
          </p>
          <p>
            <strong>Limits.</strong> Vector Macros does not set a daily target under 1,500 kcal, and it does not plan
            a cut when the current or goal weight is a BMI under 18.5. This page asks for neither your maintenance nor
            your height, so it applies neither. For a cut it states the maintenance the pace needs to keep intake at
            1,500 kcal or more: for the example, 1,500 + 440 = 1,940 kcal a day.
          </p>
          <p>
            At 520 weeks or more, no date is shown, as in the app. Under a week, the time is given in days. A change
            that rounds to 0.00 kg or lb counts as no change.
          </p>
        </>
      }
      caveat="An estimate for planning, not a prediction. Water, food in the gut and changes in daily activity move the scale from week to week. For adults who are not pregnant or breastfeeding. A medical condition, a low starting weight or a goal weight under the healthy range for your height (a BMI under 18.5) calls for a clinician."
      sources={[
        {
          label: "NIDDK. Body Weight Planner.",
          href: "https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner",
        },
        {
          label:
            "Hall KD, Sacks G, Chandramohan D, et al. Quantification of the effect of energy imbalance on bodyweight. Lancet. 2011;378(9793):826–837.",
          href: "https://doi.org/10.1016/S0140-6736(11)60812-X",
        },
        {
          label: "Hall KD. What is the required energy deficit per unit weight loss? Int J Obes. 2008;32(3):573–576.",
          href: "https://doi.org/10.1038/sj.ijo.0803720",
        },
      ]}
    />
  );
}
