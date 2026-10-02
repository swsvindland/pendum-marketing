import { Section } from "@/components/page";
import { Icon, Text } from "@/vector";

type Question = { q: string; a: string };

/** Each answer is checked against docs/sources/app-facts.json. No prices, trials or store links. */
const questions: Question[] = [
  {
    q: "What is the difference between OmegaFyt and the Vector apps?",
    a: "OmegaFyt is a subscription with an account. Your records are stored on the OmegaFyt server, so the same account opens on iPhone, Android and the web. Vector Body, Lift, Macros and Hydration are each a one-time purchase with no account. Each one keeps its records in a database on your phone and works offline.",
  },
  {
    q: "Do the Vector apps need an internet connection?",
    a: "No. The apps make no network requests of their own, so logging, search and every calculation work offline. Apple Health and Health Connect sync is optional and off until you turn it on. Lift and Macros can also write an encrypted backup file, which goes wherever you choose to save it.",
  },
  {
    q: "Can I use OmegaFyt on the web?",
    a: "Yes. The same account opens in a web browser. Subscriptions are bought only in the iPhone and Android apps, through the App Store or Google Play, and Health sync is in those apps only.",
  },
  {
    q: "Are the calculators free and private?",
    a: "Yes. Every calculator is free and needs no sign-up. Nothing you type is stored or sent anywhere. Results are general estimates, not medical advice.",
  },
  {
    q: "Which phones and devices are supported?",
    a: "Every app runs on iPhone and Android phones. Vector Lift and Vector Hydration also have an Apple Watch app, which needs the iPhone app. OmegaFyt also opens in a web browser. None of the apps has an iPad layout.",
  },
];

/**
 * Native disclosure rows: a 1pt separator between rows, 44 minimum, the question in body strong and a down glyph
 * that turns to point up when open. No animation; the browser handles keyboard and screen reader state.
 */
export function Faq() {
  return (
    <Section id="faq" bordered eyebrow="Help / FAQ" title="Common questions">
      <div className="max-w-form border-t border-separator">
        {questions.map(({ q, a }) => (
          <details key={q} className="group border-b border-separator">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-mark py-3 [&::-webkit-details-marker]:hidden">
              <Text variant="bodyStrong" as="span">
                {q}
              </Text>
              <Icon name="down" size={16} tone="muted" className="group-open:rotate-180" />
            </summary>
            <Text tone="secondary" className="pe-8 pb-4 text-pretty">
              {a}
            </Text>
          </details>
        ))}
      </div>
    </Section>
  );
}
