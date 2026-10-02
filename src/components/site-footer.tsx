import Link from "next/link";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { site } from "@/content/site";
import { Label, Text } from "@/vector";
import { AppearanceChoice } from "./appearance";
import { Wordmark } from "./wordmark";

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  const id = `footer-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <nav aria-labelledby={id} className="flex flex-col gap-3">
      <Label as="h2" id={id}>
        {title}
      </Label>
      <ul className="flex flex-col gap-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-8 items-center rounded-mark type-small text-foreground-secondary hover:text-tint"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-data gap-10 px-gutter py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Wordmark />
          <Text variant="small" tone="muted" className="max-w-xs">
            Fitness apps on one design system. A subscription that syncs, or a one-time purchase that stays on your
            phone.
          </Text>
          <div className="max-w-64">
            <AppearanceChoice />
          </div>
        </div>
        <Column title="Apps" links={apps.map((a) => ({ href: `/apps/${a.slug}`, label: a.name }))} />
        <Column
          title="Calculators"
          links={[
            ...calculators.slice(0, 6).map((c) => ({ href: `/calculators/${c.slug}`, label: c.short })),
            { href: "/calculators", label: "All calculators" },
          ]}
        />
        <Column
          title="Vector"
          links={[
            { href: "/pricing", label: "Pricing" },
            { href: "/privacy", label: "Privacy" },
            { href: "/support", label: "Support" },
          ]}
        />
      </div>
      <div className="border-t border-separator">
        <div className="mx-auto flex max-w-data flex-col gap-2 px-gutter py-6 sm:flex-row sm:items-center sm:justify-between">
          <Text variant="caption" tone="muted">
            {site.publisher ? `© ${new Date().getFullYear()} ${site.publisher}` : "Vector app series"}
          </Text>
          <Text variant="caption" tone="muted">
            Calculators give general estimates, not medical advice.
          </Text>
        </div>
      </div>
    </footer>
  );
}
