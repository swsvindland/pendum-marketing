import type { ReactNode } from "react";
import { LinkButton, Text } from "@/vector";
import { Disclosures } from "@/vector/disclosure";
import { purchasePriced } from "./models";

type Question = { question: string; answer: ReactNode };

/**
 * Answers only what docs/sources/app-facts.json and the owner's decisions support: purchases happen in the
 * iPhone and Android apps, the four Vector apps are single purchases (docs/sources/owner-decisions.md), any
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
    question: "Do the Vector apps need a subscription?",
    answer: (
      <Text tone="secondary">
        No. Body, Lift, Macros and Hydration are each sold as a one-time purchase. They have no account and no
        server, so there is nothing to renew.
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

/** The billing questions as kit disclosure rows (HeroUI Accordion) in one bordered panel. */
export function BillingFaq() {
  return <Disclosures items={questions} className="max-w-form" />;
}
