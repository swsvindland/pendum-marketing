import type { Metadata } from "next";
import { Heading, Label, LinkButton, Text } from "@/vector";

export const metadata: Metadata = { title: "Page not found" };

/**
 * The 404, as a SystemState (§5.7): start-aligned on the data column at form width, no illustration. The code as
 * a Label, the fact as the page's h1, what to do in body, then the ways out. Next adds noindex to 404 responses.
 */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-data px-gutter py-16 md:py-24">
      <div className="flex max-w-form flex-col items-start gap-3">
        <Label>Not found</Label>
        <Heading level={1} variant="h1">
          This page does not exist
        </Heading>
        <Text tone="secondary" className="text-pretty">
          The address may be mistyped, or the page may have moved. Start again from the home page or the
          calculators.
        </Text>
        <nav aria-label="Ways out" className="mt-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <LinkButton href="/" forward>
                Go to home page
              </LinkButton>
            </li>
            <li>
              <LinkButton href="/calculators" forward>
                Open calculators
              </LinkButton>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
