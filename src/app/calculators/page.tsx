import type { Metadata } from "next";
import { PageHeader } from "@/components/page";
import { Group } from "@/components/site/group";
import { JsonLd } from "@/components/site/json-ld";
import { FactList } from "@/components/site/lists";
import { metaDescription, pageMetadata } from "@/components/site/metadata";
import { getApp } from "@/content/apps";
import { calculators, categoryLabel, categoryOrder } from "@/content/calculators";
import { breadcrumbList, calculatorListItems, itemList } from "@/content/structured-data";
import type { App } from "@/content/types";
import { LinkButton, ListRow, Panel, RowList, Value } from "@/vector";

const TITLE = "Fitness calculators";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  // Search results show about 160 characters; the helper cuts at a boundary should the sentence ever grow past it.
  description: metaDescription(
    "Free fitness calculators: BMI, body fat, TDEE, macros, one-rep max, water, heart rate zones and more. No sign-up, and nothing you type is sent anywhere."
  ),
  path: "/calculators",
});

const count = new Intl.NumberFormat("en");

/**
 * Every calculator, grouped by category in the content's order, each group linking the app that tracks it over
 * time. The page emits the list as an ItemList and its breadcrumb (Home, then this page).
 */
export default function CalculatorsPage() {
  const groups = categoryOrder
    .map((category) => {
      const items = calculators.filter((c) => c.category === category);
      // The apps that track this group over time, in first-seen order and without repeats.
      const tracked = [...new Set(items.flatMap((c) => (c.app ? [c.app] : [])))]
        .map((slug) => getApp(slug))
        .filter((a): a is App => Boolean(a));
      return { category, items, tracked };
    })
    .filter((g) => g.items.length > 0);

  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: TITLE }])} />
      <JsonLd data={itemList(TITLE, calculatorListItems(calculators))} />
      <PageHeader
        eyebrow="Tools / Browser"
        crumbs={[{ href: "/", label: "Home" }]}
        title={TITLE}
        subtitle="Estimates for body composition, nutrition, strength, hydration and heart rate. Free, with no sign-up. Nothing you type is sent anywhere."
      />
      <div className="mx-auto flex w-full max-w-data flex-col px-gutter py-10 md:py-12">
        {groups.map(({ category, items, tracked }) => (
          <Group
            key={category}
            id={category}
            title={categoryLabel[category]}
            meta={
              <Value
                value={count.format(items.length)}
                unit={items.length === 1 ? "calculator" : "calculators"}
                size="xs"
                tone="muted"
              />
            }
            footnote={
              tracked.length
                ? tracked.map((app) => (
                    <LinkButton key={app.slug} href={`/apps/${app.slug}`} forward>
                      Track it over time in {app.name}
                    </LinkButton>
                  ))
                : undefined
            }
          >
            <Panel inset="none">
              <RowList aria-label={categoryLabel[category]}>
                {items.map((c) => (
                  <ListRow
                    key={c.slug}
                    title={c.title}
                    description={c.description}
                    icon={c.icon}
                    href={`/calculators/${c.slug}`}
                  />
                ))}
              </RowList>
            </Panel>
          </Group>
        ))}
        <Group
          id="how"
          title="How they work"
          footnote={
            <LinkButton href="/privacy" forward>
              Read the privacy summary
            </LinkButton>
          }
        >
          <Panel>
            <FactList
              items={[
                "Every calculator runs in your browser. Nothing you type is stored or sent anywhere.",
                "Your unit choice, metric or imperial, is remembered in this browser only.",
                "Results are general estimates, not medical advice. Each page shows its method and sources.",
              ]}
            />
          </Panel>
        </Group>
      </div>
    </>
  );
}
