import { ModelStatus } from "@/components/get-app";
import { Section } from "@/components/page";
import { getApp } from "@/content/apps";
import { AppIcon, ButtonLink, Heading, Icon, Meta, Note, Panel, Text } from "@/vector";

/**
 * OmegaFyt: the app card (identity, platforms, how it is sold, the link) beside its four headline features (the
 * first four in apps.ts, which lead with what the public 1.7.0 build already has). The cross-device point is the
 * section's own claim: one account on each phone. The web version is described, not offered, until its address
 * is public.
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
      title="One account on iPhone and Android"
      intro="OmegaFyt tracks training and nutrition together and keeps both on your account, so the same records open on each phone you sign in on. A web version opens the same account in a browser; its address is published at launch."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel as="article" aria-labelledby="omegafyt-card-title">
          {/* The app name below is the card's heading, so the eyebrow stays plain. */}
          <Panel.Header eyebrow="Plan / Connected" meta={<ModelStatus app={app} />} heading={false} />
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
