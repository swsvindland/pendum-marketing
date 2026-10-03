import type { Metadata } from "next";
import { BmiPage } from "@/calculators/bmi/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("bmi");

export const metadata: Metadata = calculatorMetadata(meta);

export default function BmiRoute() {
  return <BmiPage meta={meta} />;
}
