import { Button as HeroButton } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import Link from "next/link";
import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

/**
 * The kit's four looks on HeroUI's button (§5.3), as data: HeroUI supplies the behaviour and its variant, the kit
 * supplies the look through HeroUI's own --button-* properties. Shared geometry (44 minimum, 52 at lg, radius 4,
 * Inter 500 15/20, colour-only press) is in components.css.
 * primary: signal fill, #071017 label (one per page; HeroUI's primary already uses --accent / --accent-hover).
 * secondary: surface with a 1pt border-strong edge, never a grey fill. ghost: tint label. destructive: danger label,
 * no fill.
 */
const looks = {
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
  const look = looks[variant];
  return cn(buttonVariants({ variant: look.hero, size }), look.className);
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  icon?: IconName;
  iconPosition?: "start" | "end";
  /** Layout only. */
  className?: string;
  children: ReactNode;
};

function Inner({ variant = "secondary", icon, iconPosition = "start", children }: CommonProps) {
  const glyph = icon ? <Icon name={icon} size={17} tone={iconTone[variant]} /> : null;
  return (
    <>
      {iconPosition === "start" ? glyph : null}
      <span>{children}</span>
      {iconPosition === "end" ? glyph : null}
    </>
  );
}

/**
 * A button that acts in place: HeroUI's Button (React Aria press handling, keyboard and focus) in the kit look.
 * Labels are verb + object in sentence case. `onPress` needs a client component around it.
 */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconPosition,
  className,
  children,
  onPress,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
}: CommonProps & {
  onPress?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}) {
  const look = looks[variant];
  return (
    <HeroButton
      variant={look.hero}
      size={size}
      type={type}
      onPress={onPress}
      isDisabled={disabled}
      aria-label={ariaLabel}
      className={cn(look.className, className)}
    >
      <Inner variant={variant} icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </HeroButton>
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
}: CommonProps & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "children" | "className" | "href">) {
  const classes = cn(buttonClass(variant, size), className);
  const inner = (
    <Inner variant={variant} icon={icon} iconPosition={iconPosition}>
      {children}
    </Inner>
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
 * Inline text action in tint 15/20 500 with an optional trailing forward glyph (§5.3 LinkButton). Pressed opacity
 * 0.6. Leaves the site with `external`.
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
    "inline-flex items-center gap-1 rounded-mark type-button text-tint underline-offset-4 hover:underline active:opacity-60",
    className
  );
  const glyph = forward ? <Icon name={external ? "external" : "forward"} size={16} tone="tint" /> : null;
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

/** 44×44 square, radius 4, on HeroUI's icon-only button. ghost: a 20 glyph in foreground. secondary: a 1pt edge. */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  onPress,
  className,
  ref,
  "aria-expanded": expanded,
  "aria-controls": controls,
}: {
  icon: IconName;
  label: string;
  variant?: "ghost" | "secondary";
  onPress?: () => void;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}) {
  return (
    <HeroButton
      ref={ref}
      isIconOnly
      variant={variant === "secondary" ? "outline" : "ghost"}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      onPress={onPress}
      className={cn(
        "[--button-fg:var(--foreground)] [--button-bg-hover:var(--surface-secondary)] [--button-bg-pressed:var(--surface-secondary)]",
        variant === "secondary" && "border-border-strong [--button-bg:var(--surface)]",
        className
      )}
    >
      <Icon name={icon} size={20} />
    </HeroButton>
  );
}
