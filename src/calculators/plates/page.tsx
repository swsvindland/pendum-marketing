import { names } from "@/content/apps";
import type { CalculatorMeta } from "@/content/types";
import { GYM_DEFAULTS, commonLoads, type CommonLoadRow, type PlateUnit } from "@/lib/calc/plates";
import { formatNumber } from "@/lib/units";
import { Value } from "@/vector";
import { CalculatorFrame, Formula } from "../shared/frame";
import { Reference } from "../shared/reference";
import { ReadoutTable } from "../shared/table";
import { PlatesTool } from "./tool";

/** A plate or load as the tool prints it: up to two decimals, no trailing zeros ("1.25", "2.5", "100"). */
const plain = (n: number) => formatNumber(n, 2, 0);

/** The plates on one side as a sum, heaviest first: "25 + 25 + 10", or "0" for the bar alone. */
const perSide = (row: CommonLoadRow) =>
  row.perSide.length ? row.perSide.flatMap((g) => Array.from({ length: g.count }, () => plain(g.plate))).join(" + ") : "0";

function CommonLoads({ unit }: { unit: PlateUnit }) {
  const { bar, plates } = GYM_DEFAULTS[unit];
  const word = unit === "kg" ? "kilograms" : "pounds";
  return (
    <Reference
      id={`common-loads-${unit}`}
      title={`Common loads in ${word}`}
      note={`On the ${plain(bar)} ${unit} bar with every default plate (${plates.map(plain).join(", ")} ${unit}): the fewest plates that make the load, heaviest first against the collar.`}
    >
      <ReadoutTable
        caption={`Plates on each side of a ${plain(bar)} ${unit} bar for common loads in ${word}, heaviest first`}
        columns={["Load", "Plates on each side"]}
        rows={commonLoads(unit).map((row) => [
          <Value key="load" value={plain(row.load)} unit={unit} size="s" />,
          <Value key="plates" value={perSide(row)} unit={unit} size="s" />,
        ])}
      />
    </Reference>
  );
}

export function PlatesPage({ meta }: { meta: CalculatorMeta }) {
  return (
    <CalculatorFrame
      meta={meta}
      intro="Enter the load you want on the bar and see the plates for each side. When the plates cannot make it exactly, you get the nearest load they can."
      tool={<PlatesTool />}
      method={
        <>
          <p>
            The calculator loads a barbell the way {names.lift} does. Plates go on in pairs, one on each side, and
            any number of pairs of each plate you mark as available is assumed. A load is the bar plus both sides.
          </p>
          <Formula>{`load = bar + 2 × (plates on one side)`}</Formula>
          <p>
            Kilograms and pounds use separate equipment rather than a conversion, as in {names.lift}&rsquo;s default gym.{" "}
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
            Here the calculator differs from {names.lift} on purpose. {names.lift} searches loads only up to the
            target × 1.25 + 10. With only large plates it can therefore settle on a lighter load when a heavier one
            is nearer: a 95 lb target on a 45 lb bar with only 45 lb plates gives 45 lb in {names.lift} and 135 lb
            here. With a 5 kg or 5 lb plate or lighter, as in both default sets, the two agree.
          </p>
          <p>
            Each side uses the fewest plates that make the load, heaviest first against the collar. That can differ
            from loading the heaviest plate that fits each time: 165 lb on a 45 lb bar is 35 and 25 lb a side, two
            plates instead of three.
          </p>
          <CommonLoads unit="kg" />
          <CommonLoads unit="lb" />
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
