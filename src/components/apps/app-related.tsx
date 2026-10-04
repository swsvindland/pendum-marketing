import { apps } from "@/content/apps";
import { getCalculator } from "@/content/calculators";
import { site } from "@/content/site";
import type { App, CalculatorMeta } from "@/content/types";
import { Heading, Label, LinkButton, ListRow, Panel, RowList, Text } from "@/vector";
import { modelLabel } from "./model";

/**
 * The close of an app page, two columns from 1024: the free calculators that go with the app, and the other apps
 * (the subscription and the Pendum apps) with how each is sold, plus a link to compare the two models. Links only;
 * the page's one primary stays the store link in the header. The two lists never have the same number of rows, so
 * each panel is exactly as tall as its rows and footer (the headings still align at the top of the row): a panel
 * stretched to its neighbour's height would leave a blank band above the shorter list's footer.
 */
export function AppRelated({ app }: { app: App }) {
  const calculators = app.calculators.map(getCalculator).filter((c): c is CalculatorMeta => Boolean(c));
  const others = apps.filter((a) => a.slug !== app.slug);
  return (
    <div className="border-t border-border">
      <div className="mx-auto grid max-w-data gap-12 px-gutter py-12 md:py-16 lg:grid-cols-2 lg:items-start lg:gap-6">
        {calculators.length ? (
          <section aria-labelledby="calculators-title" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Tools / Browser</Label>
              <Heading level={2} id="calculators-title">
                Free calculators
              </Heading>
              <Text tone="secondary">No sign-up. Nothing you type is stored or sent.</Text>
            </div>
            <Panel inset="none">
              <RowList>
                {calculators.map((c) => (
                  <ListRow
                    key={c.slug}
                    title={c.title}
                    description={c.description}
                    icon={c.icon}
                    href={`/calculators/${c.slug}`}
                  />
                ))}
              </RowList>
              <div className="border-t border-separator px-4 py-3 min-[600px]:px-6">
                <LinkButton href="/calculators" forward>
                  All calculators
                </LinkButton>
              </div>
            </Panel>
          </section>
        ) : null}
        <section aria-labelledby="other-apps-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Apps / Models</Label>
            <Heading level={2} id="other-apps-title">
              More from {site.family}
            </Heading>
            <Text tone="secondary">A subscription that syncs, or a one-time purchase.</Text>
          </div>
          <Panel inset="none">
            <RowList>
              {others.map((a) => (
                <ListRow key={a.slug} title={a.name} description={modelLabel(a)} icon={a.glyph} href={`/apps/${a.slug}`} />
              ))}
            </RowList>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-separator px-4 py-3 min-[600px]:px-6">
              <LinkButton href="/pricing" forward>
                Compare the models
              </LinkButton>
              <LinkButton href="/apps" forward>
                All apps
              </LinkButton>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}
