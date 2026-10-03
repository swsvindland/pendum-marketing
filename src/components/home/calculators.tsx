import { Section } from "@/components/page";
import { listFormat } from "@/components/site/format";
import { calculators, categoryLabel, categoryOrder } from "@/content/calculators";
import type { CalculatorCategory, CalculatorMeta } from "@/content/types";
import { Label, LinkButton, ListRow, Panel, RowList } from "@/vector";

type Group = { category: CalculatorCategory; items: CalculatorMeta[] };

/**
 * Splits the groups into two columns of about the same height, in category order: each group goes to the column
 * with fewer rows so far (a group header counts as one row). On phones the columns simply stack.
 */
function balance(groups: Group[]): [Group[], Group[]] {
  const cols: [Group[], Group[]] = [[], []];
  const rows = [0, 0];
  for (const g of groups) {
    const i = rows[0] <= rows[1] ? 0 : 1;
    cols[i].push(g);
    rows[i] += g.items.length + 1;
  }
  return cols;
}

/** One category: a mono eyebrow as its heading, then a row list (the kit's grouped-list anatomy, §5.6). */
function CalculatorGroup({ group }: { group: Group }) {
  return (
    <div className="flex flex-col gap-2">
      <Label as="h3">{categoryLabel[group.category]}</Label>
      <Panel inset="none">
        <RowList>
          {group.items.map((c) => (
            <ListRow
              key={c.slug}
              title={c.short}
              description={c.description}
              icon={c.icon}
              href={`/calculators/${c.slug}`}
            />
          ))}
        </RowList>
      </Panel>
    </div>
  );
}

/** Every free calculator, grouped by category, two columns from 768. */
export function FreeCalculators() {
  const groups = categoryOrder
    .map((category) => ({ category, items: calculators.filter((c) => c.category === category) }))
    .filter((g) => g.items.length);
  if (!groups.length) return null;
  const columns = balance(groups);
  const topics = listFormat.format(groups.map((g) => categoryLabel[g.category].toLowerCase()));

  return (
    <Section
      id="calculators"
      bordered
      eyebrow="Tools / Browser"
      title="Free fitness calculators"
      intro={`${calculators.length} calculators for ${topics}. They are free, need no sign-up, and nothing you type is stored or sent anywhere.`}
      action={
        <LinkButton href="/calculators" forward>
          View all calculators
        </LinkButton>
      }
    >
      <div className="grid items-start gap-6 md:grid-cols-2">
        {columns.map((col, i) =>
          col.length ? (
            <div key={i} className="flex flex-col gap-6">
              {col.map((g) => (
                <CalculatorGroup key={g.category} group={g} />
              ))}
            </div>
          ) : null
        )}
      </div>
    </Section>
  );
}
