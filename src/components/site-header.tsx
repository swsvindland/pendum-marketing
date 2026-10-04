import { nav } from "@/content/site";
import { ButtonLink, Icon } from "@/vector";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { Wordmark } from "./wordmark";

/** The header's one persistent action: the product path, landing on the chooser (CRO-10). */
const getApps = { href: "/apps#choose", label: "Get the apps" } as const;

/** A plain bar on the canvas with a 1pt rule: no blur, no shadow, no glass (§1.4). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-data items-center justify-between gap-4 px-gutter">
        <Wordmark />
        <div className="flex items-center gap-2">
          <NavLinks items={nav} />
          <ButtonLink href={getApps.href} variant="secondary" className="hidden sm:inline-flex">
            {getApps.label}
          </ButtonLink>
          {/* The glyphs render here, on the server, so the nav island ships none of the icon table. */}
          <MobileNav
            items={nav}
            lead={getApps}
            menuGlyph={<Icon name="menu" size={20} />}
            closeGlyph={<Icon name="close" size={20} />}
            forwardGlyph={<Icon name="forward" size={16} tone="muted" />}
          />
        </div>
      </div>
    </header>
  );
}
