import { ModelStatus } from "@/components/get-app";
import { AppIcon, Heading, LinkButton, Note, Panel } from "@/vector";
import { purchaseApps } from "./models";

/**
 * Each Vector app with its model and price. With a price set, ModelStatus carries it as meta; until then the
 * price stays in words ("Price set at launch"), never a number.
 */
export function AppPrices() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {purchaseApps.map((app) => (
        <Panel key={app.slug} as="li">
          <Panel.Body className="gap-4">
            {/* Icon beside the name until the four-column grid, then above it. The heading names the app. */}
            <div className="flex items-start gap-4 lg:flex-col">
              <AppIcon src={app.icon.light} dark={app.icon.dark} alt="" size={56} />
              <div className="flex min-w-0 flex-col gap-1">
                <Heading level={3}>{app.name}</Heading>
                {app.tagline ? <Note className="text-pretty">{app.tagline}</Note> : null}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <ModelStatus app={app} />
              {app.price ? null : <Note>Price set at launch</Note>}
            </div>
          </Panel.Body>
          <Panel.Footer>
            <LinkButton href={`/apps/${app.slug}`} forward>
              See {app.name}
            </LinkButton>
          </Panel.Footer>
        </Panel>
      ))}
    </ul>
  );
}
