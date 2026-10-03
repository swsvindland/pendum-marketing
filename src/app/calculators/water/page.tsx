import type { Metadata } from "next";
import { WaterPage } from "@/calculators/water/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("water");

export const metadata: Metadata = calculatorMetadata(meta);

export default function WaterRoute() {
  return <WaterPage meta={meta} />;
}
