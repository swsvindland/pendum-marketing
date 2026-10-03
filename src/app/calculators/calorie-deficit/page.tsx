import type { Metadata } from "next";
import { CalorieDeficitPage } from "@/calculators/calorie-deficit/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("calorie-deficit");

export const metadata: Metadata = calculatorMetadata(meta);

export default function CalorieDeficitRoute() {
  return <CalorieDeficitPage meta={meta} />;
}
