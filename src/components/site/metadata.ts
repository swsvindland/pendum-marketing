import type { Metadata } from "next";
import { site } from "@/content/site";

/** The shared Open Graph card drawn by app/opengraph-image.tsx. */
export const ogCard = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Vector: fitness apps, precise by design. A subscription app, one-time purchase apps and free calculators.",
} as const;

/**
 * Metadata for a page that keeps the shared card. A page that sets `openGraph` replaces the root's whole object,
 * which drops the file-based card, the site name and the type, so pages build theirs here.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** The page name; the layout's template adds " · Vector" to <title>. */
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${title} · ${site.name}`,
      description,
      url: path,
      images: [ogCard],
    },
    twitter: { card: "summary_large_image", images: [ogCard] },
  };
}
