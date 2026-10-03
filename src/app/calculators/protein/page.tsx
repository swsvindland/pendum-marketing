import type { Metadata } from "next";
import { ProteinPage } from "@/calculators/protein/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("protein");

export const metadata: Metadata = calculatorMetadata(meta);

export default function ProteinRoute() {
  return <ProteinPage meta={meta} />;
}
