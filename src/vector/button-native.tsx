import Link from "next/link";
import type { ComponentProps, ReactNode, Ref } from "react";
import { buttonLooks, iconButtonLooks, linkButtonClass, type ButtonLook, type ButtonVariant } from "./button-looks";
import { cx } from "./cx";
import { Glyph } from "./glyph";
import { forward } from "./glyphs/forward";

// The Button and LinkButton looks on plain elements, with no HeroUI, React Aria, tailwind-variants or icon table
// behind them: for the client islands that every page carries (the error boundaries, the mobile nav), which must
// not pull those into the bundle of pages that render nothing else from HeroUI. The looks come from ./button-looks
// (shared with ./button-link, so the two cannot drift); the HeroUI classes they sit on (`button--primary`,
// `button--outline`, `button--ghost`, `button--md|lg`, `button--icon-only`) are joined here by hand, since
// buttonVariants would bring tailwind-variants along. Shared geometry, focus and the colour-only press are
// components.css.

export type NativeButtonVariant = ButtonVariant;

/** The class string HeroUI's buttonVariants would emit for a look, plus the kit's own classes for it. */
const buttonClasses = (look: ButtonLook, size: "md" | "lg" | "icon-only") =>
  cx("button", `button--${size}`, size === "icon-only" && "button--md", `button--${look.hero}`, look.className);

type NativeProps = Omit<ComponentProps<"button">, "className" | "children" | "ref"> & {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * A button that acts in place, on the native element: `onClick` instead of HeroUI's `onPress`. Labels are verb +
 * object in sentence case. A glyph passed in `children` comes from the parent (an Icon rendered on the server).
 */
export function NativeButton({
  variant = "secondary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: NativeProps & { variant?: NativeButtonVariant; size?: "md" | "lg"; children: ReactNode }) {
  return (
    <button {...rest} type={type} className={cx(buttonClasses(buttonLooks[variant], size), className)}>
      {children}
    </button>
  );
}

/**
 * The LinkButton look (§5.3: tint 15/20 500, 44 tall, an optional trailing 17pt forward glyph) on a Next link, with
 * the one glyph it needs drawn from its own module.
 */
export function NativeLinkButton({
  href,
  forward: withGlyph = false,
  className,
  children,
}: {
  href: string;
  forward?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cx(linkButtonClass, className)}>
      <span>{children}</span>
      {withGlyph ? <Glyph markup={forward} name="forward" size={17} tone="tint" mirrored /> : null}
    </Link>
  );
}

/**
 * 44×44 square, radius 4, with one glyph (a 20 Icon from the parent) and a name. ghost: the glyph in foreground.
 * secondary: a 1pt edge. The looks are iconButtonLooks, each with its one --button-fg.
 */
export function NativeIconButton({
  glyph,
  label,
  variant = "ghost",
  className,
  type = "button",
  ...rest
}: NativeProps & { glyph: ReactNode; label: string; variant?: "ghost" | "secondary" }) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      className={cx(buttonClasses(iconButtonLooks[variant], "icon-only"), className)}
    >
      {glyph}
    </button>
  );
}
