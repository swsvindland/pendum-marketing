import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/page";
import { apps } from "@/content/apps";
import { KitControls } from "./controls";
import {
  AppIcon,
  ButtonLink,
  Callout,
  Heading,
  Icon,
  Label,
  LinkButton,
  ListRow,
  Meta,
  Meter,
  Note,
  Panel,
  ReadoutRow,
  RowList,
  Status,
  Text,
  Value,
} from "@/vector";
import { Button } from "@/vector/button";
import { NativeButton, NativeIconButton } from "@/vector/button-native";
import { Disclosures } from "@/vector/disclosure";

export const metadata: Metadata = { title: "Kit", robots: { index: false } };

/** The web kit gallery: every component in every state, for checking the port against the native kit. */
export default function KitPage() {
  return (
    <>
      <PageHeader eyebrow="System / Kit" title="Vector kit, web edition" subtitle="Every component in the port, on one page." />
      <Section title="Type" eyebrow="Kit / Text">
        <div className="flex flex-col gap-3">
          <Text variant="display">Display 40/44</Text>
          <Heading level={2} variant="h1">Heading 1 28/34</Heading>
          <Heading level={3} variant="h2">Heading 2 22/28</Heading>
          <Heading level={4} variant="h3">Heading 3 17/22</Heading>
          <Text variant="h4">Heading 4 15/20</Text>
          <Text>Body 16/24. Sentences are Inter; measurement is Plex Mono.</Text>
          <Text variant="bodyStrong">Body strong 16/24</Text>
          <Note>Small muted 14/20, for notes and descriptions.</Note>
          <Text variant="caption" tone="muted">Caption 12/16</Text>
          <Label>Label / Eyebrow</Label>
          <div className="flex flex-wrap items-baseline gap-6">
            <Value value="81.4" unit="kg" size="xl" />
            <Value value="1,240" unit="kcal" size="l" />
            <Value value="2.1" unit="L" size="m" />
            <Value value="225" unit="lb" size="s" />
            <Value value="14:02" size="xs" tone="muted" />
          </div>
          <Meta items={["4 sets", "62 min", "12,450 kg"]} />
        </div>
      </Section>
      <Section title="Actions" eyebrow="Kit / Button" bordered>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="#" variant="primary" icon="forward" iconPosition="end">Compare plans</ButtonLink>
          <Button variant="secondary" icon="calculator">Open calculator</Button>
          <Button variant="ghost">Show method</Button>
          <Button variant="destructive">Reset inputs</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <ButtonLink href="#" variant="primary" size="lg">Large primary</ButtonLink>
          <LinkButton href="#" forward>Read the method</LinkButton>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <NativeButton variant="secondary">Native secondary</NativeButton>
          <NativeButton variant="ghost">Native ghost</NativeButton>
          <NativeIconButton label="Menu" glyph={<Icon name="menu" size={20} />} />
          <NativeIconButton label="Close" variant="secondary" glyph={<Icon name="close" size={20} />} />
          <Text variant="small" tone="muted">Native buttons: the same look with no HeroUI, for the error pages and the mobile nav.</Text>
        </div>
      </Section>
      <Section title="Panels and feedback" eyebrow="Kit / Panel" bordered>
        <div className="grid gap-6 md:grid-cols-2">
          <Panel>
            <Panel.Header eyebrow="Trend / Weight" meta="7-day" />
            <Panel.Body>
              <Value value="81.4" unit="kg" size="xl" />
              <Meter value={1240} max={2400} tone="signal" label="Calories" valueText="1,240 of 2,400 kcal" />
              <ReadoutRow label="This week"><Value value="−0.3" unit="kg" size="s" /></ReadoutRow>
              <ReadoutRow label="Goal"><Value value="78.0" unit="kg" size="s" /></ReadoutRow>
            </Panel.Body>
          </Panel>
          <Panel tone="live">
            <Panel.Header eyebrow="Rest / Timer" meta="Set 3 of 4" />
            <Panel.Body>
              <Value value="01:32" size="xl" />
              <Status state="live" label="Resting" meta="14:02" />
              <Status state="ok" label="Up to date" />
              <Status state="attention" label="Over target" />
              <Status state="idle" label="Not connected" />
            </Panel.Body>
          </Panel>
          <Panel inset="none">
            <RowList>
              <ListRow title="BMI calculator" description="Height and weight" icon="scale" href="#" />
              <ListRow title="Plate calculator" icon="lift" href="#" />
              <ListRow title="Units" value={<Value value="Metric" size="s" tone="muted" />} />
            </RowList>
          </Panel>
          <Panel>
            <Panel.Body>
              <Callout tone="info" title="Method">Mifflin-St Jeor, 1990.</Callout>
              <Callout tone="warning" title="Over target">120 kcal over the daily budget.</Callout>
              <Callout tone="danger">Enter a height between 100 and 250 cm.</Callout>
              <Callout tone="success" title="Done">Saved.</Callout>
              <Meter value={2.9} max={2.5} label="Water" valueText="2.9 of 2.5 L" />
              <Meter value={1.8} max={2.5} target={2.2} label="Water" valueText="1.8 of 2.5 L" />
            </Panel.Body>
          </Panel>
        </div>
      </Section>
      <Section title="Inputs" eyebrow="Kit / Field" bordered>
        <KitControls />
      </Section>
      <Section title="Disclosures" eyebrow="Kit / Disclosure" bordered>
        <Disclosures
          className="max-w-form"
          items={[
            { question: "Does the app need an internet connection?", answer: "No. Health sync and backups are optional." },
            { question: "Is there a web version?", answer: "Yes, with the same account." },
          ]}
        />
      </Section>
      <Section title="Icons" eyebrow="Kit / Icon" bordered>
        <div className="flex flex-wrap items-center gap-4">
          {(["scale", "ruler", "lift", "food", "water", "pulse", "record", "chart", "lock", "cloud", "offline", "phone", "watch", "globe", "sync", "analysis"] as const).map((n) => (
            <Icon key={n} name={n} size={24} label={n} />
          ))}
          {apps.slice(0, 2).map((app) => (
            <AppIcon key={app.slug} src={app.icon.light} dark={app.icon.dark} alt={app.name} size={56} />
          ))}
        </div>
      </Section>
    </>
  );
}
