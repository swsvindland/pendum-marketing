import type { CalculatorMeta } from "@/content/types";
import { CalculatorFrame } from "../shared/frame";

// STUB: replaced by the calculator build.
export function CalorieDeficitPage({ meta }: { meta: CalculatorMeta }) {
  return <CalculatorFrame meta={meta} intro={meta.description} tool={null} method={null} sources={[]} />;
}
