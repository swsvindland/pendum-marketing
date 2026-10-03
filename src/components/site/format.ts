/**
 * "A, B and C": the one list format for site copy. The site's lists take no serial comma, so en-GB rather than
 * en-US. Hand-written lists in the copy follow the same rule.
 */
export const listFormat = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" });
