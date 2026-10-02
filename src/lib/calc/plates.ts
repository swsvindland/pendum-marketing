// Plates for a barbell load, as Vector Lift loads a bar (lift-track src/lib/loads.ts: defaultGym, achievableLoads,
// roundLoad, platesPerSide). Loads are in the gym's own unit, kg or lb, because plates do not convert; inside, every
// sum is in hundredths of that unit so 2.5 + 1.25 adds up exactly. Pairs of every available plate are assumed.

export type PlateUnit = "kg" | "lb";

/**
 * Vector Lift's default gym for each unit (bar and plates), plus the bars the calculator offers. Switching the unit
 * switches to the other set rather than converting, as Lift does: a 20 kg plate is not a 44.09 lb plate.
 */
export const GYM_DEFAULTS: Record<PlateUnit, { bar: number; bars: number[]; plates: number[] }> = {
  kg: { bar: 20, bars: [20, 15, 10], plates: [25, 20, 15, 10, 5, 2.5, 1.25] },
  lb: { bar: 45, bars: [45, 35, 25, 15], plates: [45, 35, 25, 10, 5, 2.5] },
};

/** Hundredths of the unit. */
const cents = (value: number) => Math.round(value * 100);

/** Every total (in hundredths) that pairs of these plates make on one side, from 0 up to `limit`, ascending. */
export function perSideSums(plates: number[], limit: number): number[] {
  const sizes = plates.map(cents).filter((p) => p > 0);
  const reachable = new Uint8Array(Math.max(0, limit) + 1);
  reachable[0] = 1;
  for (let total = 0; total <= limit; total++) {
    if (!reachable[total]) continue;
    for (const size of sizes) if (total + size <= limit) reachable[total + size] = 1;
  }
  const sums: number[] = [];
  reachable.forEach((ok, total) => {
    if (ok) sums.push(total);
  });
  return sums;
}

/** Bar loads the plates can make, ascending, up to about `upTo`: bar + 2 × a per-side total. */
export function achievableLoads(bar: number, plates: number[], upTo: number): number[] {
  return perSideSums(plates, Math.max(0, cents((upTo - bar) / 2)) + 1).map((side) => bar + (side * 2) / 100);
}

/**
 * The load nearest the target that the bar and plates can make, as Vector Lift's `roundLoad` does for a barbell.
 * "nearest" breaks ties toward the lighter load; "down" never exceeds the target, or gives the lightest load (the
 * empty bar) when nothing is at or under it. Searches loads up to target × 1.25 + 10. 0 when the target is not
 * positive.
 */
export function roundLoad(target: number, bar: number, plates: number[], mode: "nearest" | "down" = "nearest"): number {
  if (!(target > 0)) return 0;
  const loads = achievableLoads(bar, plates, target * 1.25 + 10);
  let best = loads[0];
  for (const load of loads) {
    if (mode === "down") {
      if (load <= target + 1e-9) best = load;
    } else if (Math.abs(load - target) < Math.abs(best - target) - 1e-9) best = load;
  }
  return best;
}

/**
 * Plates for one side of the bar, heaviest first, as Vector Lift's `platesPerSide`: the fewest plates that make
 * the load exactly (a change-making search, so 165 lb is 35 + 25 a side, not 45 + 10 + 5). Among equally short
 * lists, the one that starts with the heaviest plate. null when the load cannot be made exactly or is under the bar.
 */
export function platesPerSide(load: number, bar: number, plates: number[]): number[] | null {
  const perSide = cents((load - bar) / 2);
  if (perSide < 0) return null;
  const sizes = plates
    .map(cents)
    .filter((p) => p > 0)
    .sort((a, b) => b - a);
  // count[t]: fewest plates that make t; last[t]: the plate added to reach t (0 when t cannot be made).
  const count = new Int32Array(perSide + 1).fill(-1);
  const last = new Int32Array(perSide + 1);
  count[0] = 0;
  for (let total = 1; total <= perSide; total++) {
    for (const size of sizes) {
      const rest = total - size;
      if (rest < 0 || count[rest] < 0) continue;
      if (count[total] < 0 || count[rest] + 1 < count[total]) {
        count[total] = count[rest] + 1;
        last[total] = size;
      }
    }
  }
  if (count[perSide] < 0) return null;
  const side: number[] = [];
  for (let total = perSide; total > 0; total -= last[total]) side.push(last[total] / 100);
  return side.sort((a, b) => b - a);
}

export type PlateLoading = {
  /** The load on the bar, bar included. */
  load: number;
  /** Plates on each side, heaviest first (empty for the bar alone). */
  perSide: number[];
  /** load − target, in the unit: negative under the target, positive over it. 0 when exact (to the hundredth). */
  difference: number;
  /** The target is lighter than the empty bar. */
  belowBar: boolean;
};

/** What the calculator shows: the nearest load, its plates and how far it is from the target. */
export function plateLoading(target: number, bar: number, plates: number[]): PlateLoading {
  const load = roundLoad(target, bar, plates);
  return {
    load,
    perSide: platesPerSide(load, bar, plates) ?? [],
    difference: (cents(load) - cents(target)) / 100,
    belowBar: cents(target) < cents(bar),
  };
}

/** Runs of equal plates, heaviest first: [25, 25, 10] → [{ plate: 25, count: 2 }, { plate: 10, count: 1 }]. */
export function groupPlates(side: number[]): { plate: number; count: number }[] {
  const groups: { plate: number; count: number }[] = [];
  for (const plate of side) {
    const prev = groups[groups.length - 1];
    if (prev && prev.plate === plate) prev.count += 1;
    else groups.push({ plate, count: 1 });
  }
  return groups;
}
