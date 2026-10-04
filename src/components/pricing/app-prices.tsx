import { site } from "@/content/site";
import { PriceReadout } from "@/components/apps/price";
import { ListRow, Panel, RowList } from "@/vector";
import { purchaseApps } from "./models";

/**
 * The four Pendum apps as one ruled list: the app's glyph, its name, its tagline and one chevron each, with the
 * price in the trailing slot ("$19.99 once"). The model is said once, in the section intro,
 * so nothing here repeats it.
 */
export function AppPrices() {
  return (
    <Panel inset="none">
      <RowList aria-label={site.series.label}>
        {purchaseApps.map((app) => (
          <ListRow
            key={app.slug}
            title={app.name}
            description={app.tagline}
            icon={app.glyph}
            href={`/apps/${app.slug}`}
            value={app.price ? <PriceReadout app={app} /> : undefined}
          />
        ))}
      </RowList>
    </Panel>
  );
}
