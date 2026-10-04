import { hasWatch } from "@/components/apps/model";
import { ANALYTICS_SINCE, names, priceShort, purchaseApps, seriesNames, subscriptionApp } from "@/content/apps";
import { listFormat } from "@/content/format";
import { site } from "@/content/site";
import { isShipped } from "@/content/version";
import { Icon, Label, Text, cn } from "@/vector";

type Cell = {
  /** The answer, a word or a short phrase. */
  text: string;
  /** One or two short sentences that qualify it. */
  note?: string;
  /** A yes or no glyph beside the word; the word always carries the meaning (§1.6). */
  mark?: "yes" | "no";
};
type Row = { topic: string; subscription: Cell; purchase: Cell };

const purchaseNames = seriesNames();
/** The subscription app's name and plan. The column has no meaning without one; the fallbacks only keep the types. */
const subscriptionName = subscriptionApp?.name ?? "Subscription";
const plan = subscriptionApp?.plan ?? subscriptionName;
/** Which purchase apps add a watch app, from their platforms; no note when none does. */
const watch = purchaseApps.filter(hasWatch);
const watchNote = watch.length
  ? `${listFormat.format(watch.map((a) => a.name))} ${watch.length > 1 ? "add" : "adds"} an Apple Watch app.`
  : undefined;
/**
 * Analytics entered the subscription app with ANALYTICS_SINCE (src/content/apps.ts), so the public build sends
 * none while `version` is older; the row then says so and names the version that changes it (the same gate as
 * the app page's features and the content's analyticsSentence).
 */
const analyticsShipped = subscriptionApp ? isShipped({ since: ANALYTICS_SINCE }, subscriptionApp) : false;

/**
 * Every cell is checked against docs/sources/app-facts.json. Where the four Pendum apps differ (backups, the
 * watch apps) the note says which app does what, so no row claims more than every app ships. The first column is
 * the app, Pendum One, not the Pendum One plan: the web version is never sold as part of a plan, and its address
 * is not public yet, so it is described rather than marked as a yes. Full product names throughout (CLAUDE.md).
 */
const rows: Row[] = [
  {
    topic: "Account",
    subscription: { text: "Required", note: "Sign in on each device. Creating an account is free." },
    purchase: { text: "None", note: "No sign-in and no sign-up." },
  },
  {
    topic: "Where your records live",
    subscription: { text: `On the ${subscriptionName} server`, note: "Stored with your account on a server in the US." },
    purchase: { text: "On your phone", note: "A database inside each app." },
  },
  {
    topic: "Works offline",
    subscription: { text: "No", mark: "no", note: `Needs a connection to the ${subscriptionName} server.` },
    purchase: { text: "Yes", mark: "yes", note: "The apps make no network requests of their own." },
  },
  {
    topic: "Devices",
    subscription: { text: "iPhone and Android", note: "The same account on both." },
    purchase: { text: "iPhone and Android", note: watchNote },
  },
  {
    topic: "Web access",
    subscription: {
      text: "Same account in a browser",
      note: "Its address is not public yet. The web version has no checkout.",
    },
    purchase: { text: "No", mark: "no", note: "There is no web version." },
  },
  {
    topic: "Apple Health and Health Connect",
    subscription: {
      text: "Opt-in",
      mark: "yes",
      note: "Off until you turn it on. Imported weigh-ins are saved to your account.",
    },
    purchase: { text: "Opt-in", mark: "yes", note: "Off until you turn it on in each app." },
  },
  {
    topic: "Backups",
    subscription: { text: "Records follow the account", note: "Sign in on a new phone to open them." },
    purchase: {
      text: "Varies by app",
      note: `${names.lift} and ${names.macros} save encrypted backup files where you choose. ${names.body} and ${names.hydration} have no backup of their own.`,
    },
  },
  {
    topic: "Analytics",
    subscription: analyticsShipped
      ? {
          text: "Product analytics",
          note: "In the iPhone and Android apps only. Events exclude weight, height, sex and measurements.",
        }
      : {
          text: "None in the current build",
          note: `From version ${ANALYTICS_SINCE} the iPhone and Android apps send usage events and error reports to PostHog.`,
        },
    purchase: { text: "None", note: "No analytics or crash-reporting code." },
  },
  {
    topic: "How you pay",
    subscription: {
      text: "Subscription",
      note: subscriptionApp?.price
        ? `${priceShort(subscriptionApp)}, billed by the App Store or Google Play.`
        : `${plan}, billed by the App Store or Google Play.`,
    },
    purchase: {
      text: "One-time purchase",
      note: purchaseApps.every((a) => a.price)
        ? `${purchaseApps.map((a) => `${a.name} ${a.price!.display}`).join(", ")}. Each is bought once.`
        : "Each app is bought once.",
    },
  },
  {
    topic: "Where you buy",
    subscription: {
      text: "In the iPhone and Android apps",
      note: "The paywall lists the plans. The web version has no checkout.",
    },
    purchase: { text: "The App Store and Google Play", note: "Not in the stores yet." },
  },
];

