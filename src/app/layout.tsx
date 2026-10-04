import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { InlineScript } from "@/components/inline-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteJsonLd } from "@/components/site/json-ld";
import { site } from "@/content/site";
import { fontPreloads } from "@/fonts";
import { appearanceScript } from "@/vector/appearance";
import "./globals.css";

/**
 * Vercel Web Analytics counts page views without cookies (the privacy page says what it records). It loads its
 * script from a path only Vercel serves, so it renders only in a build made on Vercel, where `VERCEL` is "1": a
 * local or other-host build has no 404ing script, and `pnpm lighthouse` measures the site without it. Never send
 * it anything typed into the site: no custom events with values, and no calculator inputs in page addresses.
 */
const onVercel = process.env.VERCEL === "1";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, title: site.title, description: site.description },
  twitter: { card: "summary_large_image" },
  // A build with no real origin (site.ts falls back to localhost) is never indexed.
  ...(site.indexable ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#071017" },
  ],
};

/**
 * The root layout carries no client provider: the header, footer and error boundaries are native or server parts,
 * so a page ships React Aria only where it renders a HeroUI input (the calculators mount VectorProvider around
 * their tool). The two font files are preloaded here (their @font-face rules are in the one stylesheet,
 * globals.css); `crossOrigin` matches the CORS mode fonts are fetched with, so the preload is the fetch. `main`
 * takes focus from the skip link in every browser (tabIndex -1, no ring on that programmatic focus).
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {fontPreloads.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <InlineScript html={appearanceScript} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteJsonLd />
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-surface type-button text-tint focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:inline-flex focus:min-h-11 focus:items-center focus:border focus:border-border-strong focus:px-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
        <SiteFooter />
        {onVercel ? <Analytics /> : null}
      </body>
    </html>
  );
}
