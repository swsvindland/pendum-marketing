import type { Metadata } from "next";
import { FfmiPage } from "@/calculators/ffmi/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("ffmi");

export const metadata: Metadata = calculatorMetadata(meta);

export default function FfmiRoute() {
  return <FfmiPage meta={meta} />;
}
