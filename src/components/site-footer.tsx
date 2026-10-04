import Link from "next/link";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { site } from "@/content/site";
import { Label, Text, cn } from "@/vector";
import { AppearanceChoice } from "./appearance";
import { Wordmark } from "./wordmark";

/**
 * A link column: each link a full-width 44 row (§4.3, A11Y-09), stacked with no gap so the list stays compact.
 * `columns` lays the list two across: "phone" until the four-column footer, where the column is narrow, "always"
 * for the calculators, whose column is widened for it. The title is a mono Label, not a heading (the label role
 * is for eyebrows, never a section heading, and the page outline ends with the content's last h2); the nav
 * landmark carries the title as its name, from the string, so it is announced as "Apps", not "APPS".
 */
function Column({
  title,
  links,
  columns = "one",
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  columns?: "one" | "phone" | "always";
  /** Grid placement only. */
  className?: string;
}) {
  return (
    <nav aria-label={title} className={cn("flex min-w-0 flex-col gap-1", className)}>
      <Label as="span">{title}</Label>
      <ul
        className={cn(
          "flex flex-col",
          columns === "phone" && "grid grid-cols-2 gap-x-4 lg:flex",
          columns === "always" && "grid grid-cols-2 gap-x-4"
        )}
      >
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-11 items-center rounded-mark type-small text-foreground-secondary hover:text-tint"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The footer: the brand block (wordmark, one line on what the apps are, the appearance control), every app, every
 * calculator and the company pages. One column on phones; two from 640, the brand block beside the Company column
 * on the first row and Apps and Calculators on the second, so no cell is left empty (the brand column still holds
 * the 256 appearance control at 284 and up); four from 1024 with a wider calculators column, so the appearance
 * control keeps the width its cells need (VSP-01) and the twelve calculators sit two across. DOM and tab order
 * stay brand, Apps, Calculators, Company. The copyright line appears once the publisher is set (VSP-09), with the
 * year of the day the content was last checked (site.contentUpdated), a date the content keeps current, rather
 * than the build's clock, which a static page would carry until the next deploy; the disclaimer covers the apps
 * and the calculators.
 */
export function SiteFooter() {
  const subscription = apps.find((a) => a.model === "subscription");
  const year = site.contentUpdated.slice(0, 4);
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-data gap-10 px-gutter py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <Wordmark />
          <Text variant="small" tone="muted" className="max-w-xs text-pretty">
            Fitness apps for iPhone and Android. Buy an app once and keep its records on your phone
            {subscription ? `, or subscribe to ${subscription.name} and sync` : ""}.
          </Text>
          <div className="max-w-64">
            <AppearanceChoice />
          </div>
        </div>
        <Column title="Apps" columns="phone" links={apps.map((a) => ({ href: `/apps/${a.slug}`, label: a.name }))} />
        <Column
          title="Calculators"
          columns="always"
          links={calculators.map((c) => ({ href: `/calculators/${c.slug}`, label: c.short }))}
        />
        <Column
          title="Company"
          columns="phone"
          className="sm:col-start-2 sm:row-start-1 lg:col-start-auto lg:row-start-auto"
          links={[
            { href: "/about", label: "About" },
            { href: "/pricing", label: "Pricing" },
            { href: "/privacy", label: "Privacy" },
            { href: "/support", label: "Support" },
          ]}
        />
      </div>
      <div className="border-t border-separator">
        <div className="mx-auto flex max-w-data flex-col gap-2 px-gutter py-6 sm:flex-row sm:items-center sm:justify-between">
          {site.publisher ? (
            <Text variant="caption" tone="muted">
              © {year} {site.publisher}
            </Text>
          ) : null}
          <Text variant="caption" tone="muted" className="sm:ms-auto">
            Apps and calculators give general estimates, not medical advice.
          </Text>
        </div>
      </div>
    </footer>
  );
}
