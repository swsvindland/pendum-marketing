import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader, Section } from "@/components/page";
import { JsonLd } from "@/components/site/json-ld";
import { FactList, TermList } from "@/components/site/lists";
import { metaDescription, pageMetadata } from "@/components/site/metadata";
import { ANALYTICS_SINCE, analyticsSentence, apps, names, seriesNames, subscriptionApp } from "@/content/apps";
import { site } from "@/content/site";
import { breadcrumbList } from "@/content/structured-data";
import { isShipped } from "@/content/version";
import { Callout, LinkButton, Panel, ReadoutRow, Text, Value } from "@/vector";

/** The subscription app's name (a list, should the content ever hold more than one). */
const subscriptionNames = seriesNames(apps.filter((a) => a.model === "subscription"));
/** The purchase apps' full names as one list. */
const purchaseNames = seriesNames();
/** Where the subscription app keeps its records: "{name} server". */
const server = `${subscriptionNames} server`;
const publisher = site.publisher;

/**
 * The analytics statement comes from the content (analyticsSentence in src/content/apps.ts), gated on the
 * subscription app's `version` like its features: while the public build is older than ANALYTICS_SINCE it says
 * none is sent and names the version that changes it, and the details of what the events hold are added only
 * once they ship. The saved gyms, rest timer and guided setup are 1.8.0 items too (src/content/apps.ts `since`),
 * so they are not named here until `version` is raised.
 * TODO(owner): when Pendum One's `version` reaches 1.8.0, "gyms" (stored records), "rest timer settings"
 * (preferences) and the setup's "plan length and training days" (event properties) can return to the facts below.
 */
const analyticsShipped = subscriptionApp ? isShipped({ since: ANALYTICS_SINCE }, subscriptionApp) : false;
const analyticsReadout = analyticsShipped ? "PostHog, in the phone apps" : "None in the current build";
const analyticsFact = subscriptionApp
  ? [
      analyticsSentence(subscriptionApp),
      analyticsShipped
        ? "Events also carry screen names, taps and plan choices such as goal and weekly pace, and PostHog runs the app’s feature flags. Taps record which control was used, never the text on it. There is no session replay."
        : "",
      `${subscriptionNames} in a browser sends no analytics.`,
    ]
      .filter(Boolean)
      .join(" ")
  : "";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: metaDescription(
    `What this site, ${site.series.sentence} and ${subscriptionNames} do with your data: no cookies on the site, records kept on your phone, one account and a server for ${subscriptionNames}.`
  ),
  path: "/privacy",
});

/** The day this summary was last checked against docs/sources/app-facts.json and the site code. */
const updated = site.contentUpdated;
const updatedLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
  new Date(`${updated}T00:00:00Z`)
);

/** A worded readout value: `small` foreground, as ListRow values that are words (§5.6). */
function Word({ children }: { children: ReactNode }) {
  return (
    <Text variant="small" as="span">
      {children}
    </Text>
  );
}

/**
 * Privacy at a glance. A summary, not a policy: every statement here comes from the verified fact sheet
 * (docs/sources/app-facts.json) or, for the website, from this codebase. No retention periods, no legal terms.
 * Readout rows whose values are phrases take `stack`, so a value drops under its label on a phone only when the
 * two do not fit side by side; each section is one headed panel (readouts, then the facts under a 1pt rule)
 * rather than a readout beside a bare box.
 */
