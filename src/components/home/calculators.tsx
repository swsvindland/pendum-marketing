import { Section } from "@/components/page";
import { calculators, categoryLabel, categoryOrder } from "@/content/calculators";
import { listFormat } from "@/content/format";
import { LinkButton, ListRow, Panel, RowList } from "@/vector";

/**
 * Short names as one list. When a name holds a conjunction of its own ("DOTS and Wilks") the list is comma-joined,
 * so a row never reads "Plates and DOTS and Wilks".
 */
const shortList = (names: string[]) => (names.some((n) => / and /.test(n)) ? names.join(", ") : listFormat.format(names));

/**
 * The free calculators as a compact list (VQ-13, CRO-11): one row per category, naming its calculators, each row
 * opening that group on /calculators, or the calculator itself when the category has only one (the page is then
 * one tap nearer, and reachable from the home page's content). Every calculator is still named on the page, in
 * 44-row geometry, and the descriptions stay on /calculators and the calculator pages.
 */
export function FreeCalculators() {
  const groups = categoryOrder
    .map((category) => ({ category, items: calculators.filter((c) => c.category === category) }))
    .filter((g) => g.items.length);
  if (!groups.length) return null;
  const topics = listFormat.format(groups.map((g) => categoryLabel[g.category].toLowerCase()));

  return (
    <Section
      id="calculators"
      bordered
      eyebrow="Tools / Browser"
      title="Free fitness calculators"
      intro={`${calculators.length} calculators for ${topics}. Free, with no sign-up, and nothing you type is stored or sent anywhere.`}
      action={
        <LinkButton href="/calculators" forward>
          All {calculators.length} calculators
        </LinkButton>
      }
    >
      <Panel inset="none">
        <RowList aria-label="Calculators by category">
          {groups.map((g) => (
            <ListRow
              key={g.category}
              title={categoryLabel[g.category]}
              description={shortList(g.items.map((c) => c.short))}
              icon={g.items[0].icon}
              href={g.items.length === 1 ? `/calculators/${g.items[0].slug}` : `/calculators#${g.category}`}
            />
          ))}
        </RowList>
      </Panel>
    </Section>
  );
}
