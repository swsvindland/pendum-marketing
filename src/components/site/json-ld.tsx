import { siteGraph } from "@/content/structured-data";

/**
 * JSON-LD on a page, rendered as a plain script tag (Next's JSON-LD guide). `<` is escaped so a string in the
 * content can never close the tag. Builders live in src/content/structured-data.ts so the markup never drifts
 * from the content it describes.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** The site graph (Organization and WebSite, with the `@id`s every page's markup references) for the root layout. */
export function SiteJsonLd() {
  return <JsonLd data={siteGraph()} />;
}
