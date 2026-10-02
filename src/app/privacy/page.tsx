import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader, Section } from "@/components/page";
import { FactList, TermList } from "@/components/site/lists";
import { pageMetadata } from "@/components/site/metadata";
import { Callout, LinkButton, Panel, ReadoutRow, Text, Value } from "@/vector";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "A plain-language summary of what the Vector website, the four one-time purchase apps and OmegaFyt do with your data.",
  path: "/privacy",
});

/** The day this summary was last checked against docs/sources/app-facts.json and the site code. */
const updated = "2026-10-02";
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
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy / Summary"
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
        intro="The four one-time purchase apps keep your records on your phone. OmegaFyt, the subscription, keeps them on its server so one account works on each device you sign in on."
      >
        <Callout title="Summary / Not a policy">
          This page is a summary, not a privacy policy. Each app’s full privacy policy will be published with its
          store listing.
        </Callout>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <Panel>
            <Panel.Header eyebrow="Offline / One-time purchase" title="Vector Body, Lift, Macros and Hydration" />
            <Panel.Body className="gap-0">
              <ReadoutRow label="Account">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Where records live">
                <Word>On your phone</Word>
              </ReadoutRow>
              <ReadoutRow label="Analytics">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Health sync">
                <Word>Off until you turn it on</Word>
              </ReadoutRow>
              <ReadoutRow label="App backup">
                <Word>Encrypted file in Lift and Macros</Word>
              </ReadoutRow>
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Header eyebrow="Synced / Subscription" title="OmegaFyt" />
            <Panel.Body className="gap-0">
              <ReadoutRow label="Account">
                <Word>Required</Word>
              </ReadoutRow>
              <ReadoutRow label="Where records live">
                <Word>OmegaFyt server, United States</Word>
              </ReadoutRow>
              <ReadoutRow label="Analytics">
                <Word>PostHog, in the phone apps</Word>
              </ReadoutRow>
              <ReadoutRow label="Health sync">
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
        eyebrow="Site / Data"
        title="This website"
        intro="There is nothing to sign up for. The site works without an account and without cookies."
        bordered
      >
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
          <Panel>
            <Panel.Header eyebrow="Site / Readout" />
            <Panel.Body className="gap-0">
              <ReadoutRow label="Analytics">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Cookies">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Forms that send data">
                <Word>None</Word>
              </ReadoutRow>
              <ReadoutRow label="Kept in this browser">
                <Word>Appearance, units</Word>
              </ReadoutRow>
              <ReadoutRow label="Calculator entries">
                <Word>Not stored</Word>
              </ReadoutRow>
            </Panel.Body>
          </Panel>
          <Panel>
            <FactList
              items={[
                "The site runs no analytics, tracking or advertising scripts, and it sets no cookies.",
                "There is no sign-up, newsletter or contact form, so no form on the site sends data.",
                "When you pick an appearance (Light or Dark) or a unit system, this browser’s local storage remembers it so the next page matches. The site does not send it anywhere, and clearing this site’s data in your browser removes it.",
                "Calculators run in your browser. What you type into them is not stored or sent.",
                "Fonts are served by this site, not by a font service.",
              ]}
            />
          </Panel>
        </div>
      </Section>

      <Section
        id="vector-apps"
        eyebrow="Apps / Offline"
        title="Vector Body, Lift, Macros and Hydration"
        intro="No account, no server and no analytics. Your records live in a database on your phone. These facts describe the apps as they are built today."
        bordered
      >
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Panel>
            <Panel.Header eyebrow="Data / Storage" title="On your phone" />
            <Panel.Body>
              <FactList
                items={[
                  "No account and no sign-in.",
                  "The apps make no network requests of their own. Links to sources open in your browser.",
                  "No analytics or crash reporting.",
                  "Records live in a database on your phone. Vector Body keeps progress photos in the app’s private storage.",
                  "Reminders in Vector Hydration are local notifications scheduled by the phone. There is no push server.",
                  "If iCloud or Android device backup is on, it may include the apps’ data.",
                  "Erase all data in Vector Lift and Vector Macros removes the records the app holds. It cannot delete files you shared or records already in Apple Health or Health Connect. Deleting Vector Body or Vector Hydration may remove its records.",
                ]}
              />
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Header eyebrow="Health / Sync" title="Health sync is opt-in" />
            <Panel.Body>
              <Text tone="secondary">
                Sync with Apple Health or Health Connect is off until you turn it on. When it is on:
              </Text>
              <TermList
                items={[
                  {
                    term: "Vector Body",
                    detail:
                      "Weight and height sync in both directions. Body fat goes out to both, and waist circumference to Apple Health. Photos, the other tape measurements and calculated estimates stay in the app.",
                  },
                  {
                    term: "Vector Lift",
                    detail:
                      "Body weight syncs in both directions. Finished workouts go out as strength training with their name and start and end times; sets and loads stay in the app. The Apple Watch app reads heart rate to show it live and discards its own session at the end; the phone saves the one workout.",
                  },
                  {
                    term: "Vector Macros",
                    detail:
                      "Weight and height sync in both directions. Logged food goes out with its macros, vitamins and minerals.",
                  },
                  {
                    term: "Vector Hydration",
                    detail:
                      "Non-alcoholic fluids and caffeine go out. Apple Health also receives standard drinks, and BAC estimates when they are on; on Android, alcohol and BAC stay on the phone. Your latest weight is read for the BAC estimate.",
                  },
                ]}
              />
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Header eyebrow="Data / Backup" title="Backups" />
            <Panel.Body>
              <Text tone="secondary">
                Vector Lift and Vector Macros save encrypted backup files where you choose, through the share sheet.
                There is no backup server.
              </Text>
              <div>
                <ReadoutRow label="Encryption">
                  <Word>AES-256-GCM</Word>
                </ReadoutRow>
                <ReadoutRow label="Key from password">
                  <Word>PBKDF2-HMAC-SHA256</Word>
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
                  "Backup passwords are not stored, so a lost password cannot be recovered. Vector Lift asks for at least 10 characters.",
                  "A cloud destination you pick in the share sheet holds the file under its own terms.",
                  "Restoring a Vector Lift backup replaces the records on the phone; it does not merge them. Lift’s CSV exports are not encrypted.",
                  "Vector Body and Vector Hydration have no backup in the app.",
                ]}
              />
            </Panel.Body>
          </Panel>

          <Panel>
            <Panel.Header eyebrow="Analysis / On device" title="On-device AI only" />
            <Panel.Body>
              <Text tone="secondary">Where the apps use AI, they use the phone’s own model, with no cloud fallback.</Text>
              <TermList
                items={[
                  {
                    term: "Vector Lift",
                    detail:
                      "Apple Foundation Models on iPhone, never Private Cloud Compute, and Gemini Nano on Android. The app’s copy of a program photo is deleted once it is read.",
                  },
                  {
                    term: "Vector Macros",
                    detail:
                      "Photo logging uses only on-device models. Meal photos are deleted from the app’s cache when the logger closes and are not stored with diary entries; label photos are deleted once read. Food search runs on catalogs stored on the phone.",
                  },
                  {
                    term: "Vector Hydration",
                    detail:
                      "Describing your routine in plain words uses Apple’s on-device model. The description stays on the device.",
                  },
                  {
                    term: "On Android",
                    detail:
                      "In Vector Macros, text recognition, the barcode scanner and Gemini Nano are Google system components that follow Google’s own terms. A one-time Gemini Nano download is a model download, not an upload of your records.",
                  },
                ]}
              />
            </Panel.Body>
          </Panel>
        </div>
      </Section>

      <Section
        id="omegafyt"
        eyebrow="Apps / Subscription"
        title="OmegaFyt"
        intro="OmegaFyt needs an account. Your logs are stored on the OmegaFyt server, so the same records open on each device you sign in on."
        bordered
      >
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
          <Panel>
            <Panel.Header eyebrow="Account / Services" title="Where your data goes" />
            <Panel.Body className="gap-0">
              <ReadoutRow label="Sign-in">
                <Word>Clerk</Word>
              </ReadoutRow>
              <ReadoutRow label="Your logs">
                <Word>OmegaFyt server</Word>
              </ReadoutRow>
              <ReadoutRow label="Hosting">
                <Word>Fly.io, United States</Word>
              </ReadoutRow>
              <ReadoutRow label="Database">
                <Word>PostgreSQL</Word>
              </ReadoutRow>
              <ReadoutRow label="Food search">
                <Word>FatSecret Platform API</Word>
              </ReadoutRow>
              <ReadoutRow label="Billing">
                <Word>RevenueCat, App Store, Google Play</Word>
              </ReadoutRow>
              <ReadoutRow label="Analytics">
                <Word>PostHog, in the phone apps</Word>
              </ReadoutRow>
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Header eyebrow="Account / Details" title="What is shared" />
            <Panel.Body>
              <FactList
                items={[
                  "Sign-in and sign-up go through Clerk. The OmegaFyt server keeps a user record with your Clerk ID and email address.",
                  "Food, workouts, body records, plans, supplements, soreness and gyms are stored on the OmegaFyt server, hosted on Fly.io in the United States with a PostgreSQL database.",
                  "Food search, autocomplete and barcode lookups go through the OmegaFyt server to the FatSecret Platform API.",
                  "Purchases go through RevenueCat with App Store and Google Play billing. On iPhone, RevenueCat also collects Apple Search Ads attribution through Apple’s AdServices token, which needs no tracking permission prompt.",
                  "The iPhone and Android apps send usage events, screen names, taps and error reports to PostHog, which also runs feature flags. Events leave out weight, height, sex and measurements, and include plan choices such as goal, weekly pace, plan length and training days. Taps record which control was used, never the text on it. There is no session replay. OmegaFyt in a browser sends no analytics.",
                  "Health sync is off until you turn it on, and it turns off in Settings. It reads weight and steps and writes weight and daily calories, protein, carbs and fat. Weigh-ins it imports are saved to the OmegaFyt server.",
                  "The camera is used to scan barcodes. Microphone access is turned off.",
                  "A few preferences, such as the rest timer and health sync settings, are kept on the device.",
                  <>
                    To delete your account, open Settings and choose <strong>Delete account</strong>. Your data on the
                    OmegaFyt server is deleted first, then your sign-in.
                  </>,
                ]}
              />
            </Panel.Body>
          </Panel>
        </div>
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
