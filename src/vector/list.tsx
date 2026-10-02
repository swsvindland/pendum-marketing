import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

/**
 * ListRow (§5.6) for a link list inside `Panel inset="none"`: 44 minimum (56 with a description), px-4 py-3,
 * gap 12, an optional leading glyph (20, muted), a value at the end and a trailing forward glyph. Rows draw
 * their own 1pt separator, inset 16 (48 with an icon), never above the first row.
 */
export function ListRow({
  title,
  description,
  icon,
  value,
  href,
  external = false,
  trailing = href ? "chevron" : undefined,
}: {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  value?: ReactNode;
  href?: string;
  external?: boolean;
  trailing?: "chevron" | "check";
}) {
  const content = (
    <>
      {icon ? <Icon name={icon} size={20} tone="muted" className="mt-0.5 self-start" /> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <Text variant={description ? "body" : "bodyStrong"} as="span">
          {title}
        </Text>
        {description ? (
          <Text variant="small" tone="muted" as="span">
            {description}
          </Text>
        ) : null}
      </span>
      {value ? <span className="shrink-0 text-end">{value}</span> : null}
      {trailing === "chevron" ? (
        <Icon name={external ? "external" : "forward"} size={16} tone="muted" />
      ) : trailing === "check" ? (
        <Icon name="check" size={20} tone="tint" />
      ) : null}
    </>
  );
  const rowClass = cn(
    "relative flex items-center gap-3 px-4 py-3",
    description ? "min-h-14" : "min-h-11",
    // The separator: a 1pt rule above every row but the first, inset like the native list.
    "before:absolute before:end-0 before:top-0 before:h-px before:bg-separator first:before:hidden",
    icon ? "before:start-12" : "before:start-4"
  );
  if (!href) return <li className={rowClass}>{content}</li>;
  return (
    <li className={cn(rowClass, "p-0")}>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(rowClass, "w-full hover:bg-surface-secondary active:bg-surface-secondary before:hidden")}
        >
          {content}
        </a>
      ) : (
        <Link
          href={href}
          className={cn(rowClass, "w-full hover:bg-surface-secondary active:bg-surface-secondary before:hidden")}
        >
          {content}
        </Link>
      )}
    </li>
  );
}

/** The list container for ListRows inside a `Panel inset="none"`. */
export function RowList({ className, children, ...aria }: { className?: string; children: ReactNode; "aria-label"?: string }) {
  return (
    <ul className={cn("flex flex-col", className)} {...aria}>
      {children}
    </ul>
  );
}
