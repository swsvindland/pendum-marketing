import { buttonVariants } from "@heroui/styles/components/button";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icon";

// Server-safe: the Button look as class names (HeroUI's plain buttonVariants) on a Next link. Nothing here imports
// @heroui/react, so pages that render only links ship no HeroUI component code. The HeroUI-backed Button and
// IconButton are in ./button.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

/**
 * The kit's four looks on HeroUI's button (§5.3), as data: HeroUI supplies the behaviour and its variant, the kit
 * supplies the look through HeroUI's own --button-* properties. Shared geometry (44 minimum, 52 at lg, radius 4,
 * Inter 500 15/20, colour-only press) is in components.css.
 * primary: signal fill, #071017 label (one per page; HeroUI's primary already uses --accent / --accent-hover).
 * secondary: surface with a 1pt border-strong edge, never a grey fill. ghost: tint label. destructive: danger label,
 * no fill.
 */
export const buttonLooks = {
  primary: { hero: "primary", className: "" },
  secondary: {
    hero: "outline",
    className:
      "border-border-strong [--button-bg:var(--surface)] [--button-bg-hover:var(--surface-secondary)] [--button-bg-pressed:var(--surface-secondary)] [--button-fg:var(--foreground)]",
  },
  ghost: {
    hero: "ghost",
    className:
      "[--button-fg:var(--tint)] [--button-bg-hover:var(--surface-secondary)] [--button-bg-pressed:var(--surface-secondary)]",
  },
  destructive: {
    hero: "ghost",
    className:
      "[--button-fg:var(--danger)] [--button-bg-hover:var(--surface-secondary)] [--button-bg-pressed:var(--surface-secondary)]",
  },
} as const;

const iconTone = { primary: "onSignal", secondary: "foreground", ghost: "tint", destructive: "danger" } as const;

/** The Button look as a class string, for an element that is not a HeroUI Button (a Next link). */
export function buttonClass(variant: ButtonVariant = "secondary", size: "md" | "lg" = "md") {
  const look = buttonLooks[variant];
  return cn(buttonVariants({ variant: look.hero, size }), look.className);
}

export type ButtonCommonProps = {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  icon?: IconName;
  iconPosition?: "start" | "end";
  /** Layout only. */
  className?: string;
  children: ReactNode;
};

/** The label and the 17pt glyph in the variant colour, shared by Button and ButtonLink. */
export function ButtonContent({ variant = "secondary", icon, iconPosition = "start", children }: ButtonCommonProps) {
  const glyph = icon ? <Icon name={icon} size={17} tone={iconTone[variant]} /> : null;
  return (
    <>
      {iconPosition === "start" ? glyph : null}
      <span>{children}</span>
      {iconPosition === "end" ? glyph : null}
    </>
  );
}

/** The Button look on a link: navigation that should read as an action ("Compare plans"). */
export function ButtonLink({
  href,
  variant,
  size,
  icon,
  iconPosition,
  className,
  children,
  external,
  ...rest
}: ButtonCommonProps & { href: string; external?: boolean } & Omit<
    ComponentProps<"a">,
    "children" | "className" | "href"
  >) {
  const classes = cn(buttonClass(variant, size), className);
  const inner = (
    <ButtonContent variant={variant} icon={icon} iconPosition={iconPosition}>
      {children}
    </ButtonContent>
  );
  if (external)
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={classes} {...rest}>
      {inner}
    </Link>
  );
}

/**
 * Inline text action in tint 15/20 500 with an optional trailing 17pt forward glyph (§5.3 LinkButton), 44 tall
 * like every target (§4.3). Pressed opacity 0.6. Leaves the site with `external`.
 */
export function LinkButton({
  href,
  forward = false,
  external = false,
  className,
  children,
  ...rest
}: {
  href: string;
  forward?: boolean;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "children" | "className" | "href">) {
  const classes = cn(
    "inline-flex min-h-11 items-center gap-1 rounded-mark type-button text-tint underline-offset-4 hover:underline active:opacity-60",
    className
  );
  const glyph = forward ? <Icon name={external ? "external" : "forward"} size={17} tone="tint" /> : null;
  if (external)
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        <span>{children}</span>
        {glyph}
      </a>
    );
  return (
    <Link href={href} className={classes} {...rest}>
      <span>{children}</span>
      {glyph}
    </Link>
  );
}
