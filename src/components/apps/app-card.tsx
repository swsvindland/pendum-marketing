import { ModelStatus } from "@/components/get-app";
import type { App } from "@/content/types";
import { AppIcon, Heading, Icon, Meta, Panel, Text } from "@/vector";

/**
 * One app on the /apps index as a whole-panel link to its page. The link is named by the app's name alone
 * (aria-labelledby), so a screen reader does not read the whole card as the link text. The icon is decorative:
 * the name sits beside it. `wide` lays the subscription app across the column with its feature bodies.
 */
export function AppCard({ app, wide = false }: { app: App; wide?: boolean }) {
  const nameId = `app-${app.slug}-name`;
  const features = app.features.slice(0, 3);
  const identity = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={wide ? 64 : 56} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading level={3} variant={wide ? "h2" : "h3"} id={nameId}>
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
      {wide && app.summary ? (
        <Text tone="secondary" className="max-w-[60ch] text-pretty">
          {app.summary}
        </Text>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <ModelStatus app={app} />
        {app.platforms.length ? (
          <>
            <span className="sr-only">Platforms</span>
            <Meta items={app.platforms} />
          </>
        ) : null}
      </div>
    </div>
  );

  if (wide) {
    return (
      <Panel as="li" href={`/apps/${app.slug}`} aria-labelledby={nameId}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          {identity}
          {features.length ? (
            <ul className="flex flex-col">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-3 border-t border-separator py-3 last:pb-0">
                  <Icon name={f.icon ?? "check"} size={20} tone="muted" className="mt-0.5" />
                  <span className="flex min-w-0 flex-col gap-1">
                    <Text variant="bodyStrong" as="span">
                      {f.title}
                    </Text>
                    <Text variant="small" tone="secondary" as="span" className="text-pretty">
                      {f.body}
                    </Text>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Panel>
    );
  }

  return (
    <Panel as="li" href={`/apps/${app.slug}`} aria-labelledby={nameId}>
      {identity}
      {features.length ? (
        <ul className="mt-auto flex flex-col">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3 border-t border-separator py-3 last:pb-0">
              <Icon name={f.icon ?? "check"} size={20} tone="muted" />
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
