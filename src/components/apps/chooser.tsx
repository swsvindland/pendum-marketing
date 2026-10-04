import { Section } from "@/components/page";
import { apps } from "@/content/apps";
import { site } from "@/content/site";
import type { App } from "@/content/types";
import { LinkButton, ListRow, Panel, RowList } from "@/vector";
import { modelLabel } from "./model";

/** The apps that carry a chooser row in the content, in content order. */
const rows = apps.filter((a): a is App & { chooser: NonNullable<App["chooser"]> } => Boolean(a.chooser));

/**
 * The chooser (CRO-06): a server-rendered row list, one row per want (`chooser` on each app in src/content/apps.ts,
 * so the sentences and the facts live with the features they summarize), each leading to the app that does it.
 * The hero's "Choose your app" lands here (#choose). No script, no state: five links and one way to the
 * comparison. The description keeps to one line on a phone, the app and how it is sold; the facts behind the want
 * are shown from 768, where the row has the width for them.
 */
export function Chooser({ bordered = false }: { bordered?: boolean }) {
  const subscription = apps.find((a) => a.model === "subscription");
  if (!rows.length) return null;
  return (
    <Section
      id="choose"
      eyebrow="Apps / Choose"
      title="Which app is for you"
      intro={`Pick by what you want to track. Each of ${site.series.sentence} is bought once and keeps its records on your phone${subscription ? `; ${subscription.name} is the subscription that syncs one account across phones` : ""}.`}
      action={
        <LinkButton href="/pricing" forward>
          Compare the models
        </LinkButton>
      }
      bordered={bordered}
    >
      <Panel inset="none">
        <RowList aria-label="Apps by what you want to track">
          {rows.map((app) => (
            <ListRow
              key={app.slug}
              title={app.chooser.want}
              description={
                <>
                  {app.name}, {modelLabel(app).toLowerCase()}
                  <span className="hidden md:inline">: {app.chooser.facts}</span>
                </>
              }
              icon={app.glyph}
              href={`/apps/${app.slug}`}
            />
          ))}
        </RowList>
      </Panel>
    </Section>
  );
}
