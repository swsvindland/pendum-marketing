import type { Metadata } from "next";
import { pageMetadata } from "@/components/site/metadata";
import { notFound } from "next/navigation";
import { calculatorPages } from "@/calculators/registry";
import { calculators, getCalculator } from "@/content/calculators";

export const dynamicParams = false;

export function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/calculators/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCalculator(slug);
  if (!meta) return {};
  return pageMetadata({
    title: meta.title,
    description: `${meta.description} Free, no sign-up, nothing stored.`,
    path: `/calculators/${meta.slug}`,
  });
}

export default async function CalculatorPage({ params }: PageProps<"/calculators/[slug]">) {
  const { slug } = await params;
  const meta = getCalculator(slug);
  const Page = calculatorPages[slug];
  if (!meta || !Page) notFound();
  return <Page meta={meta} />;
}
