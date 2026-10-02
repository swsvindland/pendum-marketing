import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

/**
 * The Button look (§5.3) as classes. Radius 4, 44 minimum (52 at lg), Inter 500 15/20, press is colour only
 * (no scale), focus is the global 2pt tint outline, disabled is 0.4.
 * primary: signal fill, #071017 label (one per page). secondary: surface with a 1pt border-strong edge.
 * ghost: tint label. destructive: danger label, no fill.
 */
export function buttonClass(variant: ButtonVariant = "secondary", size: "md" | "lg" = "md") {
  return cn(
    "inline-flex h-auto items-center justify-center gap-2 rounded-control text-center type-button",
    "transition-colors duration-100 ease-standard select-none",
    "aria-disabled:pointer-events-none aria-disabled:opacity-40 disabled:pointer-events-none disabled:opacity-40",
    size === "lg" ? "min-h-13 px-5 py-3.5" : "min-h-11 px-4 py-3",
    variant === "primary" && "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover",
    variant === "secondary" &&
      "border border-border-strong bg-surface text-foreground hover:bg-surface-secondary active:bg-surface-secondary",
    variant === "ghost" && "text-tint hover:bg-surface-secondary active:bg-surface-secondary",
    variant === "destructive" && "text-danger hover:bg-surface-secondary active:bg-surface-secondary"
  );
}

const iconTone = { primary: "onSignal", secondary: "foreground", ghost: "tint", destructive: "danger" } as const;

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

/** A button that acts in place. Labels are verb + object in sentence case. */
export function Button({
  variant,
  size,
  icon,
  iconPosition,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button type="button" className={cn(buttonClass(variant, size), className)} {...rest}>
      <Inner variant={variant} icon={icon} iconPosition={iconPosition}>
        {children}
      </Inner>
    </button>
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

/** 44×44 square, radius 4. ghost: a 20 glyph. secondary: 1pt border-strong edge. Label required. */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  className,
  ...rest
}: {
  icon: IconName;
  label: string;
  variant?: "ghost" | "secondary";
  className?: string;
} & Omit<ComponentProps<"button">, "children" | "className" | "aria-label">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-control text-foreground",
        "transition-colors duration-100 ease-standard hover:bg-surface-secondary active:bg-surface-secondary",
        variant === "secondary" && "border border-border-strong bg-surface",
        className
      )}
      {...rest}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
