import type { Metadata } from "next";
import { Chooser } from "@/components/apps/chooser";
import { AppsGrid } from "@/components/home/apps-grid";
import { FreeCalculators } from "@/components/home/calculators";
import { Faq } from "@/components/home/faq";
import { HomeHero } from "@/components/home/hero";
import { Principles } from "@/components/home/principles";
import { pageMetadata } from "@/components/site/metadata";
import { site } from "@/content/site";

// The site title as given, without the "· Vector" template the other pages get; the shared card and og:url for "/".
export const metadata: Metadata = pageMetadata({
  title: site.title,
  absolute: true,
  description: site.description,
  path: "/",
});

/**
 * The home page sells the apps in the order a visitor decides: the hero (what they do, how they are bought, the
 * page's one primary action), the chooser (which app is for you), the five apps, the free calculators, the
 * principles they share, then common questions.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <Chooser />
      <AppsGrid />
      <FreeCalculators />
      <Principles />
      <Faq />
    </>
  );
}
