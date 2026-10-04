import type { Question } from "@/content/types";
import { LinkButton, Text } from "@/vector";
import type { DisclosureItem } from "@/vector/disclosure";

/** A content question's answer: its paragraphs as secondary text, then its one link, if any. */
export function Answer({ question }: { question: Question }) {
  return (
    <>
      <Text tone="secondary" className="text-pretty">
        {question.answer}
      </Text>
      {question.paragraphs?.map((p) => (
        <Text key={p} tone="secondary" className="text-pretty">
          {p}
        </Text>
      ))}
      {question.action ? (
        <div>
          <LinkButton href={question.action.href} forward>
            {question.action.label}
          </LinkButton>
        </div>
      ) : null}
    </>
  );
}

/** Content questions as kit disclosure rows. The same strings feed FAQPage structured data (faqPage in content). */
export const toDisclosureItems = (questions: readonly Question[]): DisclosureItem[] =>
  questions.map((q) => ({ id: q.question, question: q.question, answer: <Answer question={q} /> }));
