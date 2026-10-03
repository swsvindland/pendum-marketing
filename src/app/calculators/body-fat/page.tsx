import type { Metadata } from "next";
import { BodyFatPage } from "@/calculators/body-fat/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("body-fat");

export const metadata: Metadata = calculatorMetadata(meta);

export default function BodyFatRoute() {
  return <BodyFatPage meta={meta} />;
}
