import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppDetails } from "@/components/apps/app-details";
import { AppFaq } from "@/components/apps/app-faq";
import { AppHeader } from "@/components/apps/app-header";
import { AppJsonLd } from "@/components/apps/app-json-ld";
import { AppPrivacy } from "@/components/apps/app-privacy";
import { AppRelated } from "@/components/apps/app-related";
import { AtAGlance } from "@/components/apps/at-a-glance";
import { FeatureGrid } from "@/components/apps/feature-grid";
import { appOgImage, hasWatch } from "@/components/apps/model";
import { Section } from "@/components/page";
import { appMetadata } from "@/components/site/metadata";
import { apps, getApp } from "@/content/apps";
import { shipped } from "@/content/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return {};
  return appMetadata(app, { image: appOgImage(app) });
}

/**
 * One app: header with the store links and the specimen, the facts at a glance, what it does, what it works with,
 * where it keeps records, common questions, the caveats, then the calculators and the other apps. Features and
 * integrations are filtered to what the public build ships (`shipped`), so a `since` newer than `version` is never
 * claimed. Section ids are stable anchors other pages and search can target.
 */
export default async function AppPage({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();
  const features = shipped(app.features, app);
  const integrations = shipped(app.integrations, app);
  return (
    <>
      <AppJsonLd app={app} />
      <AppHeader app={app} />
      <AtAGlance app={app} />

      {/* No eyebrow on Features: "Features" over "What it does" would only restate the heading (§10). */}
      {features.length ? (
        <Section id="features" title="What it does" intro={app.summary} bordered>
          <FeatureGrid items={features} fallbackIcon={app.glyph} />
        </Section>
      ) : null}

      {integrations.length ? (
        <Section
          id="works-with"
          eyebrow="Device / Integrations"
          title={hasWatch(app) ? "Works with your phone and watch" : "Works with your phone"}
          bordered
        >
          <FeatureGrid items={integrations} fallbackIcon="phone" />
        </Section>
      ) : null}

      <AppPrivacy app={app} />
      <AppFaq app={app} />
      <AppDetails app={app} />
      <AppRelated app={app} />
    </>
  );
}