export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: "Privacy" }])} />
      <PageHeader
        eyebrow="Data / Website and apps"
        crumbs={[{ href: "/", label: "Home" }]}
        title="Privacy at a glance"
        subtitle="What this website and the five apps do with your data, in plain words."
        actions={
          <Text variant="small" tone="muted">
            Updated <time dateTime={updated}>{updatedLabel}</time>
          </Text>
        }
      />

      <Section
        id="glance"
        eyebrow="Privacy / Compare"
        title="Two kinds of app"
        intro={`${purchaseNames} keep your records on your phone. ${subscriptionNames}, the subscription, keeps them on its server so one account works on each device you sign in on.`}
      >
        <Callout title="Summary / Not a policy">This page is a summary, not a privacy policy.</Callout>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <Panel.Header eyebrow="Offline / One-time purchase" title={site.series.label} />
            <Panel.Body className="gap-0">
              <ReadoutRow label="Account">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Where records live" stack>
                <Word>On your phone</Word>
              </ReadoutRow>
              <ReadoutRow label="Analytics">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Health sync" stack>
                <Word>Off until you turn it on</Word>
              </ReadoutRow>
              <ReadoutRow label="App backup" stack>
                <Word>Encrypted file in {names.lift} and {names.macros}</Word>
              </ReadoutRow>
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Header eyebrow="Synced / Subscription" title={subscriptionNames} />
            <Panel.Body className="gap-0">
              <ReadoutRow label="Account">
                <Word>Required</Word>
              </ReadoutRow>
              <ReadoutRow label="Where records live" stack>
                <Word>{server}, United States</Word>
              </ReadoutRow>
              <ReadoutRow label="Analytics" stack>
                <Word>{analyticsReadout}</Word>
              </ReadoutRow>
              <ReadoutRow label="Health sync" stack>
                <Word>Off until you turn it on</Word>
              </ReadoutRow>
              <ReadoutRow label="Delete account">
                <Word>In Settings</Word>
              </ReadoutRow>
            </Panel.Body>
          </Panel>
        </div>
      </Section>

      <Section
        id="website"
        eyebrow="Data / Cookies and storage"
        title="This website"
        intro={`There is nothing to sign up for. The site works without an account and without cookies.${publisher ? ` It is published by ${publisher}, the publisher named on the app store listings.` : ""}`}
        bordered
      >
        <Panel className="max-w-form">
          <Panel.Header eyebrow="Site / Readout" title="No cookies and no ads" />
          <Panel.Body className="gap-0">
            <ReadoutRow label="Analytics" stack>
              <Word>Page views, without cookies</Word>
            </ReadoutRow>
            <ReadoutRow label="Cookies">
              <Word>None</Word>
            </ReadoutRow>
            <ReadoutRow label="Forms that send data">
              <Word>None</Word>
            </ReadoutRow>
            <ReadoutRow label="Kept in this browser" stack>
              <Word>Appearance, units</Word>
            </ReadoutRow>
            <ReadoutRow label="Calculator entries">
              <Word>Not stored</Word>
            </ReadoutRow>
            <FactList
              className="mt-3 border-t border-separator pt-3"
              items={[
                "The site counts page views with Vercel Web Analytics and sets no cookies. A visit is recognized by a hash of the request, which is discarded after 24 hours, and each view records the page, the site that linked to it, an approximate location, and the browser, system and device type. Reports show totals only.",
                "The site runs no advertising or cross-site tracking scripts.",
                "There is no sign-up, newsletter or contact form, so no form on the site sends data.",
                "When you pick an appearance (Light or Dark) or a unit system, this browser’s local storage remembers it so the next page matches. The site does not send it anywhere, and clearing this site’s data in your browser removes it.",
                "Calculators run in your browser. What you type into them is not stored or sent, and it never appears in a page address.",
                "Fonts are served by this site, not by a font service.",
              ]}
            />
          </Panel.Body>
        </Panel>
        <div>
          <LinkButton href="/about" forward>
            Who makes the apps
          </LinkButton>
        </div>
      </Section>

      <Section
        id="vector-apps"
        eyebrow="Apps / Offline"
        title={`The ${site.series.label}`}
        intro={`${purchaseNames}: no account, no server and no analytics. Your records live in a database on your phone. These facts describe the apps as they are built today.`}
        bordered
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <Panel.Header eyebrow="Data / Storage" title="On your phone" />
            <Panel.Body>
              <FactList
                items={[
                  "No account and no sign-in.",
                  "The apps make no network requests of their own. Links to sources open in your browser.",
                  "No analytics or crash reporting.",
                  `Records live in a database on your phone. ${names.body} keeps progress photos in the app’s private storage.`,
                  `Reminders in ${names.hydration} are local notifications scheduled by the phone. There is no push server.`,
                  "If iCloud or Android device backup is on, it may include the apps’ data.",
                  `Erase all data in ${names.lift} and ${names.macros} removes the records the app holds. It cannot delete files you shared or records already in Apple Health or Health Connect. Deleting ${names.body} or ${names.hydration} may remove its records.`,
                ]}
              />
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Header eyebrow="Health / Sync" title="Off until you turn it on" />
            <Panel.Body>
              <Text tone="secondary">Apple Health on iPhone, Health Connect on Android. When sync is on:</Text>
              <TermList
                items={[
                  {
                    term: names.body,
                    detail:
                      "Weight and height sync in both directions. Body fat goes out to both, and waist circumference to Apple Health. Photos, the other tape measurements and calculated estimates stay in the app.",
                  },
                  {
                    term: names.lift,
                    detail:
                      "Body weight syncs in both directions. Finished workouts go out as strength training with their name and start and end times; sets and loads stay in the app. The Apple Watch app reads heart rate to show it live and discards its own session at the end; the phone saves the one workout.",
                  },
                  {
                    term: names.macros,
                    detail:
                      "Weight and height sync in both directions. Logged food goes out with its macros, vitamins and minerals.",
                  },
                  {
                    term: names.hydration,
                    detail:
                      "Non-alcoholic fluids and caffeine go out. Apple Health also receives standard drinks, and BAC estimates when they are on; on Android, alcohol and BAC stay on the phone. Your latest weight is read for the BAC estimate.",
                  },
                ]}
              />
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Header eyebrow="Data / Backup" title="Encrypted files, no server" />
            <Panel.Body>
              <Text tone="secondary">
                {names.lift} and {names.macros} save encrypted backup files where you choose, through the share sheet.
              </Text>
              <div>
                <ReadoutRow label="Encryption">
                  <span className="type-readout-s">AES-256-GCM</span>
                </ReadoutRow>
                <ReadoutRow label="Key from password" stack>
                  <span className="type-readout-s">PBKDF2-HMAC-SHA256</span>
                </ReadoutRow>
                <ReadoutRow label="Iterations">
                  <Value value="600,000" size="s" />
                </ReadoutRow>
                <ReadoutRow label="Password recovery">
                  <Word>None</Word>
                </ReadoutRow>
              </div>
              <FactList
                className="border-t border-separator pt-3"
                items={[
                  `Backup passwords are not stored, so a lost password cannot be recovered. ${names.lift} asks for at least 10 characters.`,
                  "A cloud destination you pick in the share sheet holds the file under its own terms.",
                  `Restoring a ${names.lift} backup replaces the records on the phone; it does not merge them. ${names.lift}’s CSV exports are not encrypted.`,
                  `${names.body} and ${names.hydration} have no backup in the app.`,
                ]}
              />
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Header eyebrow="Analysis / On device" title="No cloud fallback" />
            <Panel.Body>
              <Text tone="secondary">Where the apps use AI, the model runs on the phone.</Text>
              {/* Pendum Lift's on-device features are not verified on devices yet (app-facts lift.notYetShipped), so
                  it is not listed here until they ship. */}
              <TermList
                items={[
                  {
                    term: names.macros,
                    detail:
                      "Photo logging uses only on-device models. Meal photos are deleted from the app’s cache when the logger closes and are not stored with diary entries; label photos are deleted once read. Food search runs on catalogs stored on the phone.",
                  },
                  {
                    term: names.hydration,
                    detail:
                      "Describing your routine in plain words uses Apple’s on-device model. The description stays on the device.",
                  },
                  {
                    term: "On Android",
                    detail:
                      `In ${names.macros}, text recognition, the barcode scanner and Gemini Nano are Google system components that follow Google’s own terms. A one-time Gemini Nano download is a model download, not an upload of your records.`,
                  },
                ]}
              />
            </Panel.Body>
          </Panel>
        </div>
      </Section>

      <Section
        id="pendum-one"
        eyebrow="Apps / Subscription"
        title={subscriptionNames}
        intro={`${subscriptionNames} needs an account. Your logs are stored on the ${server}, so the same records open on each device you sign in on.`}
        bordered
      >
        <Panel className="max-w-form">
          <Panel.Header eyebrow="Account / Services" title="Where your data goes" />
          <Panel.Body className="gap-0">
            <ReadoutRow label="Sign-in">
              <Word>Clerk</Word>
            </ReadoutRow>
            <ReadoutRow label="Your logs">
              <Word>{server}</Word>
            </ReadoutRow>
            <ReadoutRow label="Hosting">
              <Word>Fly.io, United States</Word>
            </ReadoutRow>
            <ReadoutRow label="Database">
              <Word>PostgreSQL</Word>
            </ReadoutRow>
            <ReadoutRow label="Food search" stack>
              <Word>FatSecret Platform API</Word>
            </ReadoutRow>
            <ReadoutRow label="Billing" stack>
              <Word>RevenueCat, App Store, Google Play</Word>
            </ReadoutRow>
            <ReadoutRow label="Analytics" stack>
              <Word>{analyticsReadout}</Word>
            </ReadoutRow>
            <FactList
              className="mt-3 border-t border-separator pt-3"
              items={[
                `Sign-in and sign-up go through Clerk. The ${server} keeps a user record with your Clerk ID and email address.`,
                `Food, workouts, body records, plans, supplements and soreness are stored on the ${server}, hosted on Fly.io in the United States with a PostgreSQL database.`,
                `Food search, autocomplete and barcode lookups go through the ${server} to the FatSecret Platform API.`,
                "Purchases go through RevenueCat with App Store and Google Play billing. On iPhone, RevenueCat also collects Apple Search Ads attribution through Apple’s AdServices token, which needs no tracking permission prompt.",
                analyticsFact,
                `Health sync is off until you turn it on, and it turns off in Settings. It reads weight and steps and writes weight and daily calories, protein, carbs and fat. Weigh-ins it imports are saved to the ${server}.`,
                "The camera is used to scan barcodes. Microphone access is turned off.",
                "A few preferences, such as health sync settings, are kept on the device.",
                <>
                  To delete your account, open Settings and choose <strong>Delete account</strong>. Your data on
                  the {server} is deleted first, then your sign-in.
                </>,
              ]}
            />
          </Panel.Body>
        </Panel>
      </Section>

      <Section id="questions" eyebrow="Help / Support" title="Questions" bordered>
        <div className="flex flex-col items-start gap-3">
          <Text tone="secondary" className="max-w-[60ch] text-pretty">
            For anything this summary does not answer, start with the support page.
          </Text>
          <LinkButton href="/support" forward>
            Open support
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
