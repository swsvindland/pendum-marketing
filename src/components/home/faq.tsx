import { Section } from "@/components/page";
import { JsonLd } from "@/components/site/json-ld";
import { toDisclosureItems } from "@/components/site/questions";
import { homeQuestions } from "@/content/faq";
import { faqPage } from "@/content/structured-data";
import { LinkButton } from "@/vector";
import { Disclosures } from "@/vector/disclosure";

/**
 * The site's common questions (src/content/faq.ts) as native disclosures on the canvas between 1pt rules, with the
 * same strings as FAQPage structured data. Anything else is one link away on the support page.
 */
export function Faq() {
  if (!homeQuestions.length) return null;
  return (
    <Section
      id="faq"
      bordered
      eyebrow="Help / Apps and calculators"
      title="Common questions"
      action={
        <LinkButton href="/support" forward>
          Open support
        </LinkButton>
      }
    >
      <JsonLd data={faqPage(homeQuestions)} />
      <Disclosures look="plain" className="max-w-form" items={toDisclosureItems(homeQuestions)} />
    </Section>
  );
}
