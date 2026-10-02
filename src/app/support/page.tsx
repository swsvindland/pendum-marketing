import type { Metadata } from "next";
import { PageHeader } from "@/components/page";
import { Faq, type Question } from "@/components/site/faq";
import { Group } from "@/components/site/group";
import { pageMetadata } from "@/components/site/metadata";
import { site } from "@/content/site";
import { ButtonLink, LinkButton, Note, Panel, Status, Text } from "@/vector";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "How to reach support, and answers about Health sync, backups, reminders, OmegaFyt accounts and the calculators.",
  path: "/support",
});

// Answers come from docs/sources/app-facts.json. Each one says what happens, then what to do (§10).
const groups: { id: string; title: string; intro?: string; items: Question[] }[] = [
  {
    id: "health",
    title: "Health sync",
    intro: "Apple Health on iPhone, Health Connect on Android. Sync is off until you turn it on in each app.",
    items: [
      {
        question: "Some Apple Health records do not appear",
        answer: (
          <>
            <p>
              iOS does not tell an app when you deny read access. Apple Health may hide the records instead, so the
              app cannot show what is missing. In the Settings app, open Privacy &amp; Security, then Health, choose
              the app and turn on the data you want it to read.
            </p>
            <p>
              In Vector Body, imports are snapshots: deleting a record in Apple Health does not remove it from the
              app.
            </p>
          </>
        ),
      },
      {
        question: "Health Connect imported only recent records",
        answer: (
          <>
            <p>
              Vector Body imports the most recent 29 days from Health Connect, and Vector Hydration reads weight from
              the last 29 days. Older history stays in Health Connect.
            </p>
            <p>
              Vector Body also needs every permission it asks for: read and write weight and height, and write body
              fat. Health Connect has to be available on the phone.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "backups",
    title: "Backups and records",
    items: [
      {
        question: "I forgot my backup password",
        answer: (
          <>
            <p>
              It cannot be recovered. Vector Lift and Vector Macros do not store backup passwords, and a backup is
              encrypted with its password, so it cannot be opened without it.
            </p>
            <p>Make a new backup now, and keep its password somewhere safe.</p>
          </>
        ),
      },
      {
        question: "Does restoring a backup merge records?",
        answer: (
          <p>
            No. In Vector Lift, a restore replaces the records on the phone. Before it does, the app saves an
            encrypted recovery copy of the records it replaces.
          </p>
        ),
      },
      {
        question: "Can support restore my records?",
        answer: (
          <>
            <p>
              No. Vector Body, Lift, Macros and Hydration have no account and no server, so your records are only on
              your phone, in its device backup if that is on, and in backup files you saved.
            </p>
            <p>
              Vector Body and Vector Hydration have no backup in the app, and deleting either app may remove its
              records.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "reminders",
    title: "Reminders",
    items: [
      {
        question: "Vector Hydration reminders stopped",
        answer: (
          <>
            <p>
              Reminders are local notifications. The phone schedules up to 60 at a time, about four days ahead, and
              they run out if the app is not opened for several days. Open Vector Hydration every few days to
              schedule the next ones.
            </p>
            <p>
              The system decides when background rescheduling runs, and it may not run after you force-quit the app.
              Reminders are off until you turn them on.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "omegafyt",
    title: "OmegaFyt account",
    items: [
      {
        question: "How do I delete my OmegaFyt account?",
        answer: (
          <>
            <p>
              Open Settings in OmegaFyt and choose <strong>Delete account</strong>. Your data on the OmegaFyt server
              is deleted first, then your sign-in. Without a subscription, Delete account is also on the
              subscription screen.
            </p>
            <p>A subscription is billed by the App Store or Google Play. Cancel it there.</p>
          </>
        ),
      },
      {
        question: "Where do I subscribe?",
        answer: (
          <p>
            In the OmegaFyt app on iPhone or Android, through the App Store or Google Play. OmegaFyt in a browser has
            no checkout.
          </p>
        ),
      },
    ],
  },
  {
    id: "calculators",
    title: "Calculators",
    items: [
      {
        question: "Is what I type into a calculator saved?",
        answer: (
          <p>
            No. Calculators run in your browser, and nothing you type is stored or sent. The site remembers only your
            unit choice, in this browser.
          </p>
        ),
      },
      {
        question: "Are the results medical advice?",
        answer: (
          <p>
            No. They are general estimates. Each calculator page shows how it is calculated and the sources it
            uses.
          </p>
        ),
      },
    ],
  },
];

/** How to get help: the support address (once the owner sets one), then answers drawn from the fact sheets. */
export default function SupportPage() {
  const email = site.supportEmail;
  return (
    <>
      <PageHeader
        eyebrow="Help / Apps and calculators"
        title="Support"
        subtitle="Answers to the questions that come up most, and how to reach us."
      />
      <div className="mx-auto flex w-full max-w-data flex-col px-gutter py-10 md:py-12">
        <Group
          id="contact"
          title="Contact"
          intro={email ? "Say which app you use, and on which phone and system version." : undefined}
          footnote={
            <LinkButton href="/privacy" forward>
              Read the privacy summary
            </LinkButton>
          }
        >
          <Panel>
            <Panel.Header eyebrow="Support / Email" />
            <Panel.Body>
              {email ? (
                <>
                  <Text>
                    Write to <span className="[overflow-wrap:anywhere]">{email}</span>.
                  </Text>
                  <div>
                    <ButtonLink href={`mailto:${email}`} variant="primary">
                      Email support
                    </ButtonLink>
                  </div>
                </>
              ) : (
                <>
                  <Status state="idle" label="Support address coming soon" />
                  <Note>Until it is published, the answers below cover the most common questions.</Note>
                </>
              )}
            </Panel.Body>
          </Panel>
        </Group>
        {groups.map((g) => (
          <Group key={g.id} id={g.id} title={g.title} intro={g.intro}>
            <Faq items={g.items} />
          </Group>
        ))}
      </div>
    </>
  );
}
