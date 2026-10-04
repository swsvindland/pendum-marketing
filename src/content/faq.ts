import { analyticsSentence, priceShort, purchaseApps, subscriptionApp } from "./apps";
import { lowerFirst } from "./format";
import type { Question } from "./types";

/**
 * The site-level questions as plain strings, so the same text feeds the page and FAQPage structured data. Every
 * answer is checked against docs/sources/app-facts.json and docs/sources/owner-decisions.md: prices and trials only
 * from the content (the owner's decision of 2026-10-04), no store links or launch dates, full product names in every
 * answer, and the Pendum One web address described as not public yet. Per-app questions live on each app in apps.ts (`faq`); calculator questions in calculators.ts.
 */

/** A titled group of questions, as the support page renders them. */
export type QuestionGroup = {
  id: string;
  title: string;
  intro?: string;
  items: Question[];
};

/** The home page's common questions. The models comparison answers "Pendum One or a Pendum app" on its own. */
export const homeQuestions: Question[] = [
  {
    question: "Do the Pendum apps need an internet connection?",
    answer:
      "No. Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration make no network requests of their own, so logging, search and every calculation work offline. Apple Health and Health Connect sync is optional and off until you turn it on. Pendum Lift and Pendum Macros can also write an encrypted backup file, which goes wherever you choose to save it.",
  },
  {
    question: "Can I use Pendum One on the web?",
    answer:
      "Pendum One has a web version that opens the same account in a browser; its address is not public yet. Subscriptions are bought only in the iPhone and Android apps, through the App Store or Google Play, and health sync is in those apps only.",
  },
  {
    question: "Are the calculators free and private?",
    answer:
      "Yes. Every calculator is free and needs no sign-up. Nothing you type is stored or sent anywhere. Results are general estimates, not medical advice.",
  },
  {
    question: "Which phones and devices are supported?",
    answer:
      "Every app runs on iPhone and Android phones. Pendum Lift and Pendum Hydration also have an Apple Watch app, which needs the iPhone app. None of the apps has an iPad layout.",
  },
  {
    question: "Do the Pendum apps have ads, analytics or tracking?",
    // The Pendum One clause is gated on its version with the analytics row in apps.ts (analyticsSentence).
    answer: `No. Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration have no ads, no analytics and no crash reporting, and make no network requests of their own.${subscriptionApp ? ` ${subscriptionApp.name}: ${lowerFirst(analyticsSentence(subscriptionApp))}` : ""}`,
  },
  {
    question: "What happens to my records if I delete a Pendum app?",
    answer:
      "Pendum Lift and Pendum Macros can save an encrypted backup file first; keep its password, because it cannot be recovered. Pendum Body and Pendum Hydration have no backup in the app, so deleting either may remove its records. Your phone’s own device backup may include an app’s data.",
  },
];

/**
 * The pricing page's billing questions. Purchases happen in the iPhone and Android apps, the four Pendum apps are
 * single purchases, an account without the subscription meets the paywall, and deleting the account removes its
 * records from the server. Every price and trial is read from the content (apps.ts), so an answer can never disagree
 * with the plan panels. No retention period or refund rule is stated.
 */

/** "Pendum Body $9.99 once, Pendum Lift $19.99 once after a 21-day free trial, …" from the content's prices. */
const purchasePriceList = purchaseApps
  .filter((a) => a.price)
  .map((a) => `${a.name} ${priceShort(a)}`)
  .join("; ");
