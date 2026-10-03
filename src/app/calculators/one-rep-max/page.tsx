import type { Metadata } from "next";
import { OneRepMaxPage } from "@/calculators/one-rep-max/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("one-rep-max");

export const metadata: Metadata = calculatorMetadata(meta);

export default function OneRepMaxRoute() {
  return <OneRepMaxPage meta={meta} />;
}
