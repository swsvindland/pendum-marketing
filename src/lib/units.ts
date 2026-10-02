// Unit conversions and number handling shared by every calculator. Pure, no DOM, unit-tested.
// Canonical units inside the math are kg, cm, mL and years, as in the apps (canonical kg/cm, display units only
// change what is shown).

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;
export const ML_PER_FL_OZ = 29.5735295625;

export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const inToCm = (inches: number) => inches * CM_PER_IN;
export const cmToIn = (cm: number) => cm / CM_PER_IN;
export const ftInToCm = (ft: number, inches: number) => inToCm(ft * 12 + inches);
export const mlToFlOz = (ml: number) => ml / ML_PER_FL_OZ;

/** Whole feet and remaining inches (rounded to `digits`) for a height in cm. 182.9 cm → { ft: 6, in: 0 }. */
export function cmToFtIn(cm: number, digits = 0): { ft: number; in: number } {
  const total = Number(cmToIn(cm).toFixed(digits));
  let ft = Math.floor(total / 12);
  let inches = Number((total - ft * 12).toFixed(digits));
  if (inches >= 12) {
    ft += 1;
    inches -= 12;
  }
  return { ft, in: inches };
}

/**
 * Parse what a visitor typed: accepts "72.5", "72,5", " 1,234.5 " and the typographic minus. Returns null for
 * empty or non-numeric input (never NaN), so callers can tell "not entered" from a value.
 */
export function parseNumber(input: string): number | null {
  let s = input.trim().replace(/−/g, "-").replace(/[\s  ']/g, "");
  if (!s) return null;
  // Commas before groups of three digits group thousands ("1,234", "1,234.5"); a lone comma otherwise is a
  // decimal comma ("72,5").
  if (/^-?\d{1,3}(,\d{3})+(\.\d*)?$/.test(s)) s = s.replace(/,/g, "");
  else if (/^-?\d*,\d+$/.test(s)) s = s.replace(",", ".");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Field validation: null when the text is empty, a number within [min, max], or an error message. */
export type Parsed = { value: number | null; error: string | null };

export function parseInRange(input: string, min: number, max: number, message: string): Parsed {
  if (!input.trim()) return { value: null, error: null };
  const n = parseNumber(input);
  if (n === null || n < min || n > max) return { value: null, error: message };
  return { value: n, error: null };
}

// The site is English; formatting is pinned to en-US so server and browser render the same digits.
const formatters = new Map<string, Intl.NumberFormat>();
function formatter(min: number, max: number) {
  const key = `${min}:${max}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { minimumFractionDigits: min, maximumFractionDigits: max });
    formatters.set(key, f);
  }
  return f;
}

/** A display number with grouping and a typographic minus (U+2212), as the kit's format does. */
export function formatNumber(n: number, digits = 0, minDigits = digits): string {
  const s = formatter(minDigits, digits).format(n);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
}

/** A signed change: "+0.5", "−0.3", "0". */
export function formatSigned(n: number, digits = 0): string {
  const rounded = Number(n.toFixed(digits));
  if (rounded === 0) return formatNumber(0, digits);
  return rounded > 0 ? `+${formatNumber(rounded, digits)}` : formatNumber(rounded, digits);
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
