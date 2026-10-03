import type { Metadata } from "next";
import { PlatesPage } from "@/calculators/plates/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("plates");

export const metadata: Metadata = calculatorMetadata(meta);

export default function PlatesRoute() {
  return <PlatesPage meta={meta} />;
}