const trialApps = purchaseApps.filter((a) => a.unlock && a.trial);
export const billingQuestions: Question[] = [
  {
    question: "What does it cost?",
    answer: subscriptionApp?.price
      ? `${subscriptionApp.name} is free to download, and its subscription is ${priceShort(subscriptionApp)}, billed by the App Store or Google Play. Creating an account is free.`
      : "Pendum One is billed by the App Store or Google Play; creating an account is free.",
    paragraphs: [
      purchasePriceList
        ? `Each Pendum app is a one-time purchase: ${purchasePriceList}. Nothing renews.`
        : "Each Pendum app is a one-time purchase.",
    ],
  },
  {
    question: "Can I buy Pendum One on the web?",
    answer:
      "No. Pendum One is bought only in the iPhone and Android apps. The Pendum One web version opens the same account, but it has no checkout.",
  },
  {
    question: "Is there a free trial?",
    answer: [
      subscriptionApp?.trial
        ? `Yes. New subscribers to the ${subscriptionApp.name} ${subscriptionApp.trial.plan === "month" ? "monthly" : "yearly"} plan start with a ${subscriptionApp.trial.days}-day free trial; the other plan has no trial. Cancel in the store before the trial ends and you are not charged.`
        : "",
      trialApps.length
        ? `${trialApps.map((a) => a.name).join(" and ")} are free to download with a ${trialApps[0].trial?.days}-day free trial before the one-time unlock. ${purchaseApps.filter((a) => !a.unlock).map((a) => a.name).join(" and ")} are paid downloads with no trial.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  },
  {
    question: "How do I cancel Pendum One?",
    answer:
      "In the subscription settings of the store you subscribed through: the App Store on iPhone or Google Play on Android. Deleting the Pendum One app does not cancel the subscription.",
  },
  {
    question: "Do the Pendum apps need a subscription?",
    answer:
      "No. Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration are each sold as a one-time purchase with no account and no server, so nothing in them renews or expires. Only Pendum One has a subscription.",
  },
  {
    question: "Do I buy the four Pendum apps separately?",
    answer: "Yes. Each of the four Pendum apps is a one-time purchase with its own records. Buy the ones you use.",
  },
  {
    question: "Does Pendum One include the Pendum apps?",
    answer:
      "No. The Pendum One subscription covers Pendum One only. The four Pendum apps have no subscription and are bought separately.",
  },
  {
    question: "What happens to my data if I stop Pendum One?",
    answer:
      "Without the subscription, the Pendum One iPhone and Android apps open to the paywall. From there you can subscribe again, restore a purchase, sign out or delete the account.",
    paragraphs: [
      "Deleting the account, in Settings or on the paywall, removes your records from the Pendum One server and then your sign-in.",
    ],
  },
  {
    question: "Are the calculators free?",
    answer:
      "Yes. Every calculator on this site is free, with no sign-up. Nothing you type into one is stored or sent anywhere.",
    action: { href: "/calculators", label: "Open the calculators" },
  },
];

/** The support page's groups. Each answer says what happens, then what to do. */
export const supportGroups: QuestionGroup[] = [
  {
    id: "health",
    title: "Health sync",
    intro: "Apple Health on iPhone, Health Connect on Android. Sync is off until you turn it on in each app.",
    items: [
      {
        question: "Why do some Apple Health records not appear?",
        answer:
          "iOS does not tell an app when you deny read access. Apple Health may hide the records instead, so the app cannot show what is missing. In the Settings app, open Privacy & Security, then Health, choose the app and turn on the data you want it to read.",
        paragraphs: [
          "In Pendum Body, imports are snapshots: deleting a record in Apple Health does not remove it from the app.",
        ],
      },
      {
        question: "Why did Health Connect import only recent records?",
        answer:
          "Pendum Body imports the most recent 29 days from Health Connect, and Pendum Hydration reads weight from the last 29 days. Older history stays in Health Connect.",
        paragraphs: [
          "Pendum Body also needs every permission it asks for: read and write weight and height, and write body fat. Health Connect has to be available on the phone.",
        ],
      },
    ],
  },
  {
    id: "backups",
    title: "Backups and records",
    items: [
      {
        question: "What if I forgot my backup password?",
        answer:
          "It cannot be recovered. Pendum Lift and Pendum Macros do not store backup passwords, and a backup is encrypted with its password, so it cannot be opened without it.",
        paragraphs: ["Make a new backup now, and keep its password somewhere safe."],
      },
      {
        question: "Does restoring a backup merge records?",
        answer:
          "No. In Pendum Lift, a restore replaces the records on the phone. Before it does, the app saves an encrypted recovery copy of the records it replaces.",
      },
      {
        question: "Can I move my Pendum Lift or Pendum Macros records to a new phone?",
        answer:
          "Yes. Make an encrypted backup in the app, save it where you choose, install the app on the new phone and restore it with the same password. In Pendum Lift, a restore replaces the records on the phone.",
      },
      {
        question: "Can support restore my records?",
        answer:
          "No. Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration have no account and no server, so support holds no copy of your records. They are in the app on your phone, in its device backup if that is on, and in any backup files you saved. Apple Health or Health Connect holds what sync shares, if sync is on.",
        paragraphs: [
          "Pendum Body and Pendum Hydration have no backup in the app, and deleting either app may remove its records.",
        ],
      },
    ],
  },
  {
    id: "reminders",
    title: "Reminders",
    items: [
      {
        question: "Why did Pendum Hydration reminders stop?",
        answer:
          "Reminders are local notifications. The phone schedules up to 60 at a time, about 4 days ahead, and they run out if the app is not opened for several days. Open Pendum Hydration every few days to schedule the next ones.",
        paragraphs: [
          "The system decides when background rescheduling runs, and it may not run after you force-quit the app. Reminders are off until you turn them on.",
        ],
      },
    ],
  },
  {
    id: "pendum-one",
    title: "Pendum One account",
    items: [
      {
        question: "How do I delete my Pendum One account?",
        answer:
          "Open Settings in Pendum One and choose Delete account. Your data on the Pendum One server is deleted first, then your sign-in. Without a subscription, Delete account is also on the subscription screen.",
        paragraphs: ["A subscription is billed by the App Store or Google Play. Cancel it there."],
      },
      {
        question: "Where do I subscribe?",
        answer:
          "In the Pendum One app on iPhone or Android, through the App Store or Google Play. Pendum One in a browser has no checkout.",
      },
    ],
  },
  {
    id: "calculators",
    title: "Calculators",
    items: [
      {
        question: "Is what I type into a calculator saved?",
        answer:
          "No. Calculators run in your browser, and nothing you type is stored or sent. This browser remembers only your unit and appearance choices.",
      },
      {
        question: "Are the results medical advice?",
        answer:
          "No. They are general estimates. Each calculator page shows how it is calculated and the sources it uses.",
      },
    ],
  },
];
