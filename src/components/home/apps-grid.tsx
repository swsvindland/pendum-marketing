import { AppCards } from "@/components/apps/app-card";
import { preorderSentence } from "@/components/apps/model";
import { Section } from "@/components/page";
import { apps, seriesNames } from "@/content/apps";
import { sentenceCase } from "@/content/format";
import { site } from "@/content/site";

/**
 * The five apps as one grid (VQ-01): the subscription app wide across the row with its store links, then the four
 * Pendum apps, on the same cards as /apps, kept short here. The section says the two models once; the hero made
 * the case. The page's one primary action is in the hero, so the store links here are secondary. The pre-order
 * sentence names only the stores whose pre-order links exist (model.ts).
 */
export function AppsGrid() {
  if (!apps.length) return null;
  const subscriptionNames = seriesNames(apps.filter((a) => a.model === "subscription"));
  const preorder = preorderSentence(apps);

  return (
    <Section
      id="apps"
      bordered
      eyebrow={`Apps / ${subscriptionNames} and ${site.series.sentence}`}
      title="The apps"
      intro={`${subscriptionNames} is the subscription. ${sentenceCase(site.series.sentence)} are each a one-time purchase.${preorder ? ` ${preorder}` : ""}`}
    >
      <AppCards />
    </Section>
  );
}
