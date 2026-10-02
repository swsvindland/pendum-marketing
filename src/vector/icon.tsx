import { cn } from "./cn";
import { iconPaths, mirroredIcons, type IconName } from "./icon-paths";

export type { IconName };

const toneClass = {
  foreground: "text-foreground",
  secondary: "text-foreground-secondary",
  muted: "text-muted",
  tint: "text-tint",
  onSignal: "text-accent-foreground",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
  inherit: "",
} as const;

/**
 * A kit glyph (Ionicons outline, the apps' default renderer). 12 is the Choices check slot, 17 the Button glyph,
 * 20 the default. Decorative unless `label` is given. Directional glyphs mirror under RTL. The size is inline so
 * HeroUI's slot CSS (which sizes any svg inside a button) never changes it.
 */
export function Icon({
  name,
  size = 20,
  tone = "inherit",
  label,
  className,
}: {
  name: IconName;
  size?: 12 | 16 | 17 | 20 | 24 | 32;
  tone?: keyof typeof toneClass;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-kit-icon={name}
      className={cn("kit-icon shrink-0", toneClass[tone], mirroredIcons.has(name) && "rtl:-scale-x-100", className)}
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
    />
  );
}
