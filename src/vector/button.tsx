import { Button as HeroButton } from "@heroui/react/button";
import type { Ref } from "react";
import { ButtonContent, buttonLooks, type ButtonCommonProps } from "./button-link";
import { cn } from "./cn";
import { Icon, type IconName } from "./icon";

// The HeroUI-backed actions, an entry point of their own (@/vector/button), so pages that only link never load
// HeroUI's Button. The look (variants, ButtonLink, LinkButton, buttonClass) is in ./button-link.

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
}: ButtonCommonProps & {
  onPress?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}) {
  const look = buttonLooks[variant];
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
      <ButtonContent variant={variant} icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </HeroButton>
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
