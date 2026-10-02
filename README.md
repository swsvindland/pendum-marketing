# vector-marketing

The marketing site for the Vector app series:

- **OmegaFyt** is the subscription app: an account that syncs across iPhone, Android and the web.
- **Vector Body, Vector Lift, Vector Macros and Vector Hydration** are one-time purchases. They work offline, need
  no account, and keep records on the phone.
- **Free calculators**: BMI, body fat, FFMI, TDEE, macros, protein, goal date, one-rep max, plates, strength score,
  water intake and heart rate zones. Each one matches the math in the app that tracks it.

Built with Next.js 16 (App Router), React 19, Tailwind v4 and a web re-creation of the Vector design system.

## Run

Use Node 24 and pnpm 11 (`corepack enable`).

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm check        # regenerate tokens, typecheck, lint (with the token drift check), unit tests
pnpm build
```

## Layout

| path | what |
|---|---|
| `src/vector/` | The Vector kit for the web: tokens, type roles, Button, Panel, Value, Meter, Field, Choices and more. Gallery at `/kit`. |
| `scripts/vector-web.mjs` | Generates `tokens.css` and `icon-paths.ts` from `src/vector/tokens.json`, a snapshot of `../vector-design/kit/src/vector/tokens.json`. `pnpm tokens:pull` refreshes it. |
| `src/content/` | Site settings, app copy (`apps.ts`) and the calculator list. |
| `docs/sources/` | Verified fact sheets for each app and the formulas the apps implement, with file references. App copy is written from these. |
| `src/lib/calc/` | Calculator math with unit tests. |
| `src/calculators/` | One folder per calculator: the page (method and sources) and the client tool. |
| `src/app/` | Routes: home, `/apps`, `/apps/[slug]`, `/pricing`, `/calculators`, `/calculators/[slug]`, `/privacy`, `/support`. |

## Before launch

These are owner decisions the site leaves empty rather than guessing:

- `src/content/site.ts`: the production URL (`NEXT_PUBLIC_SITE_URL`), a support address and the publisher name.
- `src/content/apps.ts`: each app's `stores` links and `price`. Until they are set, pages show "Coming soon" and
  describe the model in words.
- App names follow the design system's recommendation (Vector Body, Vector Hydration). The current builds still say
  "VECTOR BODY" and "VECTOR HYDRATION" until the rename is signed off.

See `CLAUDE.md` for the design and content rules every page follows.
