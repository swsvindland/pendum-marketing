import { Section } from "@/components/page";
import { principles } from "@/content/principles";
import { Heading, Icon, Text } from "@/vector";

/**
 * The four principles the apps share (src/content/principles.ts, the one list /about renders too), as a grid of
 * cells on 1pt rules: a glyph, the title and its one sentence (VQ-01).
 */
export function Principles() {
  if (!principles.length) return null;
  return (
    <Section id="principles" bordered eyebrow="Design / Principles" title="How the apps are made">
      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((p) => (
          <li key={p.title} className="flex flex-col gap-2 border-t border-border py-4">
            <Icon name={p.icon} size={20} tone="muted" />
            <Heading level={3}>{p.title}</Heading>
            <Text variant="small" tone="secondary" className="text-pretty">
              {p.body}
            </Text>
          </li>
        ))}
      </ul>
    </Section>
  );
}
