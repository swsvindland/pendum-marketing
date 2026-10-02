import { apps } from "@/content/apps";
import { getCalculator } from "@/content/calculators";
import type { App, CalculatorMeta } from "@/content/types";
import { Heading, Label, LinkButton, ListRow, Panel, RowList, Text } from "@/vector";
import { modelLabel } from "./model";

/**
 * The close of an app page, two columns from 1024: the free calculators that go with the app, and the other apps
 * in the series with how each is sold, plus a link to compare the two models. Links only; the page's one primary
 * stays the store link in the header.
 */
export function AppRelated({ app }: { app: App }) {
  const calculators = app.calculators.map(getCalculator).filter((c): c is CalculatorMeta => Boolean(c));
  const others = apps.filter((a) => a.slug !== app.slug);
  return (
    <div className="border-t border-border">
      <div className="mx-auto grid max-w-data items-start gap-12 px-gutter py-12 md:py-16 lg:grid-cols-2 lg:gap-6">
        {calculators.length ? (
          <section aria-labelledby="calculators-title" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Calculators / Free</Label>
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
              <div className="mt-auto border-t border-separator px-4 py-3 min-[600px]:px-6">
                <LinkButton href="/calculators" forward>
                  All calculators
                </LinkButton>
              </div>
            </Panel>
          </section>
        ) : null}
        <section aria-labelledby="other-apps-title" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Apps / Series</Label>
            <Heading level={2} id="other-apps-title">
              Other apps in the series
            </Heading>
            <Text tone="secondary">A subscription that syncs, or a one-time purchase.</Text>
          </div>
          <Panel inset="none">
            <RowList>
              {others.map((a) => (
                <ListRow key={a.slug} title={a.name} description={modelLabel(a)} icon={a.glyph} href={`/apps/${a.slug}`} />
              ))}
            </RowList>
            <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-separator px-4 py-3 min-[600px]:px-6">
              <LinkButton href="/pricing" forward>
                Compare the models
              </LinkButton>
              <LinkButton href="/apps">All apps</LinkButton>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}
