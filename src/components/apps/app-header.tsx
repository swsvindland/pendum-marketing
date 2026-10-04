import { GetApp, ModelStatus } from "@/components/get-app";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { Specimen } from "@/components/specimen";
import { breadcrumbList } from "@/content/structured-data";
import type { App } from "@/content/types";
import { AppIcon, Heading, Meta, Note, Text, cn } from "@/vector";

/**
 * The trust strip under the store links (CRO-09): what is verifiable about the app today, from the content. A
 * one-time purchase app states its trial, if any, and its privacy facts; a released app states where it is listed,
 * the public build and its trial.
 * Never a rating, a download count or a quote.
 */
function trustFacts(app: App): string[] {
  const trial = app.trial ? `${app.trial.days}-day free trial` : "";
  if (app.model === "purchase") return [trial, "No account", "No analytics", "Records on your phone"].filter(Boolean);
  const listed = app.stores.state === "live" && app.stores.appStore && app.stores.googlePlay;
  return [
    listed ? "In the App Store and on Google Play" : "",
    app.version ? `Version ${app.version}` : "",
    trial ? `${trial} on the yearly plan` : "",
  ].filter(Boolean);
}

/**
 * The app page header, on the PageHeader grid: the breadcrumb trail, the icon, the name as the page's h1, the
 * tagline as the lead, the one-sentence definition, how it is sold and where it runs, the store links (GetApp is
 * `primary`, so the first live link is the page's one primary action), the trust strip and any note a buyer should
 * read first (`note` in src/content/apps.ts, CRO-12: one fact beside the caveat it restates). The aside is the app's specimen with the page's one signal meter (§2.4); the panel's own marker says
 * it is an example, and the caption says the numbers are not a claim.
 */
export function AppHeader({ app }: { app: App }) {
  const specimen = app.specimen.hero.value ? app.specimen : null;
  const note = app.note;
  return (
    <header className="border-b border-border">
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: "Apps", href: "/apps" }, { name: app.name }])} />
      <div
        className={cn(
          "mx-auto grid max-w-data gap-10 px-gutter py-10 md:py-12",
          specimen && "lg:grid-cols-[1.15fr_1fr] lg:items-center"
        )}
      >
        <div className="flex flex-col gap-4">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/apps", label: "Apps" },
            ]}
          />
          {/* Decorative: the name is the h1 right below it. */}
          <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={80} priority />
          <Heading level={1} variant="display" className="max-w-[22ch]">
            {app.name}
          </Heading>
          {app.tagline ? (
            <Text variant="lead" className="max-w-[60ch] text-pretty">
              {app.tagline}
            </Text>
          ) : null}
          <Text tone="secondary" className="max-w-[60ch] text-pretty">
            {app.definition ?? app.summary}
          </Text>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <ModelStatus app={app} />
            {app.platforms.length ? (
              <>
                <span className="sr-only">Platforms</span>
                <Meta items={app.platforms} />
              </>
            ) : null}
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <GetApp app={app} primary />
            <Meta tone="default" items={trustFacts(app)} />
            {note ? <Note className="max-w-[60ch] text-pretty">{note}</Note> : null}
          </div>
        </div>
        {specimen ? (
          <figure className="flex min-w-0 flex-col gap-2">
            <Specimen data={specimen} signal />
            <figcaption>
              <Text variant="caption" tone="muted" as="span">
                Values are illustrative.
              </Text>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </header>
  );
}
