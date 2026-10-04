import { JsonLd } from "@/components/site/json-ld";
import { toDisclosureItems } from "@/components/site/questions";
import { billingQuestions } from "@/content/faq";
import { faqPage } from "@/content/structured-data";
import { Disclosures } from "@/vector/disclosure";

/**
 * The billing questions from src/content/faq.ts as kit disclosure rows (native details/summary) in one bordered
 * panel, with FAQPage markup built from the same strings, so the two can never differ.
 */
export function BillingFaq() {
  return (
    <>
      <JsonLd data={faqPage(billingQuestions)} />
      <Disclosures items={toDisclosureItems(billingQuestions)} className="max-w-form" />
    </>
  );
}
