import { buttonVariants } from "@heroui/styles/components/button";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonLooks, linkButtonClass, type ButtonVariant } from "./button-looks";
import { cn } from "./cn";
import { Icon, type IconName } from "./icon";

// Server-safe: the Button look as class names (HeroUI's plain buttonVariants) on a Next link. Nothing here imports
// @heroui/react, so pages that render only links ship no HeroUI component code. The HeroUI-backed Button and
// IconButton are in ./button; the look strings themselves are in ./button-looks, shared with ./button-native.

export type { ButtonVariant } from "./button-looks";
export { buttonLooks } from "./button-looks";

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
  const classes = cn(linkButtonClass, className);
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
