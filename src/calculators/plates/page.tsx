import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame, Formula } from "../shared/frame";
import { PlatesTool } from "./tool";

export function PlatesPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Enter the load you want on the bar and see the plates for each side. When the plates cannot make it exactly, you get the nearest load they can."
      tool={<PlatesTool />}
      method={
        <>
          <p>
            The calculator loads a barbell the way Vector Lift does. Plates go on in pairs, one on each side, and
            pairs of every plate you mark as available are assumed. A load is the bar plus both sides.
          </p>
          <div className="w-0 min-w-full">
            <Formula>{`load = bar + 2 × (plates on one side)`}</Formula>
          </div>
          <p>
            Kilograms and pounds use separate equipment rather than a conversion, as in Lift&rsquo;s default gym.{" "}
            <strong>Kilograms:</strong> a 20 kg bar (15 and 10 kg also offered) and plates of 25, 20, 15, 10, 5, 2.5
            and 1.25 kg. <strong>Pounds:</strong> a 45 lb bar (35, 25 and 15 lb also offered) and plates of 45, 35,
            25, 10, 5 and 2.5 lb.
          </p>
          <p>
            Every sum is worked in hundredths of the unit, so 2.5 and 1.25 add up exactly. The calculator lists every
            load the plates can make and takes the one nearest the target; when two are equally near, it takes the
            lighter. A target under the empty bar has nothing to load.
          </p>
          <p>
            Each side uses the fewest plates that make the load, heaviest first against the collar. That can differ
            from loading the heaviest plate that fits each time: 165 lb on a 45 lb bar is 35 and 25 lb a side, two
            plates instead of three.
          </p>
          <p>
            The kilogram set is the competition one: the IPF uses a 20 kg bar and discs from 25 kg down to 1.25 kg,
            with smaller discs only for record attempts.
          </p>
        </>
      }
      caveat="Gym plates and bars can differ from their stated weight; calibrated competition plates are made to it. Collars are not counted: competition collars weigh 2.5 kg each."
      sources={[
        {
          label: "IPF. Technical Rules Book: the bar, discs and collars.",
          href: "https://www.powerlifting.sport/rules/codes/info/technical-rules",
        },
      ]}
    />
  );
}
