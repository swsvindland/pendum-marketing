import { Section } from "@/components/page";
import { apps } from "@/content/apps";
import type { App } from "@/content/types";
import { AppIcon, Heading, Icon, LinkButton, Meta, Note, Panel, Text } from "@/vector";

/**
 * One app as a whole-panel link: icon, name and tagline, platforms, then up to three headline features. The link
 * is named by the app's heading, so a screen reader hears "Vector Body, link" and reads the rest as content.
 */
function AppCard({ app }: { app: App }) {
  const id = `series-${app.slug}-title`;
  const features = app.features.slice(0, 3);
  return (
    <Panel as="li" href={`/apps/${app.slug}`} aria-labelledby={id}>
      <div className="flex items-start gap-4">
        <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={56} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading level={3} id={id}>
            {app.name}
          </Heading>
          {app.tagline ? (
            <Text variant="small" tone="secondary" className="text-pretty">
              {app.tagline}
            </Text>
          ) : null}
        </div>
        <Icon name="forward" size={16} tone="muted" className="mt-1" />
      </div>
      {app.platforms.length ? <Meta items={app.platforms} /> : null}
      {features.length ? (
        <ul className="flex flex-col border-t border-separator">
          {features.map((f) => (
            <li key={f.title} className="flex min-h-11 items-center gap-3 border-t border-separator first:border-t-0">
              <Icon name={f.icon ?? app.glyph} size={20} tone="muted" />
              <Text variant="small" as="span">
                {f.title}
              </Text>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

/** The four one-time apps as a 2 × 2 grid of linked cards (one column on phones). */
export function VectorSeries() {
  const series = apps.filter((a) => a.model === "purchase");
  if (!series.length) return null;

  return (
    <Section
      id="series"
      bordered
      eyebrow="Apps / One-time purchase"
      title="The Vector series"
      intro="Four focused apps for body, strength, food and fluids. Each one is bought once, needs no account and keeps its records on your phone."
      action={
        <LinkButton href="/apps" forward>
          View all apps
        </LinkButton>
      }
    >
      <ul className="grid gap-6 md:grid-cols-2">
        {series.map((app) => (
          <AppCard key={app.slug} app={app} />
        ))}
      </ul>
      <Note>Body fat, one-rep max, expenditure and other estimates in the apps are general guidance, not medical advice.</Note>
    </Section>
  );
}
