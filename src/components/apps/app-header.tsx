import { GetApp, ModelStatus } from "@/components/get-app";
import { Specimen } from "@/components/specimen";
import type { App } from "@/content/types";
import { AppIcon, Heading, Label, Meta, Text, cn } from "@/vector";

/**
 * The app page header, on the PageHeader grid: icon, eyebrow, the name as the page's h1, tagline, summary, how it
 * is sold and where it runs, then the store links. GetApp is `primary`, so the first live store link is the page's
 * one primary action. The aside is the app's specimen with the page's one signal meter (§2.4), captioned as an
 * example so the readout never reads as a claim.
 */
export function AppHeader({ app }: { app: App }) {
  const specimen = app.specimen.hero.value ? app.specimen : null;
  return (
    <header className="border-b border-border">
      <div
        className={cn(
          "mx-auto grid max-w-data gap-10 px-gutter py-10 md:py-12",
          specimen && "lg:grid-cols-[1.15fr_1fr] lg:items-center"
        )}
      >
        <div className="flex flex-col gap-4">
          {/* Decorative: the name is the h1 right below it. */}
          <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={80} priority />
          <div className="flex flex-col gap-2">
            <Label>{app.model === "purchase" ? "App / Offline" : "App / Synced"}</Label>
            <Heading level={1} variant="display" className="max-w-[22ch]">
              {app.name}
            </Heading>
          </div>
          {app.tagline ? (
            <Text variant="lead" className="max-w-[60ch] text-pretty">
              {app.tagline}
            </Text>
          ) : null}
          {app.summary ? (
            <Text tone="secondary" className="max-w-[60ch] text-pretty">
              {app.summary}
            </Text>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ModelStatus app={app} />
            {app.platforms.length ? (
              <>
                <span className="sr-only">Platforms</span>
                <Meta items={app.platforms} />
              </>
            ) : null}
          </div>
          <div className="mt-2">
            <GetApp app={app} primary />
          </div>
        </div>
        {specimen ? (
          <figure className="flex min-w-0 flex-col gap-2">
            <Specimen data={specimen} signal />
            <figcaption>
              <Text variant="caption" tone="muted" as="span">
                Example readout. The values are illustrative.
              </Text>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </header>
  );
}
