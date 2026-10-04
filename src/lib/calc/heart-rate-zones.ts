// Maximum heart rate from age (Tanaka, with 220 − age for comparison) and five training zones, as a percent of the
// maximum or, with a resting heart rate, of the heart rate reserve (Karvonen). No app implements heart rate math
// (docs/sources/formulas.json), so nothing here has to match one.

/** Accepted inputs: whole years 18–100, a measured maximum of 120–230 bpm, a resting heart rate of 30–110 bpm. */
export const HR_LIMITS = {
  age: { min: 18, max: 100 },
  maxHr: { min: 120, max: 230 },
  restingHr: { min: 30, max: 110 },
} as const;

/**
 * Tanaka, Monahan & Seals 2001: HRmax = 208 − 0.7 × age, unrounded. Worked in tenths, (2080 − 7 × age) / 10, so a
 * half (age 35 → 183.5) is exact and never drifts below .5 before rounding.
 */
export const tanakaMaxHr = (age: number) => (2080 - 7 * age) / 10;

/** The older rule of thumb (Fox et al. 1971): HRmax = 220 − age. */
export const foxMaxHr = (age: number) => 220 - age;

/** Whole beats per minute, halves up: what a heart rate monitor shows. */
export const roundBpm = (bpm: number) => Math.round(bpm);

/** Maximum heart rate estimated from age: Tanaka, rounded to a whole bpm. Null outside 18–100 whole years. */
export function estimateMaxHr(age: number): number | null {
  if (!Number.isInteger(age) || age < HR_LIMITS.age.min || age > HR_LIMITS.age.max) return null;
  return roundBpm(tanakaMaxHr(age));
}

/** The five zones: whole-percent edges of the maximum (or of the reserve), named in words. */
export const ZONES = [
  { zone: 1, label: "Very light", from: 50, to: 60 },
  { zone: 2, label: "Light", from: 60, to: 70 },
  { zone: 3, label: "Moderate", from: 70, to: 80 },
  { zone: 4, label: "Hard", from: 80, to: 90 },
  { zone: 5, label: "Maximum", from: 90, to: 100 },
] as const;

export type ZoneMethod = "max" | "reserve";

export type Zone = {
  zone: number;
  label: string;
  /** Percent of the maximum (or reserve) at each end. */
  from: number;
  to: number;
  /** Whole bpm, inclusive at both ends. Each zone ends 1 bpm below where the next begins. */
  low: number;
  high: number;
};

export type ZoneSet = {
  method: ZoneMethod;
  maxHr: number;
  restingHr: number | null;
  /** maxHr − restingHr; null for the percent-of-maximum method. */
  reserve: number | null;
  zones: Zone[];
};

/**
 * The heart rate at `percent` (a whole number) of the maximum, or with a resting rate, Karvonen's
 * resting + percent × (maximum − resting), rounded to a whole bpm. Integer arithmetic until the last division keeps
 * halves exact (175 × 70 / 100 = 122.5 → 123, where 175 × 0.7 is 122.49999…).
 */
export function zoneEdge(maxHr: number, percent: number, restingHr: number | null = null): number {
  if (restingHr === null) return roundBpm((maxHr * percent) / 100);
  return roundBpm(restingHr + ((maxHr - restingHr) * percent) / 100);
}

/**
 * The five zones for a maximum (and an optional resting) heart rate, in whole bpm. Edges are rounded first; each
 * zone runs from its lower edge to 1 bpm below the next zone's, and zone 5 ends at the maximum, so no reading falls
 * in two zones. Null when the inputs are not positive numbers, the resting rate is not below the maximum, or the
 * range (maximum, or reserve) is under 10 bpm, where a 10 % zone would be narrower than 1 bpm.
 */
export function heartRateZones(maxHr: number, restingHr: number | null = null): ZoneSet | null {
  if (!Number.isFinite(maxHr) || maxHr <= 0) return null;
  if (restingHr !== null && (!Number.isFinite(restingHr) || restingHr <= 0 || restingHr >= maxHr)) return null;
  const range = restingHr === null ? maxHr : maxHr - restingHr;
  if (range < 10) return null;
  const zones = ZONES.map((z, i) => ({
    zone: z.zone,
    label: z.label,
    from: z.from,
    to: z.to,
    low: zoneEdge(maxHr, z.from, restingHr),
    high: i === ZONES.length - 1 ? zoneEdge(maxHr, z.to, restingHr) : zoneEdge(maxHr, z.to, restingHr) - 1,
  }));
  return {
    method: restingHr === null ? "max" : "reserve",
    maxHr,
    restingHr,
    reserve: restingHr === null ? null : maxHr - restingHr,
    zones,
  };
}

/** Ages in the page's zones-by-age table: 20 to 70 in five-year steps. */
export const ZONE_TABLE_AGES: readonly number[] = Array.from({ length: 11 }, (_, i) => 20 + 5 * i);

export type ZonesByAgeRow = { age: number; maxHr: number; zones: Zone[] };

/**
 * The five zones by age for the page's reference table: the Tanaka maximum rounded to a whole bpm (`estimateMaxHr`)
 * and the zones as percent of that maximum (`heartRateZones` with no resting rate), one row per age. An age the
 * estimate does not cover (outside 18 to 100) is left out rather than guessed.
 */
export function zonesByAge(ages: readonly number[] = ZONE_TABLE_AGES): ZonesByAgeRow[] {
  const rows: ZonesByAgeRow[] = [];
  for (const age of ages) {
    const maxHr = estimateMaxHr(age);
    const set = maxHr === null ? null : heartRateZones(maxHr);
    if (maxHr !== null && set) rows.push({ age, maxHr, zones: set.zones });
  }
  return rows;
}
