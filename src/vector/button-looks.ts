// The kit's button looks as data, in a module that imports nothing: ./button-link (HeroUI's buttonVariants on a Next
// link) and ./button-native (the same look on plain elements, for the islands every page carries) both read it, so
// a hover colour or a border token changes in one place and the two can no longer drift. HeroUI's button.css emits
// exactly `button--primary|outline|ghost`, `button--md|lg` and `button--icon-only`, which the native side joins by
// hand; shared geometry, focus and the colour-only press are in components.css.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

/** HeroUI's own variant behind a kit look. */
export type HeroVariant = "primary" | "outline" | "ghost";

export type ButtonLook = { hero: HeroVariant; className: string };

const hoverPressed = "[--button-bg-hover:var(--surface-secondary)] [--button-bg-pressed:var(--surface-secondary)]";

/**
 * The kit's four looks on HeroUI's button (§5.3): HeroUI supplies the behaviour and its variant, the kit supplies
 * the look through HeroUI's own --button-* properties.
 * primary: signal fill, #071017 label (one per page; HeroUI's primary already uses --accent / --accent-hover).
 * secondary: surface with a 1pt border-strong edge, never a grey fill. ghost: tint label. destructive: danger label,
 * no fill.
 */
export const buttonLooks: Record<ButtonVariant, ButtonLook> = {
  primary: { hero: "primary", className: "" },
  secondary: {
    hero: "outline",
    className: `border-border-strong [--button-bg:var(--surface)] ${hoverPressed} [--button-fg:var(--foreground)]`,
  },
  ghost: { hero: "ghost", className: `[--button-fg:var(--tint)] ${hoverPressed}` },
  destructive: { hero: "ghost", className: `[--button-fg:var(--danger)] ${hoverPressed}` },
};

/**
 * The icon button's two looks (§5.3): a 44×44 square whose glyph is foreground ink in both, ghost with no edge and
 * secondary with the 1pt edge. Stated as their own strings, with the one --button-fg each, so no joiner ever has to
 * merge two conflicting arbitrary properties (cx does not, and the stylesheet's order would decide).
 */
export const iconButtonLooks: Record<"ghost" | "secondary", ButtonLook> = {
  ghost: { hero: "ghost", className: `[--button-fg:var(--foreground)] ${hoverPressed}` },
  secondary: buttonLooks.secondary,
};

/** The LinkButton look (§5.3): tint 15/20 500, 44 tall, an optional trailing 17pt forward glyph. */
export const linkButtonClass =
  "inline-flex min-h-11 items-center gap-1 rounded-mark type-button text-tint underline-offset-4 hover:underline active:opacity-60";
