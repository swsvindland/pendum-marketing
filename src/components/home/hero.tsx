import { PageHeader } from "@/components/page";
import { Specimen } from "@/components/specimen";
import { getApp } from "@/content/apps";
import type { App } from "@/content/types";
import { AppIcon, ButtonLink, Meta } from "@/vector";

/** Plain-words model, for captions where a status dot would add a second signal fill. */
const modelWord = { subscription: "Subscription", purchase: "One-time purchase" } as const;

/**
 * One app's readout with a caption naming the app and how it is sold. A specimen with its own meta drops the
 * panel's "Example" label, so the caption carries it instead.
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
 * The page hero: the family in one sentence and the two ways to buy it. The aside sets one readout from each model
 * on a plain grid: side by side on tablets, stacked beside the copy from 1024. OmegaFyt carries the page's one
 * signal meter; no specimen is live.
 */
export function HomeHero() {
  const shown = [
    { app: getApp("omegafyt"), signal: true },
    { app: getApp("lift"), signal: false },
  ].filter((s): s is { app: App; signal: boolean } => Boolean(s.app?.specimen.hero.value));

  return (
    <PageHeader
      hero
      eyebrow="Fitness apps / Vector series"
      title="Precise fitness tracking. Subscribe, or buy once."
      subtitle={
        <>
          OmegaFyt is a subscription with one account that syncs across iPhone, Android and the web. Vector Body,
          Lift, Macros and Hydration are each a one-time purchase: they work offline and need no account.
        </>
      }
      actions={
        <>
          <ButtonLink href="/pricing" variant="primary">
            Compare plans
          </ButtonLink>
          <ButtonLink href="/calculators" variant="secondary">
            Try a calculator
          </ButtonLink>
        </>
      }
      aside={
        shown.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {shown.map((s) => (
              <SpecimenFigure key={s.app.slug} app={s.app} signal={s.signal} />
            ))}
          </div>
        ) : undefined
      }
    />
  );
}
