import { Glyph, type GlyphSize, type GlyphTone } from "./glyph";
import { iconPaths, mirroredIcons, type IconName } from "./icon-paths";

export type { IconName };

/**
 * A kit glyph by name (Ionicons outline, the apps' default renderer), looked up in the generated table: for server
 * components and for parents that hand a glyph to a client part as a ReactNode. A client file draws a glyph with
 * Glyph (glyph.tsx) and one module from ./glyphs instead, so the table never enters the client bundle. 12 is the
 * Choices check slot, 17 the Button glyph, 20 the default. Decorative unless `label` is given. Directional glyphs
 * mirror under RTL. `data-*` attributes pass through.
 */
export function Icon({
  name,
  ...rest
}: {
  name: IconName;
  size?: GlyphSize;
  tone?: GlyphTone;
  label?: string;
  className?: string;
  [attribute: `data-${string}`]: string | boolean | undefined;
}) {
  return <Glyph markup={iconPaths[name]} name={name} mirrored={mirroredIcons.has(name)} {...rest} />;
}
