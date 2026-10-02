import type { Feature } from "@/content/types";
import { Heading, Icon, Text, type IconName } from "@/vector";

/**
 * Features as a sterile grid: each cell starts on a 1pt rule with a glyph, a Heading 3 and one or two sentences.
 * `fallbackIcon` fills a cell whose feature names no glyph when others do, so the cells stay aligned.
 * One column on phones, two from 640, three from 1024. No panels, no fills: the rules and the grid do the work.
 */
export function FeatureGrid({ items, fallbackIcon }: { items: Feature[]; fallbackIcon: IconName }) {
  // Glyphs only when the copy names them: one glyph repeated down every cell is noise, not structure.
  const glyphs = items.some((f) => f.icon);
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f) => (
        <li key={f.title} className="flex flex-col gap-2 border-t border-border pt-4">
          {glyphs ? <Icon name={f.icon ?? fallbackIcon} size={24} tone="foreground" className="mb-1" /> : null}
          <Heading level={3}>{f.title}</Heading>
          <Text tone="secondary" className="text-pretty">
            {f.body}
          </Text>
        </li>
      ))}
    </ul>
  );
}
