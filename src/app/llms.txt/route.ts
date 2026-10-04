import { apps, priceSentence, seriesNames } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { listFormat } from "@/content/format";
import { site } from "@/content/site";
import { absoluteUrl, latestUpdate } from "@/content/structured-data";
import type { App } from "@/content/types";

/**
 * /llms.txt (llmstxt.org format), rendered once at build time from the site content so it can never drift from
 * src/content. It states only what the pages state: prices and trials from the content, no ratings or download
 * counts, and a store link only once the content has one. Evidence that the file is read is weak (Ahrefs, 2026-06-15: 97% of
 * 137,210 files got no requests in a month; Google ignores it), so this is a courtesy, not a visibility lever.
 * src/app/llms.test.ts checks the output against the silence list.
 */
export const dynamic = "force-static";

const subscription = apps.filter((a) => a.model === "subscription");
const purchase = apps.filter((a) => a.model === "purchase");

/** How an app is sold and what it costs, in the words the pages use (priceSentence reads the content's prices). */
function sale(app: App) {
  const price = priceSentence(app);
  if (app.model === "subscription") {
    const plan = app.plan ? ` (${app.plan})` : "";
    return `Subscription${plan}, bought in the iPhone and Android apps.${price ? ` ${price}` : ""}`;
  }
  return `One-time purchase, with no account.${price ? ` ${price}` : ""}`;
}

/**
 * Where the app is today: its listings when the content has them, else the state in words. Each URL is wrapped in
 * angle brackets (Markdown's autolink form), so the full stop that ends the sentence is never read as part of it.
 */
function availability(app: App) {
  const links = [
    app.stores.appStore && `App Store: <${app.stores.appStore}>`,
    app.stores.googlePlay && `Google Play: <${app.stores.googlePlay}>`,
    app.stores.web && `Web: <${app.stores.web}>`,
  ].filter((s): s is string => Boolean(s));
  const listedAs = app.storeName ? ` The listings still show its former name, ${app.storeName}.` : "";
  if (links.length) return `${app.stores.state === "preorder" ? "Pre-order. " : ""}${links.join(". ")}.${listedAs}`;
  return app.released ? "In the App Store and Google Play." : "Not yet in the stores.";
}

function languages(app: App) {
  return app.languages.length > 1 ? `${app.languages.length} interface languages.` : `${app.languages[0]} only.`;
}

function appLine(app: App) {
  const parts = [
    app.definition ?? app.summary,
    `Platforms: ${listFormat.format(app.platforms)}.`,
    sale(app),
    availability(app),
    languages(app),
  ];
  return `- [${app.name}](${absoluteUrl(`/apps/${app.slug}`)}): ${parts.join(" ")}`;
}

function text() {
  const names = seriesNames;
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `This file is generated from the site content, which is checked against the app repos. App facts checked ${latestUpdate()}; site content updated ${site.contentUpdated}.`,
    "",
    "## Apps",
    "",
    ...apps.map(appLine),
    "",
    "## How the apps are sold",
    "",
    `- [Pricing](${absoluteUrl("/pricing")}): ${names(subscription)} is a subscription billed by the App Store or Google Play and bought in the iPhone and Android apps. ${names(purchase)} are each sold as a one-time purchase, with no account.`,
    "",
    "## Privacy and support",
    "",
    `- [Privacy](${absoluteUrl("/privacy")}): What the website, ${site.series.sentence} and ${names(subscription)} do with your data. ${site.series.label} keep records in a database on the phone and make no network requests of their own; health sync is off until you turn it on.`,
    `- [Support](${absoluteUrl("/support")}): Answers about health sync, backups, reminders, ${names(subscription)} accounts and the calculators.`,
    `- [About](${absoluteUrl("/about")}): Who makes the apps${site.publisher ? ` (${site.publisher})` : ""}, what the five apps are and how they are built.`,
    "",
    "## Free calculators",
    "",
    "Every calculator is free, needs no sign-up and runs in the browser. Nothing you type is sent anywhere. Results are estimates, not medical advice, and each page states its method and sources.",
    "",
    ...calculators.map((c) => `- [${c.title}](${absoluteUrl(`/calculators/${c.slug}`)}): ${c.description}`),
    "",
    "## Optional",
    "",
    `- [Apps](${absoluteUrl("/apps")}): All ${apps.length} apps and how each is sold.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    "",
  ];
  return lines.join("\n");
}

export function GET() {
  return new Response(text(), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
