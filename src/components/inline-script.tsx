/**
 * A script that runs while the HTML parses, before first paint (the appearance choice). It renders as
 * text/javascript on the server and text/plain in the browser, so React never sees a script to run on the client
 * and does not warn about one (Next 16 guide: preventing flash before hydration).
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
