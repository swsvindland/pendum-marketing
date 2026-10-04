import type { App, Price } from "@/content/types";
import { Text, Value } from "@/vector";

const per: Record<Price["period"], string> = { once: "once", month: "a month", year: "a year" };

/**
 * An app's price as kit readouts, the amount in the readout role and the period as its muted unit: "$19.99 once",
 * or a subscription's plans, "$7.99 a month or $49.99 a year". Nothing while the app has no price, so an unpriced
 * app never shows a placeholder. Prices come from src/content/apps.ts only.
 */
export function PriceReadout({
  app,
  size = "xs",
  tone = "muted",
}: {
  app: Pick<App, "price" | "plans">;
  size?: "xs" | "s" | "m";
  tone?: "muted" | "default";
}) {
  const list = app.plans?.length ? app.plans : app.price ? [app.price] : [];
  if (!list.length) return null;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      {list.map((price, i) => (
        <span key={`${price.period}-${price.amount}`} className="inline-flex items-baseline gap-x-1.5">
          {i > 0 ? (
            <Text as="span" variant="caption" tone="muted">
              or
            </Text>
          ) : null}
          <Value value={price.display} unit={per[price.period]} size={size} tone={tone} />
        </span>
      ))}
    </span>
  );
}
