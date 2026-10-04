/**
 * "A, B and C": the one list format for site copy. The site's lists take no serial comma, so en-GB rather than
 * en-US. Hand-written lists in the copy follow the same rule. It lives with the content, which names the apps with
 * it (apps.ts, structured-data.ts); page code imports it from @/content/format too.
 */
export const listFormat = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" });

/** The first letter capitalized, for a sentence that opens with a content string ("the Pendum apps" → "The…"). */
export const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The first letter lowercased, for a sentence folded in after a name or a colon ("None in…" → "Pendum One: none in…"). */
export const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
