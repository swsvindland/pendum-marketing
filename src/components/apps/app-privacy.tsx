import type { App } from "@/content/types";
import { Heading, Icon, Label, Meta, Panel, Text } from "@/vector";

/**
 * Where an app keeps records. A one-time purchase headlines the offline promise (no account, no server, no
 * analytics, records in a database on the phone); the subscription headlines the account and its sync. Either way
 * the specifics come from `app.privacy`, so this section never claims more than the fact sheet. It does not say
 * records "never" leave the phone: Health sync, device backups and saved backup files are the visitor's choices.
 */
export function AppPrivacy({ app }: { app: App }) {
  const offline = app.model === "purchase";
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="border-t border-border">
      <div className="mx-auto grid max-w-data items-start gap-8 px-gutter py-12 md:py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
        <div className="flex flex-col gap-3">
          <Icon name="lock" size={24} tone="foreground" className="mb-1" />
          <Label>{`Privacy / ${app.name}`}</Label>
          <Heading level={2} id="privacy-title">
            {offline ? "Your records live on your phone" : "One account, synced through a server"}
          </Heading>
          <Text tone="secondary" className="max-w-[60ch] text-pretty">
            {offline
              ? `${app.name} needs no account and has no server of its own. It keeps its records in a database on your phone.`
              : `${app.name} needs an account and a connection. Records are stored on the ${app.name} server, so the same data opens on each device you sign in on.`}
          </Text>
          <Meta
            tone="default"
            items={offline ? ["No account", "No server", "No analytics"] : ["Account required", "Synced across devices"]}
            className="mt-1"
          />
        </div>
        {app.privacy.length ? (
          <Panel>
            <Panel.Header eyebrow="Privacy / Details" />
            <Panel.Body>
              <ul className="flex flex-col">
                {app.privacy.map((item) => (
                  <li key={item} className="border-t border-separator py-3 first:border-t-0 first:pt-0 last:pb-0">
                    <Text variant="small">{item}</Text>
                  </li>
                ))}
              </ul>
            </Panel.Body>
          </Panel>
        ) : null}
      </div>
    </section>
  );
}
