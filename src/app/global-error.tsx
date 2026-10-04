"use client"; // Error boundaries must be Client Components.

import { useEffect, useLayoutEffect } from "react";
import { InlineScript } from "@/components/inline-script";
import { Wordmark } from "@/components/wordmark";
import { site } from "@/content/site";
import { fontPreloads } from "@/fonts";
import { appearanceScript, applyAppearance, storedAppearance } from "@/vector/appearance";
import { NativeButton, NativeLinkButton } from "@/vector/button-native";
import { SystemState } from "@/vector/system-state";
import "./globals.css";

/**
 * An error in the root layout itself. It replaces the whole document, so it brings its own <html>, fonts, kit
 * styles and appearance (the head script on a server render; the stored choice applied before paint when it
 * renders in the browser, where the layout's <html> attribute is gone). The kit error SystemState (§5.7) under the
 * wordmark, with a secondary Retry and the way home. Like error.tsx it is loaded by every page, so it imports leaf
 * kit modules and the native button and link only; of `site` it reads the family name alone (the origin is a
 * server value and is not used here).
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  useLayoutEffect(() => {
    applyAppearance(storedAppearance());
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {fontPreloads.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <InlineScript html={appearanceScript} />
        <title>{`Error · ${site.family}`}</title>
      </head>
      <body className="flex min-h-dvh flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-data items-center px-gutter">
            <Wordmark />
          </div>
        </header>
        <main className="mx-auto w-full max-w-data px-gutter py-16 md:py-24">
          <SystemState
            kind="error"
            code="Error"
            meta={error.digest}
            title="This page did not load"
            titleLevel={1}
            message="Something failed while the site was drawn. Retry it, or start again from the home page."
            actions={
              <>
                <NativeButton variant="secondary" onClick={retry}>
                  Retry
                </NativeButton>
                <NativeLinkButton href="/" forward>
                  Go to home page
                </NativeLinkButton>
              </>
            }
          />
        </main>
      </body>
    </html>
  );
}
