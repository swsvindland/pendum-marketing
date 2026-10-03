import type { Metadata } from "next";
import { StrengthScorePage } from "@/calculators/strength-score/page";
import { calculatorMeta, calculatorMetadata } from "@/calculators/registry";

const meta = calculatorMeta("strength-score");

export const metadata: Metadata = calculatorMetadata(meta);

export default function StrengthScoreRoute() {
  return <StrengthScorePage meta={meta} />;
}
