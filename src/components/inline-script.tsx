"use client";

/**
 * A script that runs while the HTML parses, before first paint (the appearance choice). A Client Component, so it
 * renders twice as the Next 16 guide intends (preventing flash before hydration): on the server as text/javascript,
 * which the browser runs, and in the browser as text/plain, so React never renders a script it would warn about.
 * suppressHydrationWarning covers the type difference. Pass a string from a server-safe module (never a value
 * exported from a "use client" file, which a Server Component receives as a client reference).
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
