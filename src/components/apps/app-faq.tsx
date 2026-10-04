import { Section } from "@/components/page";
import { JsonLd } from "@/components/site/json-ld";
import { toDisclosureItems } from "@/components/site/questions";
import { faqPage } from "@/content/structured-data";
import type { App } from "@/content/types";
import { Disclosures } from "@/vector/disclosure";

/**
 * The app's common questions, objections included (CRO-07, AI-SEARCH-02): native disclosures on the canvas, so
 * every answer is in the document, and the same strings as FAQPage structured data. Nothing is rendered for an app
 * without questions.
 */
export function AppFaq({ app }: { app: App }) {
  const questions = app.faq ?? [];
  if (!questions.length) return null;
  return (
    <Section id="questions" eyebrow={`Help / ${app.name}`} title="Common questions" bordered>
      <JsonLd data={faqPage(questions)} />
      <Disclosures look="plain" className="max-w-form" items={toDisclosureItems(questions)} />
    </Section>
  );
}
