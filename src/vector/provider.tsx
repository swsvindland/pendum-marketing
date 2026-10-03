"use client";

import { I18nProvider } from "@heroui/react/rac";
import type { ReactNode } from "react";

/**
 * The kit's locale for React Aria, set to the page's language. Without it React Aria takes navigator.language, so
 * an Arabic or Hebrew browser would reverse the arrow keys in Choices on this left-to-right English page.
 */
export function VectorProvider({ locale = "en-US", children }: { locale?: string; children: ReactNode }) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
