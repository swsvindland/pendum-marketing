import type { ReactNode } from "react";
import { Icon, LinkButton, Text } from "@/vector";
import { purchasePriced } from "./models";

type Question = { question: string; answer: ReactNode };

/**
 * Answers only what docs/sources/app-facts.json supports: purchases happen in the iOS and Android apps, any
 * trial comes from the store, an account without the subscription meets the paywall, and deleting the account
 * removes its records from the server. No retention period, refund rule or trial length is stated.
 */
const questions: Question[] = [
  {
    question: "What does it cost?",
    answer: (
      <>
        <Text tone="secondary">
          OmegaFyt Pro is billed by the App Store or Google Play. The paywall in the iPhone and Android apps lists
          the plans and prices the store offers.
        </Text>
        <Text tone="secondary">
          {purchasePriced
            ? "Each Vector app is a one-time purchase. Its price is listed with the app on this page."
            : "Each Vector app is a one-time purchase, with its price set at launch."}
        </Text>
      </>
    ),
  },
  {
    question: "Can I buy OmegaFyt Pro on the web?",
    answer: (
      <Text tone="secondary">
        No. OmegaFyt Pro is bought only in the iPhone and Android apps. The web version opens the same account, but
        it has no checkout.
      </Text>
    ),
  },
  {
    question: "Is there a free trial?",
    answer: (
      <Text tone="secondary">
        Only when the store offers one. The paywall shows a free trial or an introductory price if the App Store or
        Google Play has one for that plan and you are eligible. Its length is set in the store, not in the app.
      </Text>
    ),
  },
  {
    question: "How do I cancel OmegaFyt Pro?",
    answer: (
      <Text tone="secondary">
        In the subscription settings of the store you subscribed through: the App Store on iPhone or Google Play on
        Android. Deleting the app does not cancel the subscription.
      </Text>
    ),
  },
  {
    question: "Do the Vector apps ever need a subscription?",
    answer: (
      <Text tone="secondary">
        No. Body, Lift, Macros and Hydration are each a one-time purchase. They have no account and no server, so
        there is nothing to renew.
      </Text>
    ),
  },
  {
    question: "What happens to my data if I stop OmegaFyt Pro?",
    answer: (
      <>
        <Text tone="secondary">
          Without the subscription, the iPhone and Android apps open to the paywall. From there you can subscribe
          again, restore a purchase, sign out or delete the account.
        </Text>
        <Text tone="secondary">
          Deleting the account, in Settings or on the paywall, removes your records from the OmegaFyt server and
          then your sign-in.
        </Text>
      </>
    ),
  },
  {
    question: "Are the calculators free?",
    answer: (
      <>
        <Text tone="secondary">
          Yes. Every calculator on this site is free, with no sign-up. Nothing you type into one is stored or sent
          anywhere.
        </Text>
        <div>
          <LinkButton href="/calculators" forward>
            Open the calculators
          </LinkButton>
        </div>
      </>
    ),
  },
];

/**
 * Native disclosure rows (no script): a 44 minimum summary in body strong with a down glyph that turns when
 * open, the answer below. Rows are separated by 1pt rules inside one bordered panel.
 */
export function BillingFaq() {
  return (
    <div className="max-w-form overflow-clip rounded-panel border border-border bg-surface">
      {questions.map((q, i) => (
        <details key={q.question} className={i > 0 ? "group border-t border-separator" : "group"}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition-colors duration-100 ease-standard hover:bg-surface-secondary focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
            <Text as="span" variant="bodyStrong">
              {q.question}
            </Text>
            <Icon name="down" size={16} tone="muted" className="group-open:rotate-180" />
          </summary>
          <div className="flex max-w-[65ch] flex-col gap-3 px-4 pt-1 pb-4">{q.answer}</div>
        </details>
      ))}
    </div>
  );
}
