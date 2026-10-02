import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { appearanceScript } from "@/components/appearance";
import { InlineScript } from "@/components/inline-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import "./globals.css";

// The kit's two bundled faces (design-system §3.1): Inter (variable, 400/500/600) and IBM Plex Mono Regular.
const inter = localFont({
  src: "../fonts/Inter.ttf",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
const plexMono = localFont({
  src: "../fonts/IBMPlexMono-Regular.ttf",
  variable: "--font-plex-mono",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, title: site.title, description: site.description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#071017" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={appearanceScript} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-surface px-4 py-3 type-button text-tint focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:border focus:border-border-strong"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
