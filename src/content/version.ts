import type { App, Feature } from "./types";

/**
 * Version gating, shared by the content and the structured-data builders. It lives here rather than in
 * structured-data.ts (which imports apps.ts) so apps.ts can gate its own statements, such as Pendum One's analytics
 * sentence, on `version` without a circular import.
 */

/** Compares two dotted version strings numerically ("1.10.0" is newer than "1.9.0"). */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
}

/**
 * Whether a feature is in the public build. A feature without `since` always is. One with `since` is shipped only
 * when the app has a `version` that is the same or newer: with no public version there is no build to check it
 * against, so it stays unclaimed (nothing from a fact sheet's notYetShipped is claimed).
 */
export function isShipped(feature: Pick<Feature, "since">, app: Pick<App, "version">): boolean {
  if (!feature.since) return true;
  if (!app.version) return false;
  return compareVersions(feature.since, app.version) <= 0;
}
