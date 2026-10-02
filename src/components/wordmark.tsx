import Link from "next/link";

/**
 * The family mark: a signal square with an ink vector, the app-icon look (a #22D3EE fill always carries #071017),
 * beside the name in Inter 600.
 */
export function Wordmark() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-control" aria-label="Vector home">
      <svg viewBox="0 0 20 20" width={20} height={20} aria-hidden className="shrink-0">
        <rect width="20" height="20" rx="4" className="fill-accent" />
        <path d="M4.88 15.12 14.5 5.5" fill="none" className="stroke-accent-foreground" strokeWidth="1.75" />
        <path
          d="M8 5.5h6.5V12"
          fill="none"
          className="stroke-accent-foreground"
          strokeWidth="1.75"
          strokeLinecap="square"
        />
      </svg>
      <span className="type-h3 text-foreground">Vector</span>
    </Link>
  );
}
