import type { Metadata } from "next";
import { MacrosPage } from "@/calculators/macros/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("macros");

export const metadata: Metadata = calculatorMetadata(meta);

export default function MacrosRoute() {
  return <MacrosPage meta={meta} />;
}
