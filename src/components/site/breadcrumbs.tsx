import Link from "next/link";
import { Label, cn } from "@/vector";

export type Crumb = { href: string; label: string };

/**
 * The parents of the current page as a mono trail in the eyebrow slot ("Home / Apps"), the current page itself
 * being the h1 below it, so nothing is said twice. Each link keeps a 44 target inside the 16 line. Pages emit the
 * matching BreadcrumbList (src/content/structured-data.ts), which does name the current page.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-x-2">
            {i > 0 ? (
              <span aria-hidden="true">
                <Label as="span">/</Label>
              </span>
            ) : null}
            <Link
              href={c.href}
              // The label role uppercases the visible text and browsers carry that into the accessible name, so
              // the name is set from the string ("Home", not "HOME"); label-in-name holds, case aside.
              aria-label={c.label}
              className={cn("-my-3 inline-flex min-h-11 items-center rounded-mark hover:text-tint", "[&>*]:hover:text-tint")}
            >
              <Label as="span">{c.label}</Label>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
