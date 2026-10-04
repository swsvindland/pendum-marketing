import { PageHeader } from "@/components/page";
import { Specimen } from "@/components/specimen";
import { apps } from "@/content/apps";
import { site } from "@/content/site";
import type { App } from "@/content/types";
import { AppIcon, ButtonLink, Meta } from "@/vector";

/** Plain-words model, for captions where a status dot would add a second signal fill. */
const modelWord = { subscription: "Subscription", purchase: "One-time purchase" } as const;

/**
 * One app's readout with a caption naming the app and how it is sold. The panel's own marker says it is an
 * example; a specimen with its own meta drops that marker, so the caption carries it instead.
 */
function SpecimenFigure({ app, signal }: { app: App; signal?: boolean }) {
  const labelled = !app.specimen.meta || /example/i.test(app.specimen.meta);
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <Specimen data={app.specimen} signal={signal} />
      <figcaption className="flex items-center gap-2">
        <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={32} />
        <Meta items={[app.name, modelWord[app.model], labelled ? "" : "Example"]} />
      </figcaption>
    </figure>
  );
}

/**
 * The page hero: what the apps do, then the two ways to buy them, with the page's one primary action leading to the
 * chooser further down this page (#choose; /apps carries the same chooser for the header's "Get the apps"). The aside is one specimen, the subscription app's, carrying the page's one signal meter; no
 * specimen is live.
 */
export function HomeHero() {
  const subscription = apps.find((a) => a.model === "subscription");
  const shown = subscription?.specimen.hero.value ? subscription : undefined;

  return (
    <PageHeader
      hero
      eyebrow="Fitness apps / iPhone, Android, Apple Watch"
      title="Precise fitness apps for iPhone and Android."
      subtitle={`Track lifts, food, body and fluids in plain numbers, each with its method and source. Buy a ${site.family} app once and keep its records on your phone${subscription ? `, or subscribe to ${subscription.name} and sync one account across phones` : ""}.`}
      actions={
        <>
          <ButtonLink href="#choose" variant="primary">
            Choose your app
          </ButtonLink>
          <ButtonLink href="/calculators" variant="secondary">
            Try a calculator
          </ButtonLink>
        </>
      }
      aside={shown ? <SpecimenFigure app={shown} signal /> : undefined}
    />
  );
}
