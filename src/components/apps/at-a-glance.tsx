import type { ReactNode } from "react";
import { Section } from "@/components/page";
import { listFormat } from "@/content/format";
import { priceSentence } from "@/content/apps";
import type { App } from "@/content/types";
import { Panel, Text, Value } from "@/vector";
import { hasWatch, modelLabel } from "./model";

type Row = { term: string; detail: ReactNode };

const checkedOn = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/**
 * The facts an assistant or a buyer needs, as a description list near the top of the page (AI-SEARCH-06): how
 * the app is sold, the account, offline, platforms, watch, health sync, backup, analytics, languages, units and
 * the day the facts were checked. Every value is a plain statement from src/content/apps.ts; the price row states
 * the price, any trial and how it is paid (priceSentence), and appears only once the app has a price. Rows keep the ReadoutRow geometry (44 minimum, 1pt separators): the term in
 * a start column, narrow on phones and wider from 640, the detail beside it. The first row loses its top padding
 * with the 44 minimum (the panel inset carries the top), so every row sits at the same distance from its rule.
 */
export function AtAGlance({ app }: { app: App }) {
  const purchase = app.model === "purchase";
  const rows: Row[] = [
    { term: "Sold as", detail: modelLabel(app) },
    ...(app.price ? [{ term: "Price", detail: priceSentence(app) }] : []),
    { term: "Account", detail: purchase ? "None" : "Required" },
    { term: "Works offline", detail: purchase ? "Yes" : "No. It needs an account and a connection." },
    ...(app.platforms.length ? [{ term: "Platforms", detail: listFormat.format(app.platforms) }] : []),
    { term: "Apple Watch", detail: hasWatch(app) ? "Yes, with the iPhone app" : "No" },
    { term: "Health sync", detail: "Off until you turn it on" },
    ...(app.backup ? [{ term: "Backup", detail: app.backup }] : []),
    ...(app.analytics ? [{ term: "Analytics", detail: app.analytics }] : []),
    {
      term: app.languages.length === 1 ? "Language" : "Languages",
      detail:
        app.languages.length > 1 ? (
          <span className="flex flex-col gap-1">
            <Value value={String(app.languages.length)} unit="languages" size="s" />
            <Text variant="caption" tone="muted" as="span" className="text-pretty">
              {listFormat.format(app.languages)}
            </Text>
          </span>
        ) : (
          app.languages[0]
        ),
    },
    ...(app.units ? [{ term: "Units", detail: app.units }] : []),
    ...(app.updated
      ? [
          {
            term: "Facts checked",
            detail: <time dateTime={app.updated}>{checkedOn.format(new Date(`${app.updated}T00:00:00Z`))}</time>,
          },
        ]
      : []),
  ];
  return (
    <Section id="glance" title="At a glance">
      <Panel>
        <dl className="flex flex-col">
          {rows.map((row) => (
            <div
              key={row.term}
              className="grid min-h-11 grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-separator py-3 first:min-h-0 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-8"
            >
              <Text variant="small" tone="secondary" as="dt">
                {row.term}
              </Text>
              <Text variant="small" as="dd" className="text-pretty">
                {row.detail}
              </Text>
            </div>
          ))}
        </dl>
      </Panel>
    </Section>
  );
}
