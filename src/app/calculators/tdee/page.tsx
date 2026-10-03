import type { Metadata } from "next";
import { TdeePage } from "@/calculators/tdee/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("tdee");

export const metadata: Metadata = calculatorMetadata(meta);

export default function TdeeRoute() {
  return <TdeePage meta={meta} />;
}
