import { macroEnergy, macroShares, type Targets } from "@/lib/calc/macros";
import { Value, cn } from "@/vector";

/** P · C · F on the category ink ramp (§2.5), always in this order. */
const PARTS = [
  { key: "protein", letter: "P", fill: "bg-cat-1" },
  { key: "carbs", letter: "C", fill: "bg-cat-2" },
  { key: "fat", letter: "F", fill: "bg-cat-3" },
] as const;

/** Share (%) a segment needs for its letter and value, and for its letter alone, at the narrowest result panel. */
const ROOM_FOR_VALUE = 14;
const ROOM_FOR_LETTER = 4;

/**
 * The calories split into protein, carbs and fat as one bar: square segments as wide as each macro's energy, 2pt
 * gaps, and a direct letter + share label under the start of each segment that has room. No hues; the table beside
 * it states every value, so the bar is hidden from screen readers.
 */
export function SplitBar({ targets, className }: { targets: Targets; className?: string }) {
  const energy = macroEnergy(targets);
  const shares = macroShares(targets);
  const shown = PARTS.filter((p) => energy[p.key] > 0);
  const grow = (key: (typeof PARTS)[number]["key"]) => ({ flex: `${energy[key]} 1 0px` });
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-2 gap-0.5">
        {shown.map((p) => (
          <span key={p.key} className={cn("h-full min-w-0 rounded-mark", p.fill)} style={grow(p.key)} />
        ))}
      </div>
      <div className="flex gap-0.5">
        {shown.map((p) => (
          <span key={p.key} className="flex min-w-0 items-baseline gap-1 whitespace-nowrap" style={grow(p.key)}>
            {shares[p.key] >= ROOM_FOR_LETTER ? <span className="type-label text-muted">{p.letter}</span> : null}
            {shares[p.key] >= ROOM_FOR_VALUE ? <Value value={`${shares[p.key]}%`} size="xs" tone="secondary" /> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
