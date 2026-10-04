# Owner decisions

Facts the app repos do not record yet, stated by the owner. Site copy may rely on them.

| date | decision | source |
|---|---|---|
| 2026-10-02 | Vector Body, Vector Lift, Vector Macros and Vector Hydration are sold as single purchases and work offline, with no account and no subscription. OmegaFyt is the subscription (SaaS) option. | Owner, in the session that created this site |
| 2026-10-02 | The site uses the HeroUI v3 web components under the Vector kit, as the apps use heroui-native. | Owner, same session |
| 2026-10-04 | The products are renamed to **Pendum**: Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration (formerly Vector Body, Lift, Macros, Hydration), and Pendum One for the subscription app (formerly OmegaFyt). The design system keeps the name Vector. Bundle ids do not change. | Owner, after the naming research (`naming-research.md`) |
| 2026-10-04 | Prices and model as the revised pricing recommendation below: Pendum Body $9.99 and Pendum Hydration $4.99, paid downloads with no trial; Pendum Lift and Pendum Macros free downloads with a 21-day trial and a $19.99 one-time unlock; Pendum One $7.99 a month or $49.99 a year, no lifetime, 7-day free trial on the yearly plan for new subscribers. No launch discounts, no sales and no bundle in the first 12 months. | Owner, after the pricing research (`pricing-research.md`) |
| 2026-10-04 | Domain: getpendum.com for this marketing site. The site reads it from `NEXT_PUBLIC_SITE_URL`, so nothing in the code changes. The Pendum One web app's address is not decided yet (recommended: app.getpendum.com; it depends on moving the Clerk instance off omegafyt.com, see the launch checklist). | Owner |
| 2026-10-04 | App page titles (`seoTitle`) keep the name, the category and the model and stay within about 65 characters; the platforms stay in the description and the definition, since search results cut longer titles. | Second pass, runtime-seo finding V-02 |

## Launch checklist (owner)

- **Domain.** Register getpendum.com (recommended) and, cheaply, pendumapps.com and pendum.app as redirects so nobody else holds them; all were free on 2026-10-04 (RDAP). Skip pendum.io: `.io` reads as a developer tool, and its future has been uncertain since the 2024 UK–Mauritius agreement on the Chagos Islands. pendum.com has been registered since 2006 (NameBright) and is listed for sale; worth an offer later, not a blocker. Set `NEXT_PUBLIC_SITE_URL=https://getpendum.com` in the deployment and a support address (for example support@getpendum.com) in `src/content/site.ts`.
- **Store prices.** Set the prices and trials above in App Store Connect, Google Play and RevenueCat before the site goes live. Pendum One's current store prices are not these (omegafyt.com advertises $9.99 and a $24.99 lifetime), and the site states the new ones. Existing lifetime buyers keep their access (the backend stores lifetime purchases as non-expiring).
- **Store listings.** Rename the OmegaFyt listings to Pendum One (App Store name and subtitle, Google Play title), then delete `storeName` in `src/content/apps.ts`, which tells visitors the listings still say OmegaFyt. Redirect omegafyt.com to the new domain.
- **App builds.** The display names in the app repos still say VECTOR BODY, Vector Lift, Vector Macros, VECTOR HYDRATION and OmegaFyt; the design system's naming section (`vector-design/kit/docs/design-system.md`) still recommends the Vector names. Neither was changed from this repo.
- **Unlock and trial.** Pendum Lift and Pendum Macros need the one-time unlock and the 21-day trial built (StoreKit 2 and Play Billing, a Tier 0 "21-day Trial" product on iOS, restore, the unlock sheet). The site already states this model; if the apps ship as paid downloads instead, delete `unlock` and `trial` on those two apps and the copy follows.
- **Brand mark.** The wordmark's arrow, `src/app/icon.svg`, the touch icon and `public/apps/one.png` are Vector and OmegaFyt artwork.
- Pendum One 1.8.0 (program builder, saved gyms, rest timer, guided setup, PostHog) and its backend deploy: raise `version` when it is in both stores.
- The public Pendum One web address.
- Store links for the four Pendum apps (App Store pre-orders and Google Play pre-registration can go live before release; set `state: "preorder"`).
- Pendum Macros store download and install sizes, once measured. Until then the site states only the catalog size (about 590 MB on the phone, about twice that installed on Android), not a download size.
- Confirm the publisher name shown in the footer ("Svindland Software LLC", from both store listings).

## Verified on 2026-10-03 (second pass)

