import type { Metadata } from "next";
import { FreeCalculators } from "@/components/home/calculators";
import { Faq } from "@/components/home/faq";
import { HomeHero } from "@/components/home/hero";
import { OwnershipModels } from "@/components/home/models";
import { OmegaFytSection } from "@/components/home/omegafyt";
import { Principles } from "@/components/home/principles";
import { VectorSeries } from "@/components/home/vector-series";
import { site } from "@/content/site";

// The site default title, without the "· Vector" template the other pages get.
export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/" },
};

/**
 * The home page sells the family and the two ways to buy it: the hero (the page's one primary action, Compare
 * plans), the two models fact for fact, the four one-time apps, OmegaFyt, the free calculators, the principles they
 * share, then common questions.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <OwnershipModels />
      <VectorSeries />
      <OmegaFytSection />
      <FreeCalculators />
      <Principles />
      <Faq />
    </>
  );
}
