import type { Metadata, Viewport } from "next";
import { InlineScript } from "@/components/inline-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import { fontVariables } from "@/fonts";
import { appearanceScript } from "@/vector/appearance";
import { VectorProvider } from "@/vector/provider";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <InlineScript html={appearanceScript} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <VectorProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-control bg-surface type-button text-tint focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:inline-flex focus:min-h-11 focus:items-center focus:border focus:border-border-strong focus:px-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <SiteFooter />
        </VectorProvider>
      </body>
    </html>
  );
}
