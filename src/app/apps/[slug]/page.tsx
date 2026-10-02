import type { Metadata } from "next";
import { pageMetadata } from "@/components/site/metadata";
import { notFound } from "next/navigation";
import { AppDetails } from "@/components/apps/app-details";
import { AppHeader } from "@/components/apps/app-header";
import { AppJsonLd } from "@/components/apps/app-json-ld";
import { AppPrivacy } from "@/components/apps/app-privacy";
import { AppRelated } from "@/components/apps/app-related";
import { FeatureGrid } from "@/components/apps/feature-grid";
import { hasWatch } from "@/components/apps/model";
import { Section } from "@/components/page";
import { apps, getApp } from "@/content/apps";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return {};
  const description = app.summary || app.tagline || site.description;
  return pageMetadata({ title: app.name, description, path: `/apps/${app.slug}` });
}

/**
 * One app: header with the store links and the specimen, what it does, what it works with, where it keeps
 * records, the spec sheet and its caveats, then the calculators and the rest of the series.
 */
export default async function AppPage({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();
  return (
    <>
      <AppJsonLd app={app} />
      <AppHeader app={app} />

      {app.features.length ? (
        <Section id="features" eyebrow={`${app.label} / Features`} title="What it does">
          <FeatureGrid items={app.features} fallbackIcon={app.glyph} />
        </Section>
      ) : null}

      {app.integrations.length ? (
        <Section
          id="integrations"
          eyebrow="Device / Integrations"
          title={hasWatch(app) ? "Works with your phone and watch" : "Works with your phone"}
          bordered
        >
          <FeatureGrid items={app.integrations} fallbackIcon="phone" />
        </Section>
      ) : null}

      <AppPrivacy app={app} />
      <AppDetails app={app} />
      <AppRelated app={app} />
    </>
  );
}
