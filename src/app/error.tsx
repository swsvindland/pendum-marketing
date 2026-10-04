"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { NativeButton, NativeLinkButton } from "@/vector/button-native";
import { SystemState } from "@/vector/system-state";

/**
 * A runtime error in a page, inside the root layout (header and footer stay): an error SystemState (§5.7) in the
 * not-found page's place. The code as a Label with the error ID in mono when Next gives one (it matches the server
 * log), the fact as the h1, the message as ErrorText, then a secondary Retry (Next 16 `retry`: fetch and render the
 * segment again) and the way home. This boundary belongs to the root segment, so every page loads it: it imports
 * leaf kit modules and the native button and link, never the barrel (whose LinkButton and ListRow carry the icon
 * table) or HeroUI.
 */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-data px-gutter py-16 md:py-24">
      <SystemState
        kind="error"
        code="Error"
        meta={error.digest}
        title="This page did not load"
        titleLevel={1}
        message="Something failed while the page was drawn. Retry it, or start again from the home page."
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
    </div>
  );
}
