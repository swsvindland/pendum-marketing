import type { Metadata } from "next";
import { PageHeader } from "@/components/page";
import { Group } from "@/components/site/group";
import { JsonLd } from "@/components/site/json-ld";
import { pageMetadata } from "@/components/site/metadata";
import { toDisclosureItems } from "@/components/site/questions";
import { apps, seriesNames } from "@/content/apps";
import { supportGroups } from "@/content/faq";
import { site } from "@/content/site";
import { breadcrumbList, faqPage } from "@/content/structured-data";
import { ButtonLink, LinkButton, Panel, Text } from "@/vector";
import { Disclosures } from "@/vector/disclosure";

/** "Pendum One" */
const subscriptionNames = seriesNames(apps.filter((a) => a.model === "subscription"));

// What the page covers. "How to reach us" is promised only once the owner sets a support address.
const topics = `health sync, backups, reminders, ${subscriptionNames} accounts and the calculators`;
const email = site.supportEmail;

/** Names the products and what the page answers (SEO-12), under 160 characters. */
const description = `Support for ${subscriptionNames} and ${site.series.sentence}: health sync, backups, reminders, accounts and the free calculators.`;

export const metadata: Metadata = pageMetadata({ title: "Support", description, path: "/support" });

/** Every support question, for one FAQPage over the whole page. */
const questions = supportGroups.flatMap((g) => g.items);

/**
 * How to get help: the support address once the owner sets one, then the answers from src/content/faq.ts, grouped
 * as the content groups them, as native disclosures. Each answer says what happens, then what to do (§10). While
 * no address is set the page leads with the answers rather than with an empty contact panel, and promises nothing
 * about an address. The publisher is one link away (/about) for anyone asking who makes the apps.
 */
export default function SupportPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: "Support" }])} />
      <JsonLd data={faqPage(questions)} />
      <PageHeader
        eyebrow="Help / Apps and calculators"
        crumbs={[{ href: "/", label: "Home" }]}
        title="Support"
        subtitle={email ? `How to reach support, and answers about ${topics}.` : `Answers about ${topics}.`}
        actions={
          <>
            <LinkButton href="/about" forward>
              Who makes the apps
            </LinkButton>
            <LinkButton href="/privacy" forward>
              Read the privacy summary
            </LinkButton>
          </>
        }
      />
      <div className="mx-auto flex w-full max-w-data flex-col px-gutter py-10 md:py-12">
        {email ? (
          <Group id="contact" title="Contact" intro="Say which app you use, and on which phone and system version.">
            <Panel>
              {/* The group heading names the panel, so the eyebrow stays plain. */}
              <Panel.Header eyebrow="Support / Email" heading={false} />
              <Panel.Body>
                <Text>
                  Write to <span className="[overflow-wrap:anywhere]">{email}</span>.
                </Text>
                <div>
                  <ButtonLink href={`mailto:${email}`} variant="primary">
                    Email support
                  </ButtonLink>
                </div>
              </Panel.Body>
            </Panel>
          </Group>
        ) : null}
        {supportGroups.map((g) => (
          <Group key={g.id} id={g.id} title={g.title} intro={g.intro}>
            <Disclosures items={toDisclosureItems(g.items)} />
          </Group>
        ))}
      </div>
    </>
  );
}
