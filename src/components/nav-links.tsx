"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/vector";

/** Desktop nav: text links in foreground; the current section is tint with a 2pt tint underline (§2.4 ink cyan). */
export function NavLinks({ items }: { items: readonly { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-control px-3 type-button transition-colors duration-100 ease-standard",
                  current ? "text-tint" : "text-foreground hover:bg-surface-secondary"
                )}
              >
                {item.label}
                {current ? <span aria-hidden className="absolute inset-x-3 bottom-1.5 h-0.5 bg-tint" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
