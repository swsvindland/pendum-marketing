import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page";
import { Group } from "@/components/site/group";
import { FactList } from "@/components/site/lists";
import { pageMetadata } from "@/components/site/metadata";
import { getApp } from "@/content/apps";
import { calculators, categoryLabel, categoryOrder } from "@/content/calculators";
import type { App } from "@/content/types";
import { LinkButton, ListRow, Note, Panel, RowList, Value } from "@/vector";

export const metadata: Metadata = pageMetadata({
  title: "Fitness calculators",
  description:
    "Free calculators for body composition, nutrition, strength, hydration and heart rate: BMI, TDEE, macros, one-rep max and more. No sign-up, nothing stored.",
  path: "/calculators",
});

const count = new Intl.NumberFormat("en");

/** Every calculator, grouped by category in the content's order, each group noting the app that tracks it. */
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
      <PageHeader
        eyebrow="Calculators / Free"
        title="Fitness calculators"
        subtitle="Estimates for body composition, nutrition, strength, hydration and heart rate. Free, with no sign-up. Nothing you type is stored or sent."
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
                    <Note key={app.slug}>
                      Tracked over time in{" "}
                      <Link href={`/apps/${app.slug}`} className="text-tint underline underline-offset-4">
                        {app.name}
                      </Link>
                      .
                    </Note>
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
