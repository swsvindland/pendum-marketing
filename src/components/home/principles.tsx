import { Section } from "@/components/page";
import { apps } from "@/content/apps";
import { Heading, Icon, Text, type IconName } from "@/vector";

type Principle = { icon: IconName; title: string; body: string };

const listFormat = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/**
 * The languages sentence comes from the app data, so it names only the apps that ship more than one language and
 * disappears if none do.
 */
function languageSentence() {
  const translated = apps.filter((a) => a.languages.length > 1);
  if (!translated.length) return "";
  const count = Math.min(...translated.map((a) => a.languages.length));
  const names = listFormat.format(translated.map((a) => a.name));
  return ` ${names} ${translated.length > 1 ? "offer" : "offers"} ${count} interface languages.`;
}

/** Four short items from the design system's character (design-system §1), each true of the shipped apps. */
export function Principles() {
  const items: Principle[] = [
    {
      icon: "lock",
      title: "Private by default",
      body: "The Vector apps have no account, no server and no analytics. Records are kept in a database on your phone, and Health sync is off until you turn it on.",
    },
    {
      icon: "ruler",
      title: "Every value in text",
      body: "Measurements are set in a fixed-width face with the unit beside them. A meter, chart or color never carries meaning on its own.",
    },
    {
      icon: "document",
      title: "One design system",
      body: "All five apps share the same type, rules and readouts, so a number reads the same way in each of them.",
    },
    {
      icon: "language",
      title: "Your units, your language",
      body: `Every app takes your units where they apply: kilograms or pounds, centimeters or inches, milliliters or fluid ounces.${languageSentence()}`,
    },
  ];

  return (
    <Section id="principles" bordered eyebrow="Design / Principles" title="How the apps are made">
      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
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
