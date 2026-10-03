import { nav } from "@/content/site";
import { ButtonLink } from "@/vector";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { Wordmark } from "./wordmark";

/** A plain bar on the canvas with a 1pt rule: no blur, no shadow, no glass (§1.4). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-data items-center justify-between gap-4 px-gutter">
        <Wordmark />
        <div className="flex items-center gap-2">
          <NavLinks items={nav} />
          <ButtonLink href="/calculators" variant="secondary" className="hidden sm:inline-flex">
            Try a calculator
          </ButtonLink>
          <MobileNav items={nav} />
        </div>
      </div>
    </header>
  );
}
