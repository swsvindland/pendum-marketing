import type { Metadata } from "next";
import { HeartRateZonesPage } from "@/calculators/heart-rate-zones/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("heart-rate-zones");

export const metadata: Metadata = calculatorMetadata(meta);

export default function HeartRateZonesRoute() {
  return <HeartRateZonesPage meta={meta} />;
}