const columns = [
  { key: "subscription", label: subscriptionName },
  { key: "purchase", label: site.series.label },
] as const;

/** The answer with its glyph slot always drawn, so every answer in a column starts at the same x. */
function CellContent({ cell }: { cell: Cell }) {
  return (
    <span className="flex items-start gap-2">
      {cell.mark ? (
        <Icon
          name={cell.mark === "yes" ? "check" : "close"}
          size={16}
          tone={cell.mark === "yes" ? "foreground" : "muted"}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <span aria-hidden className="mt-0.5 size-4 shrink-0" />
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <Text as="span" variant="small">
          {cell.text}
        </Text>
        {cell.note ? (
          <Text as="span" variant="caption" tone="muted" className="text-pretty">
            {cell.note}
          </Text>
        ) : null}
      </span>
    </span>
  );
}

/**
 * The comparison as a real table. From 768 it is a classic three-column table. Below that each row stacks: the
 * topic spans the width and the two answers sit side by side under it, so nothing scrolls sideways. Changing
 * `display` on table parts drops table semantics in some browsers, so the ARIA table roles are stated as well.
 * The column headers stay pinned under the site header while the table scrolls past.
 */
export function CompareTable() {
  return (
    <div className="overflow-clip rounded-panel border border-border bg-surface">
      <table role="table" className="block w-full border-separate border-spacing-0 md:table md:table-fixed">
        <caption className="sr-only">
          {columns[0].label} compared with {site.series.sentence}: {purchaseNames}.
        </caption>
        <thead role="rowgroup" className="sticky top-16 z-10 block bg-surface md:table-header-group">
          <tr role="row" className="grid grid-cols-2 md:table-row">
            <th role="columnheader" scope="col" className="max-md:sr-only md:w-[28%] md:border-b md:border-border">
              <span className="sr-only">Topic</span>
            </th>
            {columns.map((c) => (
              <th
                key={c.key}
                role="columnheader"
                scope="col"
                className="border-b border-border px-3 py-3 text-start align-bottom md:w-[36%] md:px-4"
              >
                <Label tone="default">{c.label}</Label>
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="block md:table-row-group">
          {rows.map((row, i) => (
            <tr key={row.topic} role="row" className="grid grid-cols-2 md:table-row">
              <th
                role="rowheader"
                scope="row"
                className={cn(
                  "col-span-2 px-3 pt-4 pb-2 text-start align-top md:px-4 md:pb-4",
                  i > 0 && "border-t border-separator"
                )}
              >
                <Label>{row.topic}</Label>
              </th>
              {columns.map((c) => (
                <td
                  key={c.key}
                  role="cell"
                  className={cn("px-3 pb-4 align-top md:px-4 md:pt-4", i > 0 && "md:border-t md:border-separator")}
                >
                  <CellContent cell={row[c.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