- OmegaFyt is live in both stores: App Store id 6755430666 ("OmegaFyt - Macros and Workouts", seller Svindland Software LLC, first released 2026-01-27, version 1.7.0 in the stores since 2026-07-23, iOS 18 or later) and Google Play `dev.svindland.fitness`. The site now links both listings (`src/content/apps.ts`, `stores`) and sets `version: "1.7.0"`, so 1.8.0 features stay hidden until `version` is raised.
- The publisher name shown in both stores is "Svindland Software LLC"; the site uses it as `site.publisher`. TODO(owner): confirm, and supply a support address.
- omegafyt.com (the owner's other page) states prices this site does not: reconcile the two before launch, or the two sites contradict each other.

## Verified on 2026-10-04 (second pass)

- PostHog analytics entered the OmegaFyt repo on 2026-09-30, after the 1.7.0 store build (the version bump of 2026-07-21, in the stores from 2026-07-23), so the public 1.7.0 build sends no analytics. This closes the open question above. The site gates every analytics statement on `version` (`analyticsSentence()` and `ANALYTICS_SINCE` = "1.8.0" in `src/content/apps.ts`, read by the at-a-glance row, the privacy list, both FAQ answers and the privacy page): until `version` is raised it says the current build sends none and that 1.8.0 will; afterwards it states the present tense. No copy edit is needed at release.

## Naming (decided 2026-10-04: Pendum)

From `naming-research.md` (37 candidates, domain checks, collision searches, three judges). The bare word "Vector" is unwinnable in search (vector graphics, the Anki Vector robot, Vector Security, Vector Marketing, Catapult Vector, a Vector Fitness gym app, Vector Lifting) and "OmegaFyt" is unique but reads as a supplement. Options, with the free domains as RDAP reported them on 2026-10-03:

| option | apps | subscription app | free domains | risk | note |
|---|---|---|---|---|---|
| Pendum | Pendum Body / Lift / Macros / Hydration | Pendum One | pendum.app, pendum.io, pendum.co, getpendum.com, pendumapps.com (pendum.com is listed for sale) | low | Cleanest: zero store results in three storefronts, every PENDUM mark dead. A coinage from Latin pendere (to weigh, to hang). |
| Taktum | Taktum Body / Lift / … | Taktum Sync or Taktum One | taktum.io, taktum.co, gettaktum.com, taktumapps.com | low | Clean on both stores; the exact word is one band-rehearsal web app. Cadence (takt time). |
| Plainrule | Plainrule Body / Lift / … | Plainrule One | plainrule.app, plainrule.io, plainrule.co, getplainrule.com, plainruleapps.com | low | Descriptive (the 1pt rule, a rule stated plainly); nothing on either store; nine letters. |
| Clearset | Clearset Body / Lift / … | Clearset One | getclearset.com, clearsetapps.com | low | "Clearset Lift" reads as a set you can see; "clear" is a common app prefix. |
| Plainset | Plainset Body / Lift / … | Plainset One | plainset.app, plainset.io, getplainset.com, plainsetapps.com | medium | Best category pairing ("Plainset Lift"), but a Canadian studio already holds the App Store developer name "Plainset". |
| Octant | Octant Body / Lift / … | Octant One | octantapps.com (octant.app is taken) | medium | Real instrument, strongest sound; Octane Fitness mark one letter away; two small non-fitness Octant apps. |
| Datum | Datum Body / Lift / … | Datum One | datumapps.com | medium-high | Best brand fit (the fixed reference every measurement is read from) but two live DATUM word marks in Class 9 and nine Datum apps; "Datum" means "date" in German and the Nordics. |
| Keep "Vector" | Vector Body / Lift / … | Vector One (or Vector Sync, Vector Complete) | vector*.com all taken | n/a | Rename only OmegaFyt into the family; bundle ids never change. Store search for "vector" is crowded (Vector: Parkour Run, Catapult Vector, Vector Fitness). |

The owner chose Pendum. The site pairs the name with the category everywhere ("Pendum Lift: strength training app"), and names live only in `src/content` (see CLAUDE.md).

## Prices (decided 2026-10-04)

Proposed by the pricing audit of 2026-10-03 from US store list prices read that day, revised after an adversarial review the same day, and accepted by the owner on 2026-10-04. The rows keep the names used at the time (Vector, OmegaFyt): read Pendum and Pendum One. The site states the prices and trials from `src/content/apps.ts`; it states no competitor price.

| item | proposal | anchor |
|---|---|---|
| Model, Vector Lift and Vector Macros | Free download with a one-time unlock (App Store non-consumable, Google Play one-time product) and a 21-day trial. On iOS the trial is a $0 non-consumable named "21-day Trial" (Guideline 3.1.1); on Android the start date is local. A lapsed app still opens, reads, charts, backs up and exports; only new entries need the unlock. On Google Play a free listing can never become paid, so this choice is final there. | Benchmark Workout Tracker, $14.99 unlock with a two-week trial; Guideline 3.1.1 (Tier 0 trial product; the sheet states duration, what stops and the price); Play help 6334373 (free to paid not allowed). Macros holds its first check-in until 12 covered days and 6 weigh-ins in 21, so 14 days is too short. |
| Model, Vector Body and Vector Hydration | Paid-upfront downloads, no trial, no billing code. Paid can later go free on both stores; the reverse cannot on Play. | Weight Diary $7.99 paid upfront (4.9 rating, 2.6K); hydration leaders log water free for ever, so a timed trial earns the category's "paywall" one-star. |
| Vector Macros | $19.99 one-time. Same on Google Play. Priced on the catalog (7,793 USDA foods and 3,192,971 packaged foods, offline), weekly check-ins, barcode and label scanning, widgets, backups and CSV; photo logging stated as a bonus with its device requirement. | Caltopia $14.99 (unverified listing); Calory lifetime $34.99; MacroFactor $71.99 a year; MyFitnessPal Premium $19.99 a month. |
| Vector Lift | $19.99 one-time. Same on Google Play (reviewed at 12 months; Android build ships only after device QA). | HeavySet $19.99 (a logger, 1.3k ratings); Benchmark $14.99; GymBook $22.99; Hevy lifetime $74.99; Fitbod $15.99 a month, $95.99 a year; Alpha Progression $79.99 a year. |
| Vector Body | $9.99 one-time, paid app. Same on Google Play. | Weight Diary $7.99 paid upfront; Progress Pro lifetime $29.99; Happy Scale lifetime $39.99. |
| Vector Hydration | $4.99 one-time, paid app. Same on Google Play. | Waterllama Full Access about $6.99; Simple Daily Water Tracker $5.99; Hydro Coach PRO $10 on Android. |
| Discounts | None. No launch window, no sales, no regional cuts, no store weeks for 12 months. Store promo or offer codes only, which leave the public price alone (confirm Apple offer codes cover non-consumables before use). | Price rises and moving prices are the most cited complaint across all four research reports (Fitbod, Strong, JEFIT, Lose It, Lifesum); lifetime SKUs are the one price vendors never discount. |
| App Store bundle | None under this model (a bundle needs four paid-upfront apps). If all four are sold paid-upfront instead: $39.99 for all four. No bundle on Google Play under any model. | Sum of the four prices $54.96; Happy Scale lifetime $39.99; Hevy lifetime $74.99. |
| OmegaFyt Pro | $7.99 a month; $49.99 a year; no lifetime. 7-day free trial on the annual plan only. First RevenueCat experiment: annual $39.99 against $49.99. Prices set in App Store Connect, Google Play and RevenueCat, not in code. | Lifesum $49.99 a year; Cronometer and MyNetDiary $59.99; MacroFactor $71.99; RevenueCat category medians $9.99 a month and $39.94 a year. |
| Price changes | One-time prices hold for at least 12 months and any later change is a permanent new price announced in advance. Existing OmegaFyt subscribers keep their price on any rise. | Apple preserves existing subscriber prices; Play opt-in rises need 30 or 60 days' notice by region. |
| Fees | Apple Small Business Program approval at least one full fiscal month before release (proceeds adjust 15 days after the end of the approval month). Play: 10 percent plus 5 percent billing fee on new installs in the EEA, UK and US from 2026-06-30, 15 percent tier elsewhere. | developer.apple.com/app-store/small-business-program (read 2026-10-03); Play help 112622 (read 2026-10-03). |
| Three-year line | Vector Lift and Vector Macros $39.98 once; OmegaFyt Pro $149.97; MacroFactor Nutrition + Workouts $269.97; Fitbod with MyFitnessPal Premium $527.94. All four Vector apps $54.96 once. | Each competitor price needs its source URL and date in docs/sources before it is shown, and the line carries its read date and the feature axis. |

Still open with these prices: CSV export in Pendum Body and Pendum Hydration before launch (the pricing review recommends it), whether Family Sharing is turned on for the two unlocks (treat it as permanent once on), and whether Apple offer codes cover non-consumables. The model question (unlock and trial for Lift and Macros, or all four as paid downloads first) was answered on 2026-10-04 with the recommended mixed model; see the launch checklist.
