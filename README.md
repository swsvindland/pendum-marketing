# vector-marketing

The marketing site for the Pendum apps:

- **Pendum One** (formerly OmegaFyt) is the subscription app: an account that syncs across iPhone, Android and the
  web. Free to download; $7.99 a month or $49.99 a year, with a 7-day free trial on the yearly plan.
- **Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration** are one-time purchases. They work offline, need no
  account, and keep records on the phone. Body $9.99 and Hydration $4.99 are paid downloads; Lift and Macros are
  free downloads with a 21-day free trial and a $19.99 one-time unlock.
- **Free calculators**: BMI, body fat, FFMI, TDEE, macros, protein, calorie deficit, one-rep max, plates, DOTS and
  Wilks, water intake and heart rate zones. Each one matches the math in the app that tracks it.

Built with Next.js 16 (App Router), React 19, Tailwind v4 and HeroUI v3, styled by a web re-creation of the Vector
design system (the kit keeps its name; the products are Pendum).

## Run

Use Node 24 and pnpm 11 (`corepack enable`).

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm check        # typecheck, lint (with the token drift and page-code rule check), unit tests
pnpm build
NEXT_PUBLIC_SITE_URL=https://example.test pnpm build && PORT=3100 pnpm start   # a measurable build
pnpm lighthouse   # every route, mobile; --desktop for the desktop preset (installs Chrome under .work on first run)
```

## Layout

| path | what |
|---|---|
| `src/vector/` | The Vector kit for the web, on HeroUI v3 (`@heroui/react`) as the native kit is on heroui-native: tokens, type roles, Button, Panel, Value, Meter, Field, Choices and more. Gallery at `/kit`. |
| `scripts/vector-web.mjs` | Generates `tokens.css` and `icon-paths.ts` from `src/vector/tokens.json`, a snapshot of `../vector-design/kit/src/vector/tokens.json`. `pnpm tokens:pull` refreshes it. |
| `src/content/` | Site settings, app copy (`apps.ts`, with each app's chooser row and header note), the site questions (`faq.ts`), the shared design principles (`principles.ts`) and the calculator list. |
| `docs/sources/` | Verified fact sheets for each app and the formulas the apps implement, with file references, plus the owner's decisions and open items (`owner-decisions.md`). App copy is written from these. |
| `src/lib/calc/` | Calculator math with unit tests. |
| `src/calculators/` | One folder per calculator: the page (method and sources) and the client tool. Each has its own static route under `src/app/calculators/<slug>/`. |
| `src/app/` | Routes: home, `/apps`, `/apps/[slug]`, `/pricing`, `/calculators`, `/calculators/<slug>`, `/about`, `/privacy`, `/support`, plus `robots.txt`, `sitemap.xml` and `llms.txt` generated from the content. |
| `src/content/structured-data.ts` | JSON-LD builders (site graph, apps, calculators, lists, breadcrumbs, FAQs) with tests. |

## Before launch

The launch checklist, with the reasons, is in `docs/sources/owner-decisions.md`. In short:

- Set `NEXT_PUBLIC_SITE_URL` to the production domain (recommended: `https://getpendum.com`) and add a support
  address in `src/content/site.ts`. The publisher name is the one both store listings show; confirm it.
- Set the decided prices and trials in App Store Connect, Google Play and RevenueCat before the site goes live, so
  the paywall and the site agree (Pendum One's store prices today are not these).
- Rename the OmegaFyt listings to Pendum One, then delete `storeName` in `src/content/apps.ts`. Raise its `version`
  when 1.8.0 ships and the gated features appear.
- The four Pendum apps' `stores` links (`state: "preorder"` once pre-orders exist). Until they are set, pages show
  "Coming soon". The builds still carry their old display names ("VECTOR BODY", "Vector Lift"…) until the app repos
  are renamed.
- After each production deploy, `pnpm indexnow` (with `INDEXNOW_KEY` and `NEXT_PUBLIC_SITE_URL`) tells Bing and the
  engines behind it about the sitemap.

## Renaming

The products were renamed from Vector and OmegaFyt to Pendum on 2026-10-04. A rename is a content edit, because
page code never writes a name:

- `src/content/site.ts`: `family` ("Pendum") is the one string the site name, the title, the wordmark, the OG card,
  "More from {family}" and `series` ("Pendum apps" / "the Pendum apps", the collective noun for the purchase apps)
  are built from. The `description` spells the subscription app's name out by hand.
- `src/content/apps.ts`: each app's `name` (five), `label` (the planned home-screen label), `storeName` (the
  listing's name while it lags behind) and, when it differs from the name, `plan`. `names` and `seriesNames()` derive from them. Hand-written
  sentences in `apps.ts` (features, FAQ answers, `chooser`, `note`), `faq.ts`, `calculators.ts` (`next`, `track`,
  questions) and `principles.ts` spell names out and are searched by hand.
- Slugs are URLs (`AppSlug` in `src/content/types.ts`); changing one needs a redirect in `next.config.ts`, as
  `/apps/omegafyt` → `/apps/one` has. Pendum One's section ids are `#pendum-one`.
- Images: the icons (`public/apps/<slug>.png`, `-dark.png`) carry the mark only; `one.png` is OmegaFyt's artwork,
  and the wordmark's arrow and `src/app/icon.svg` are the Vector kit's mark, both for the owner to redraw. The OG cards (`src/app/opengraph-image.tsx`,
  `src/app/apps/[slug]/opengraph-image.tsx`) read the content, so nothing is regenerated by hand.
- `pnpm lint` runs `scripts/brand-rules.mjs check`, which fails on any product name or the bare family word, current
  (Pendum) or retired (Vector, OmegaFyt), left in `src/app`, `src/components` or `src/calculators` (comments and
  tests excepted). Its allowlist names the one line
  that keeps a literal: the kit gallery's title (the design system's name).

See `CLAUDE.md` for the design and content rules every page follows.
