"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/vector/button";
import { cn } from "@/vector/cn";
import { Icon } from "@/vector/icon";
import { navCurrent } from "./nav-links";

/**
 * Under 768: a menu button that opens the nav as a full-width panel under the header. It closes on Escape (focus
 * returns to the button), on a tap outside, when focus moves on past it, on a link (the current page's too) and on
 * navigation. The button keeps one name, "Menu"; aria-expanded says whether it is open.
 */
export function MobileNav({ items }: { items: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Navigating closes the menu (the path it was opened on is no longer the current one).
  const shown = open && openedAt === pathname;

  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [shown]);

  return (
    <div
      ref={root}
      className="md:hidden"
      onBlur={(e) => {
        // Focus moved to something outside the button and the panel (not to another window).
        const next = e.relatedTarget as Node | null;
        if (shown && next && !e.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <IconButton
        ref={button}
        icon={shown ? "close" : "menu"}
        label="Menu"
        aria-expanded={shown}
        aria-controls={id}
        onPress={() => {
          setOpen(!shown);
          setOpenedAt(pathname);
        }}
      />
      <nav
        id={id}
        aria-label="Main"
        hidden={!shown}
        className="absolute inset-x-0 top-full border-b border-border bg-background"
      >
        <ul className="flex flex-col px-gutter py-2">
          {items.map((item) => {
            const { inSection, ariaCurrent } = navCurrent(pathname, item.href);
            return (
              <li key={item.href} className="border-t border-separator first:border-t-0">
                <Link
                  href={item.href}
                  aria-current={ariaCurrent}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center justify-between type-body-strong",
                    inSection ? "text-tint" : "text-foreground"
                  )}
                >
                  {item.label}
                  <Icon name="forward" size={16} tone="muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
