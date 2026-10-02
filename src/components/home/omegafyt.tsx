import { ModelStatus } from "@/components/get-app";
import { Section } from "@/components/page";
import { getApp } from "@/content/apps";
import { AppIcon, ButtonLink, Heading, Icon, Meta, Note, Panel, Text } from "@/vector";

/**
 * OmegaFyt: the app card (identity, platforms, how it is sold, the link) beside its four headline features. The
 * cross-device point is the section's own claim: one account, read and written from phone or browser.
 */
export function OmegaFytSection() {
  const app = getApp("omegafyt");
  if (!app) return null;
  const features = app.features.slice(0, 4);

  return (
    <Section
      id="omegafyt"
      bordered
      eyebrow="Apps / Subscription"
      title="One account on iPhone, Android and the web"
      intro="OmegaFyt plans training and nutrition together and keeps both on your account. Log a workout on your phone, then read the report in a browser."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel as="article" aria-labelledby="omegafyt-card-title">
          <Panel.Header eyebrow="Plan / Connected" meta={<ModelStatus app={app} />} />
          <Panel.Body>
            <div className="flex items-start gap-4">
              <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={56} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Heading level={3} id="omegafyt-card-title">
                  {app.name}
                </Heading>
                {app.tagline ? (
                  <Text variant="small" tone="secondary" className="text-pretty">
                    {app.tagline}
                  </Text>
                ) : null}
              </div>
            </div>
            {app.platforms.length ? <Meta items={app.platforms} /> : null}
            <Text variant="small" tone="secondary" className="text-pretty">
              Subscriptions are bought in the iPhone or Android app, through the App Store or Google Play.
            </Text>
          </Panel.Body>
          <Panel.Footer>
            <ButtonLink href="/apps/omegafyt" variant="secondary">
              View OmegaFyt
            </ButtonLink>
          </Panel.Footer>
        </Panel>

        {features.length ? (
          <ul className="grid content-start gap-x-6 sm:grid-cols-2 lg:col-span-2">
            {features.map((f) => (
              <li key={f.title} className="flex gap-3 border-t border-border py-4">
                <Icon name={f.icon ?? app.glyph} size={20} tone="muted" className="mt-px" />
                <div className="flex min-w-0 flex-col gap-1">
                  <Heading level={3} variant="h4">
                    {f.title}
                  </Heading>
                  <Text variant="small" tone="muted" className="text-pretty">
                    {f.body}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Note>Calorie and macro targets, expenditure, body fat and one-rep max in OmegaFyt are estimates, not medical advice.</Note>
    </Section>
  );
}
