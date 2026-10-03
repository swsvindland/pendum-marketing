import { Section } from "@/components/page";
import { Disclosures } from "@/vector/disclosure";

type Question = { q: string; a: string };

/**
 * Each answer is checked against docs/sources/app-facts.json. No prices, trials or store links. The OmegaFyt web
 * address is not public yet, so the web version is described, never offered as something to open today.
 */
const questions: Question[] = [
  {
    q: "What is the difference between OmegaFyt and the Vector apps?",
    a: "OmegaFyt is a subscription with an account. Your records are stored on the OmegaFyt server, so the same records open on each iPhone or Android phone you sign in on. Vector Body, Lift, Macros and Hydration are each a one-time purchase with no account. Each one keeps its records in a database on your phone and works offline.",
  },
  {
    q: "Do the Vector apps need an internet connection?",
    a: "No. The apps make no network requests of their own, so logging, search and every calculation work offline. Apple Health and Health Connect sync is optional and off until you turn it on. Lift and Macros can also write an encrypted backup file, which goes wherever you choose to save it.",
  },
  {
    q: "Can I use OmegaFyt on the web?",
    a: "OmegaFyt has a web version that opens the same account in a browser. Its address is published at launch. Subscriptions are bought only in the iPhone and Android apps, through the App Store or Google Play, and Health sync is in those apps only.",
  },
  {
    q: "Are the calculators free and private?",
    a: "Yes. Every calculator is free and needs no sign-up. Nothing you type is stored or sent anywhere. Results are general estimates, not medical advice.",
  },
  {
    q: "Which phones and devices are supported?",
    a: "Every app runs on iPhone and Android phones. Vector Lift and Vector Hydration also have an Apple Watch app, which needs the iPhone app. OmegaFyt also has a web version for the same account, with its address published at launch. None of the apps has an iPad layout.",
  },
];

/** Kit disclosure rows (HeroUI Accordion) on the canvas between 1pt rules. */
export function Faq() {
  return (
    <Section id="faq" bordered eyebrow="Help / Apps and calculators" title="Common questions">
      <Disclosures
        look="plain"
        className="max-w-form"
        items={questions.map(({ q, a }) => ({ question: q, answer: <p className="text-pretty">{a}</p> }))}
      />
    </Section>
  );
}
