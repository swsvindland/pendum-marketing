import type { ReactNode } from "react";
import { Disclosures } from "@/vector/disclosure";

export type Question = { question: string; answer: ReactNode };

/** Questions as kit disclosure rows (HeroUI Accordion) in a panel: §5.6 row geometry, several open at once. */
export function Faq({ items }: { items: Question[] }) {
  return <Disclosures items={items} />;
}
