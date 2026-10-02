"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon, cn } from "@/vector";

/** Under 768: a menu button that opens the nav as a full-width panel under the header. Escape closes it. */
export function MobileNav({ items }: { items: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const id = useId();
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown]);

  return (
    <div className="md:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={shown}
        aria-controls={id}
        aria-label={shown ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpen(!shown);
          setOpenedAt(pathname);
        }}
        className="inline-flex size-11 items-center justify-center rounded-control text-foreground hover:bg-surface-secondary"
      >
        <Icon name={shown ? "close" : "menu"} size={20} />
      </button>
      <nav
        id={id}
        aria-label="Main"
        hidden={!shown}
        className="absolute inset-x-0 top-full border-b border-border bg-background"
      >
        <ul className="flex flex-col px-gutter py-2">
          {items.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="border-t border-separator first:border-t-0">
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center justify-between type-body-strong",
                    current ? "text-tint" : "text-foreground"
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
