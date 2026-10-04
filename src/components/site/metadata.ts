import type { Metadata } from "next";
import { site } from "@/content/site";
import type { App, CalculatorMeta } from "@/content/types";

/** An Open Graph image as Next's metadata takes it. */
export type OgImage = { url: string; width: number; height: number; alt: string };

/** The shared Open Graph card drawn by app/opengraph-image.tsx. */
export const ogCard: OgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.family}: fitness apps, precise by design. A subscription app, one-time purchase apps and free calculators.`,
};

/** The longest description search results show whole (about 155 to 160 characters). */
export const DESCRIPTION_MAX = 160;

/** Words a cut description must not end on: a conjunction, preposition or determiner left dangling. */
const DANGLING = new Set(
  "and or but nor so yet with for the a an of to that in on at by from into toward as its your their this these those which where while is are be".split(" ")
);
/** Conjunctions a cut may precede, the subordinating ones first: they leave a whole main clause behind. */
const SUBORDINATORS = ["that", "with", "which", "where", "while", "so"];
const COORDINATORS = ["and", "or", "but"];

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Drops dangling words and punctuation from the end of a cut, then closes it with a full stop. */
function close(fragment: string): string {
  let out = fragment.trim().replace(/[\s,;:.!?-]+$/, "");
  for (;;) {
    const last = out.match(/\s(\S+)$/);
    if (!last || !DANGLING.has(last[1].toLowerCase())) break;
    out = out.slice(0, last.index).replace(/[\s,;:]+$/, "");
  }
  return `${out}.`;
}

/**
 * A description cut to at most `max` characters without ending mid-thought. In order: at the last sentence end
 * that fits; at the last clause boundary (comma, semicolon or colon) past the midpoint, stepping back once when
 * it would leave a one- or two-word stub after a longer clause ("…for your gym, prescribes load"); before the last
 * subordinating, then coordinating, conjunction past the midpoint; else at the last word. A cut never ends on a
 * dangling word and is closed with a full stop. Whitespace is collapsed first; a description that fits is
 * returned as is.
 */
export function metaDescription(text: string, max = DESCRIPTION_MAX): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  for (let i = max - 1; i > 0; i--) {
    if (/[.!?]/.test(s[i]) && /\s/.test(s[i + 1])) return s.slice(0, i + 1);
  }
  const head = s.slice(0, max - 1); // one character is kept for the full stop
  const floor = max / 2;
  const marks = [...head.matchAll(/[,;:]/g)].map((m) => m.index ?? 0);
  for (let i = marks.length - 1; i >= 0 && marks[i] >= floor; i--) {
    const clauseStart = i > 0 ? marks[i - 1] + 1 : 0;
    const previousStart = i > 1 ? marks[i - 2] + 1 : 0;
    const stub = wordCount(head.slice(clauseStart, marks[i])) < 3;
    const afterLongClause = i > 0 && wordCount(head.slice(previousStart, marks[i - 1])) >= 3;
    if (!(stub && afterLongClause)) return close(head.slice(0, marks[i]));
  }
  for (const list of [SUBORDINATORS, COORDINATORS]) {
    const re = new RegExp(`\\s(?:${list.join("|")})\\s`, "gi");
    const cuts = [...head.matchAll(re)].map((m) => m.index ?? 0).filter((at) => at >= floor);
    if (cuts.length) return close(head.slice(0, cuts[cuts.length - 1]));
  }
  const space = head.lastIndexOf(" ");
  return close(space > 0 ? head.slice(0, space) : head);
}

/**
 * Metadata for a page that keeps the shared card. A page that sets `openGraph` replaces the root's whole object,
 * which drops the file-based card, the site name and the type, so pages build theirs here.
 */
export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
  image,
}: {
  /** The page name; the layout's template adds " · Vector" to <title> unless `absolute` is set. */
  title: string;
  description: string;
  path: string;
  /** Use the title as given, with no site suffix (app pages, whose titles already name the family). */
  absolute?: boolean;
  /** A card drawn for this page (a per-app opengraph-image route) in place of the shared one. */
  image?: OgImage;
}): Metadata {
  const card = image ?? ogCard;
  const fullTitle = absolute ? title : `${title} · ${site.name}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title: fullTitle,
      description,
      url: path,
      images: [card],
    },
    twitter: { card: "summary_large_image", images: [card] },
  };
}

/**
 * An app page's metadata: the category-bearing `seoTitle` as the whole <title> (it names the family already), and
 * the definition, cut to a snippet length, as the description. Until the content sets them, the name takes the
 * site template and the summary stands in for the definition.
 */
export function appMetadata(app: App, { image }: { image?: OgImage } = {}): Metadata {
  return pageMetadata({
    title: app.seoTitle ?? app.name,
    absolute: Boolean(app.seoTitle),
    description: metaDescription(app.definition ?? app.summary),
    path: `/apps/${app.slug}`,
    image,
  });
}

/**
 * A calculator page's metadata: the title (plus the words `titleSuffix` adds to <title> only), its list
 * description and what is true of every calculator. Units are remembered in this browser, so the line is about
 * what is typed, not "nothing stored".
 */
export function calculatorMetadata(meta: CalculatorMeta): Metadata {
  return pageMetadata({
    title: meta.titleSuffix ? `${meta.title} ${meta.titleSuffix}` : meta.title,
    description: metaDescription(`${meta.description} Free, with no sign-up. Nothing you type is sent anywhere.`),
    path: `/calculators/${meta.slug}`,
  });
}
