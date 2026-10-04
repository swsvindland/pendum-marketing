import { listFormat, lowerFirst, sentenceCase } from "./format";
import type { App, AppSlug, Price } from "./types";
import { isShipped } from "./version";

/**
 * Pendum One's public build, as both store listings show it (verified 2026-10-03). Features, integrations and the
 * analytics statement with a later `since` stay hidden until it is raised.
 */
const pendumOneVersion = "1.7.0";

/**
 * The Pendum One build that first sends analytics. PostHog entered the app on 2026-09-30, after the 1.7.0 store
 * build (version bumped 2026-07-21, in the stores from 2026-07-23; docs/sources/owner-decisions.md), so the public
 * build sends none and the site says so until `version` reaches this.
 */
export const ANALYTICS_SINCE = "1.8.0";

const POSTHOG_SENTENCE =
  "send usage events and error reports to PostHog; events leave out weight, height, sex and measurements.";

/**
 * What an app's analytics statement says today. For the subscription app it is gated on `version` like a feature:
 * while the public build is older than ANALYTICS_SINCE it reads "None in the current build. From version 1.8.0 the
 * iPhone and Android apps send…", and once `version` reaches it the same sentence in the present tense, so the
 * release lands by raising `version`, never by editing copy. A one-time purchase app returns its own `analytics`
 * sentence (none sends any). `subject` is who sends, for prose that must name the product ("the Pendum One iPhone
 * and Android apps"). The at-a-glance row, the privacy list, both FAQ answers and the privacy page read it.
 */
export function analyticsSentence(
  app: Pick<App, "model" | "version" | "analytics">,
  subject = "the iPhone and Android apps"
): string {
  if (app.model !== "subscription") return app.analytics ?? "None.";
  if (isShipped({ since: ANALYTICS_SINCE }, app)) return `${sentenceCase(subject)} ${POSTHOG_SENTENCE}`;
  return `None in the current build. From version ${ANALYTICS_SINCE} ${subject} ${POSTHOG_SENTENCE}`;
}

/** A US price as both stores print it. Prices are the owner's decision of 2026-10-04 (owner-decisions.md). */
const usd = (amount: number, period: Price["period"]): Price => ({
  amount,
  currency: "USD",
  period,
  display: `$${amount.toFixed(2)}`,
});

const per = { once: "once", month: "a month", year: "a year" } as const;

/** A price with its period in words: "$19.99 once", "$7.99 a month". */
export const priceWithPeriod = (price: Price) => `${price.display} ${per[price.period]}`;

/**
 * The short price line for cards, readouts and lists, from the content's prices: "$9.99 once", "$19.99 once after
 * a 21-day free trial", "$7.99 a month or $49.99 a year". Empty while the app has no price.
 */
export function priceShort(app: Pick<App, "price" | "plans" | "unlock" | "trial">): string {
  if (app.plans?.length) return app.plans.map(priceWithPeriod).join(" or ");
  if (!app.price) return "";
  const base = priceWithPeriod(app.price);
  return app.unlock && app.trial ? `${base} after a ${app.trial.days}-day free trial` : base;
}

/**
 * The price in one or two sentences, for the at-a-glance table, the FAQ and llms.txt: how the app is had, what it
 * costs and any trial. Empty while the app has no price.
 */
export function priceSentence(app: Pick<App, "model" | "price" | "plans" | "unlock" | "trial" | "name">): string {
  if (!app.price) return "";
  if (app.model === "subscription") {
    const plans = (app.plans?.length ? app.plans : [app.price]).map(priceWithPeriod).join(" or ");
    const trial = app.trial
      ? ` New subscribers to the ${app.trial.plan === "month" ? "monthly" : "yearly"} plan start with a ${app.trial.days}-day free trial.`
      : "";
    return `Free to download, with a subscription of ${plans}.${trial}`;
  }
  if (app.unlock) {
    const trial = app.trial ? ` with a ${app.trial.days}-day free trial` : "";
    return `Free to download${trial}, then ${app.price.display} once to unlock it for good. No subscription.`;
  }
  return `${app.price.display}, paid once when you download it. No subscription.`;
}

/** Pendum One's plans in words, for the hand-written answers below ("$7.99 a month or $49.99 a year"). */
const pendumOnePlans = [usd(7.99, "month"), usd(49.99, "year")].map(priceWithPeriod).join(" or ");

/** Pendum One's analytics statement for the public build (see analyticsSentence). */
const pendumOneAnalytics = analyticsSentence({ model: "subscription", version: pendumOneVersion });

/**
 * The five apps, in site order. Every claim comes from docs/sources/app-facts.json, which checks each one against
 * the app repos: nothing from a fact sheet's notYetShipped is claimed, and its caveats travel in `caveats`.
 * Specimens are fictional example data and carry no `meta`, so the panel keeps its "Example" label.
 * Facts were last checked against the app repos on 2026-10-02 (`updated`); FAQ answers use full product names.
 * `chooser` and `note` restate each app's shipped features and caveats in their words (apps.test.ts checks them),
 * and Pendum One's analytics statements come from analyticsSentence() below, gated on `version`.
 */
export const apps: App[] = [
  {
    slug: "one",
    // Both store listings verified live on 2026-10-03: the iTunes lookup for id6755430666 ("OmegaFyt - Macros and
    // Workouts", seller Svindland Software LLC, version 1.7.0) and a 200 from the Google Play details page.
    released: true,
    name: "Pendum One",
    label: "Pendum One",
    version: pendumOneVersion,
    model: "subscription",
    tagline: "Training and nutrition, planned and tracked together",
    summary:
      "Pendum One is a workout and nutrition tracking app with one account that syncs across iPhone and Android. Calorie targets follow your trend weight.",
    definition:
      "Pendum One is a subscription workout and nutrition tracking app for iPhone and Android: one account keeps workouts, food, body measurements, supplements and soreness on the Pendum One server, so the same records open on each phone you sign in on.",
    category: "workout and nutrition tracking app",
    subCategory: "Workout and nutrition tracker",
    seoTitle: "Pendum One: workout and nutrition tracker, one account",
    backup: "Records are kept on the Pendum One server and open on every phone you sign in on.",
    analytics: pendumOneAnalytics,
    updated: "2026-10-02",
    chooser: {
      want: "I want training and nutrition in one app, on every phone",
      facts: "one account that syncs across iPhone and Android, targets that follow your trend",
    },
    icon: { light: "/apps/one.png" },
    glyph: "sync",
    // TODO(owner): add "Web" once the web address is public and set in stores.web. Until then the site describes
    // the web version (the same account in a browser, address not public yet) and never lists it as a platform.
    platforms: ["iPhone", "Android"],
    // Features with `since` newer than `version` are hidden, so the page only claims what the public build ships.
    features: [
      {
        title: "Sets that progress weekly",
        body: "Each set shows a recommended weight and rep count based on the same day last week. Volume can rise by one set a week up to a cap, and the last week is a lighter deload.",
        icon: "repeat",
      },
      {
        title: "Targets that follow your trend",
        body: "Daily calorie, protein, carb, fat and fiber targets follow your 7-day trend weight and a cut, bulk or maintenance plan. You can also set your own targets.",
        icon: "food",
      },
      {
        title: "Food search and barcode scan",
        body: "Search foods by name with suggestions as you type, or scan a barcode. Each food shows a full nutrition label, and recent foods log a serving in one tap.",
        icon: "scan",
      },
      {
        title: "Expenditure from your data",
        body: "Pendum One estimates the energy you use each day from logged intake and weight change over 14-day windows. Reports show weekly, monthly or yearly averages.",
        icon: "energy",
      },
      {
        title: "Body and strength reports",
        body: "Trend weight sits over your scale readings, beside 12-site measurements and a US Navy body-fat estimate. Strength charts track an estimated one-rep max for 11 main lifts.",
        icon: "chart",
      },
      {
        title: "Supplements and soreness",
        body: "Check off supplements across 7 time slots each day. Rate 14 muscle groups for soreness and see the day on a front and back body map.",
        icon: "check",
      },
      // TODO(owner): the program builder, saved gyms and the rest timer ship in 1.8.0 with the matching backend
      // deploy. Confirm both are live in the stores, then set `version` to "1.8.0" and these items appear.
      {
        title: "Programs built for your gym",
        body: "Choose a gym, 2 to 6 training days, sessions of 30 to 90 minutes and up to 3 muscles to bring up. The program uses only that gym’s equipment, or you can start a ready-made program or build your own.",
        icon: "lift",
        since: "1.8.0",
      },
      {
        title: "Rest timer on every set",
        body: "A rest timer starts when you log a set, timed to the exercise or the type of lift. It keeps its end time when the app closes.",
        icon: "timer",
        since: "1.8.0",
      },
    ],
    integrations: [
      {
        title: "Apple Health sync",
        body: "On iPhone, Pendum One imports weigh-ins from Apple Health and writes back your weight and daily calories, protein, carbs and fat. Sync is off until you turn it on.",
        icon: "health",
      },
      {
        title: "Health Connect on Android",
        body: "On Android, Pendum One reads weight and steps from Health Connect and writes weight and daily nutrition totals.",
        icon: "health",
      },
      {
        title: "Daily steps on Home",
        body: "With health sync on, Home shows the day’s steps against a goal you set. Steps come from the health app; Pendum One does not count them itself.",
        icon: "pulse",
      },
      {
        title: "Barcode camera",
        body: "The camera reads EAN-13, EAN-8, UPC-A and UPC-E codes on food packaging. The app does not use the microphone.",
        icon: "camera",
      },
      // TODO(owner): ships with the 1.8.0 rest timer (see features); hidden until `version` is "1.8.0".
      {
        title: "Rest notifications",
        body: "On iPhone and Android, a notification says when rest is over while the app is in the background, if notifications are allowed.",
        icon: "notification",
        since: "1.8.0",
      },
    ],
    privacy: [
      "An account is required. Sign-in goes through Clerk.",
      "Your logs are stored on the Pendum One server, hosted on Fly.io in the United States, so the same records open on every device.",
      "Food search and barcode lookups go through that server to the FatSecret food database.",
      `Analytics: ${lowerFirst(pendumOneAnalytics)}`,
      "Subscriptions go through RevenueCat with App Store and Google Play billing. On iPhone, RevenueCat also receives Apple Search Ads attribution.",
      "Health sync is off until you turn it on. Delete account in Settings removes your data from the server, then your sign-in.",
    ],
    languages: ["English"],
    units: "Imperial (lb, ft and in) or metric (kg, cm), set in Settings.",
    specimen: {
      eyebrow: "Today / Calories",
      hero: { value: "1,840", unit: "kcal", caption: "Target 2,096 to 2,150 kcal" },
      meter: { value: 1840, max: 2150, valueText: "1,840 of 2,096 to 2,150 kcal" },
      rows: [
        { label: "Protein", value: "142", unit: "g" },
        { label: "Carbs", value: "176", unit: "g" },
        { label: "Fat", value: "58", unit: "g" },
      ],
    },
    caveats: [
      "Calorie and macro targets, energy expenditure, body fat and one-rep max are estimates, not medical advice.",
      "Subscriptions are bought in the iPhone and Android apps. The web version has no checkout.",
      "Pendum One needs an account and a network connection. There is no offline mode.",
      "Health sync and steps are on iPhone and Android only. There is no iPad version.",
      "English only, with numbers and dates in your device’s regional format.",
    ],
    // Hold any question about the program builder, saved gyms, the rest timer or guided setup until `version` is
    // "1.8.0" (docs/sources/owner-decisions.md). Prices and trials are the owner's decision of 2026-10-04; no launch
    // date is stated.
    faq: [
      {
        question: "Where do I get Pendum One?",
        answer:
          "Pendum One is in the App Store for iPhone and on Google Play for Android, where the listings still show its former name, OmegaFyt. The subscription is bought inside the app through the store you downloaded it from; without it, the app opens to its paywall.",
      },
      {
        question: "Is Pendum One the same app as OmegaFyt?",
        answer:
          "Yes. Pendum One is the new name for OmegaFyt. It is the same app with the same account, and the App Store and Google Play listings show the old name until they are renamed.",
      },
      {
        question: "Does Pendum One work offline?",
        answer:
          "No. Pendum One needs an account and a network connection. Records are read and saved through the Pendum One server, so there is no offline mode.",
      },
      {
        question: "Is there a free version or a free trial of Pendum One?",
        answer:
          `Creating an account is free. On iPhone and Android, the Home, Workout, Eat, Supplements and Reports screens need a Pendum One subscription, and there is no ongoing free tier. The subscription is ${pendumOnePlans}; new subscribers to the yearly plan start with a 7-day free trial, and the monthly plan has no trial.`,
      },
      {
        question: "Can I use one Pendum One account on iPhone and Android?",
        answer:
          "Yes. All Pendum One records live on the Pendum One server, so the same account and the same data open on each phone you sign in on.",
      },
      {
        question: "Does Pendum One have a web version?",
        answer:
          "Yes. The same Pendum One account opens in a browser, and its address is not public yet. The web version has no checkout and no health sync.",
      },
      {
        question: "Does Pendum One sync with Apple Health or Health Connect?",
        answer:
          "Only once you turn it on. On iPhone, Pendum One imports weigh-ins from Apple Health and writes weight and daily calories, protein, carbs and fat. On Android it reads weight and steps from Health Connect and writes weight and daily nutrition totals.",
      },
      {
        question: "Where is my Pendum One data stored?",
        answer:
          "On the Pendum One server, hosted on Fly.io in the United States with a PostgreSQL database. Food search and barcode lookups go through that server to the FatSecret food database. Delete account in Settings removes your data from the server, then your sign-in.",
      },
      {
        question: "Does Pendum One send analytics?",
        // Gated on `version` with the analytics row above: the answer changes itself when 1.8.0 ships.
        answer: analyticsSentence(
          { model: "subscription", version: pendumOneVersion },
          "the Pendum One iPhone and Android apps"
        ),
      },
      {
        question: "How much does Pendum One cost?",
        answer: `Pendum One is free to download, and the subscription is ${pendumOnePlans}, billed by the App Store or Google Play. The yearly plan works out to about ${usd(49.99 / 12, "month").display} a month and starts with a 7-day free trial for new subscribers. Creating an account is free.`,
      },
      {
        question: "How do I cancel Pendum One?",
        answer:
          "In the subscription settings of the store you subscribed through: the App Store on iPhone or Google Play on Android. Deleting the Pendum One app does not cancel the subscription.",
      },
      {
        question: "What happens to my data if I stop Pendum One?",
        answer:
          "Without the subscription, the Pendum One iPhone and Android apps open to the paywall, where you can subscribe again, restore a purchase, sign out or delete the account. Delete account removes your records from the Pendum One server and then your sign-in.",
      },
      {
        question: "Does Pendum One have an Apple Watch or iPad app?",
        answer:
          "No. Pendum One runs on iPhone and Android phones, with no Apple Watch, Wear OS or iPad version.",
      },
      {
        question: "Which languages does Pendum One support?",
        answer: "Pendum One is in English only, with numbers and dates in your device’s regional format.",
      },
    ],
    stores: {
      appStore: "https://apps.apple.com/app/id6755430666",
      googlePlay: "https://play.google.com/store/apps/details?id=dev.svindland.fitness",
      // TODO(owner): the public web address (docs/sources/owner-decisions.md).
      web: null,
      state: "live",
    },
    // The owner's prices (2026-10-04): set them in App Store Connect, Google Play and RevenueCat before this site
    // goes live, so the paywall and the site agree.
    price: usd(49.99, "year"),
    plans: [usd(7.99, "month"), usd(49.99, "year")],
    trial: { days: 7, plan: "year" },
    // The listings keep the old name until the rename reaches the stores (docs/sources/owner-decisions.md).
    storeName: "OmegaFyt",
    calculators: ["tdee", "macros", "one-rep-max", "body-fat"],
  },
  {
    slug: "body",
    released: false,
    name: "Pendum Body",
    // TODO(owner): the rename to Pendum Body is pending sign-off and the build still says VECTOR BODY. The label is
    // the planned home-screen name, so the site does not show it.
    label: "Body",
    model: "purchase",
    tagline: "Weight trend, tape measurements and progress photos",
    summary:
      "Pendum Body is a weight and body measurement app for iPhone and Android: trend weight, 16 tape sites, body fat, FFMI and progress photos, with no account.",
    definition:
      "Pendum Body is a one-time purchase weight and body measurement app for iPhone and Android: it records weight, 16 tape sites and progress photos, shows a smoothed weight trend with BMI, body fat and FFMI, and keeps every record on the phone with no account.",
    category: "weight and body measurement app",
    subCategory: "Body composition tracker",
    seoTitle: "Pendum Body: weight trend and body measurement app, one-time purchase",
    backup: "None in the app; your phone’s own device backup may include its records and photos.",
    analytics: "None: no analytics, advertising or crash reporting, and no network requests of its own.",
    updated: "2026-10-02",
    chooser: {
      want: "I track weight, tape sites and progress photos",
      facts: "smoothed weight trend, 16 tape measurement sites, body fat from a tape",
    },
    icon: { light: "/apps/body.png", dark: "/apps/body-dark.png" },
    glyph: "scale",
    platforms: ["iPhone", "Android"],
    features: [
      {
        title: "Smoothed weight trend",
        body: "Trend weight averages each day’s weigh-ins and smooths them with a 7-day half-life. The chart shows the daily averages beside the trend.",
        icon: "chart",
      },
      {
        title: "16 tape measurement sites",
        body: "Record up to 16 circumference sites, from neck and shoulders to each ankle. Add a measured body-fat percentage in the same session.",
        icon: "ruler",
      },
      {
        title: "Body fat from a tape",
        body: "The US Navy circumference method estimates body fat from your height and 2 or 3 tape sites. A measured percentage takes precedence over the estimate.",
        icon: "calculator",
      },
      {
        title: "Four readouts on one dashboard",
        body: "The dashboard shows BMI, body fat, FFMI and shoulder-to-waist ratio. BMI, body fat and FFMI carry adult reference labels, and the ratio compares against a 1.62 physique goal.",
        icon: "scale",
      },
      {
        title: "Private progress photos",
        body: "Take or choose front, side and back photos. They sit on a dated timeline you can filter by pose, in the app’s private storage.",
        icon: "photo",
      },
      {
        title: "Sources and methods",
        body: "Each metric explains its method and links to its source, such as the CDC or the US Army standard AR 600-9. The explanations are stored in the app and work offline.",
        icon: "document",
      },
      {
        title: "Edit and backdate entries",
        body: "Add, edit, delete and backdate weight, height and body entries. Records imported from a health app are read-only.",
        icon: "date",
      },
      {
        title: "Described for screen readers",
        body: "The trend chart reads out its date range, low, high, latest value and direction. History rows offer edit and delete as screen reader actions.",
        icon: "person",
      },
    ],
    integrations: [
      {
        title: "Apple Health sync",
        body: "Weight and height sync both ways, and recorded body fat and waist circumference export to Apple Health. Sync is off until you turn it on.",
        icon: "health",
      },
      {
        title: "Health Connect sync",
        body: "On Android, weight and height sync both ways and recorded body fat exports. Imports cover the most recent 29 days.",
        icon: "health",
      },
      {
        title: "Sync once a day",
        body: "With sync on, it runs at most once a day, in the background when the system allows. Automatic runs never open a permission prompt.",
        icon: "sync",
      },
      {
        title: "No duplicate health records",
        body: "Repeat syncs do not add duplicates. An edit replaces the exported record, and a deleted entry leaves the health app on the next sync.",
        icon: "check",
      },
      {
        title: "Camera and photo library",
        body: "Progress photos come from the camera or your photo library. Camera access is requested only when you take a photo.",
        icon: "camera",
      },
    ],
    privacy: [
      "No account, no sign-in and no server.",
      "No analytics, advertising or crash reporting, and no network requests of its own. Source links open in your browser.",
      "Records live in a database on your phone. Progress photos are kept in the app’s private storage.",
      "Health sync is off until you turn it on. Progress photos, the other tape sites and calculated estimates are not sent to Apple Health or Health Connect.",
      "There is no cloud backup. Your phone’s own device backup may include the app’s data.",
    ],
    languages: [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Dutch",
      "Swedish",
      "Japanese",
      "Korean",
      "Simplified Chinese",
    ],
    units: "Metric, imperial or decimal stone. Switching units does not rewrite history.",
    specimen: {
      eyebrow: "Trend / Weight",
      hero: { value: "79.4", unit: "kg", caption: "Latest reading 79.1 kg" },
      rows: [
        { label: "BMI", value: "24.0", unit: "kg/m²" },
        { label: "Body fat", value: "18.0", unit: "%" },
        { label: "FFMI", value: "19.7", unit: "kg/m²" },
      ],
    },
    caveats: [
      "BMI, body fat and FFMI are general adult references, not medical advice or a diagnosis. They do not apply to children.",
      "The tape estimate depends on technique. The 1.62 shoulder-to-waist goal is a physique comparison, not a health target.",
      "Trend weight is a smoothed average. Early trends are provisional and differ from your latest reading.",
      "There is no cloud backup. Deleting the app may remove your records and photos.",
      "Example readouts on this site are fictional, and results vary.",
    ],
    faq: [
      {
        question: "Does Pendum Body need an account or a subscription?",
        answer:
          "No. Pendum Body is a one-time purchase with no account, no sign-in, no server and no analytics. Your records live in a database on your phone.",
      },
      {
        question: "Does Pendum Body work offline?",
        answer:
          "Yes. Pendum Body makes no network requests of its own, so logging and every estimate work without a connection. Source links open in your browser.",
      },
      {
        question: "Where are my progress photos stored?",
        answer:
          "In Pendum Body’s private storage on your phone. Photos are not sent to Apple Health or Health Connect, and there is no cloud backup.",
      },
      {
        question: "Does Pendum Body estimate body fat?",
        answer:
          "Yes. Pendum Body uses the US Navy circumference method, from your height and 2 or 3 tape sites. A measured percentage takes precedence over the estimate. It is a general adult reference, not medical advice.",
      },
      {
        question: "What is the trend weight in Pendum Body?",
        answer:
          "Pendum Body’s trend weight is the average of each day’s weigh-ins, smoothed with a 7-day half-life. Early trends are provisional and differ from your latest reading.",
      },
      {
        question: "Does Pendum Body sync with Apple Health or Health Connect?",
        answer:
          "Once you turn it on in Pendum Body. Weight and height sync both ways, recorded body fat exports to both, and waist circumference to Apple Health. Health Connect imports cover the most recent 29 days, and sync runs at most once a day.",
      },
      {
        question: "Is there a backup, and what if I lose my phone?",
        answer:
          "There is no backup in Pendum Body. Your phone’s own device backup may include its records and photos, and deleting the app may remove them.",
      },
      {
        question: "Is Pendum Body on Android or Apple Watch?",
        answer:
          "Pendum Body runs on iPhone and Android phones. There is no Apple Watch app and no iPad version.",
      },
      {
        question: "Which units does Pendum Body use?",
        answer:
          "Pendum Body uses metric, imperial or decimal stone, with height in centimeters or feet and inches. Switching units does not rewrite history.",
      },
      {
        question: "Which languages does Pendum Body support?",
        answer: "Pendum Body’s interface is in 11 languages. Units stay independent of language.",
      },
    ],
    stores: { appStore: null, googlePlay: null },
    price: usd(9.99, "once"),
    calculators: ["bmi", "body-fat", "ffmi"],
  },
  {
    slug: "lift",
    released: false,
    name: "Pendum Lift",
    label: "Lift",
    model: "purchase",
    tagline: "Strength programs that write every set",
    summary:
      "Pendum Lift is a strength training app for iPhone, Android and Apple Watch, bought once. It builds a program for your gym and prescribes every set.",
    definition:
      "Pendum Lift is a one-time purchase strength training app for iPhone, Android and Apple Watch that builds a program for your gym, prescribes load, reps and reps in reserve for every set, and keeps every workout on the phone with no account.",
    category: "strength training app",
    subCategory: "Strength training tracker",
    seoTitle: "Pendum Lift: strength training app, one-time purchase",
    backup: "An encrypted file protected by a password you choose, saved where you choose.",
    analytics: "None: no analytics or tracking, and no network requests of its own.",
    updated: "2026-10-02",
    chooser: {
      want: "I lift and want every set written for me",
      facts: "every set prescribed, loads your gym can make, Apple Watch logging",
    },
    icon: { light: "/apps/lift.png", dark: "/apps/lift-dark.png" },
    glyph: "lift",
    platforms: ["iPhone", "Android", "Apple Watch"],
    features: [
      {
        title: "Every set prescribed",
        body: "Each program session sets load, reps and reps in reserve from your last performance, how hard it felt and the week’s target. Every exercise shows a one-line reason.",
        icon: "lift",
      },
      {
        title: "A program from four questions",
        body: "Pick a gym, then answer days a week, minutes a session, years lifting and weeks before the deload. The builder makes 4 to 6 training weeks with a deload week at the end, and every part can be edited.",
        icon: "tools",
      },
      {
        title: "Bring your own program",
        body: "Paste a program with lines like Bench Press 3x6-8 and it opens in the program editor. Type bench 225x5x3 and the sets are matched to the library, ready to confirm.",
        icon: "document",
      },
      {
        title: "One tap per set",
        body: "A set done as prescribed is one tap, with last time’s weight and reps beside it. Each set is saved as it is checked, so a workout survives the app closing.",
        icon: "check",
      },
      {
        title: "Loads your gym can make",
        body: "Each gym keeps its bar, plates, dumbbell steps and machine steps, in kg or lb. Prescriptions round to loads it can make, with the plates per side shown for barbell sets.",
        icon: "calculator",
      },
      {
        title: "Volume that follows recovery",
        body: "After a session, 2 optional taps per muscle, for workload and soreness, set next week’s sets. Without an answer, hitting your reps decides.",
        icon: "pulse",
      },
      {
        title: "Training while you travel",
        body: "Pick a travel gym and your last day there. Sessions swap in the closest exercises it can do, and back home your loads pick up from before you left.",
        icon: "travel",
      },
      {
        title: "258 exercises, mapped by muscle",
        body: "Each exercise lists primary and secondary muscles across 17 groups, with front, side and rear delts counted apart. Search reads gym shorthand such as rdl, db and ohp.",
        icon: "person",
      },
      {
        title: "Progress at a glance",
        body: "An 8-week heatmap shows hard sets per muscle, beside estimated one-rep max trends, recent records and body weight. Each exercise has its own strength chart.",
        icon: "chart",
      },
    ],
    integrations: [
      {
        title: "Apple Watch logging",
        body: "Start the next session or follow the one on your phone, and log a set in one tap with load and reps on the Digital Crown. The watch taps your wrist when rest is over.",
        icon: "watch",
      },
      {
        title: "Rest on the Lock Screen",
        body: "On iPhone, a Live Activity counts down rest on the Lock Screen and, on iPhones that have one, in the Dynamic Island. Tapping it opens the workout.",
        icon: "timer",
      },
      {
        title: "Apple Health and Health Connect",
        body: "With sync on, body weight syncs both ways and finished workouts are saved as strength training with their name and times. Sets and loads stay in the app, and no calories are estimated.",
        icon: "health",
      },
      {
        title: "Rest alerts",
        body: "A notification says when rest ends while the app is in the background. On Android, an ongoing notification shows the time rest ends.",
        icon: "notification",
      },
      {
        title: "Actions on the app icon",
        body: "Press and hold the app icon to resume the open workout, start the next session or start an empty workout.",
        icon: "phone",
      },
    ],
    privacy: [
      "No account, no sign-in and no server.",
      "No analytics or tracking. The app makes no network requests of its own.",
      "Workouts live in a database on your phone. Erase all data removes every record the app holds.",
      "Health sync is off until you turn it on. It shares body weight and finished workouts, not your sets or loads.",
      "Backups are encrypted files, protected by a password you choose and saved where you choose. The password is not stored and cannot be recovered.",
      "Your phone’s own device backup may include the app’s data, and CSV exports are not encrypted.",
    ],
    languages: [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Dutch",
      "Swedish",
      "Japanese",
      "Korean",
      "Simplified Chinese",
    ],
    units: "Kilograms or pounds. Each gym keeps its plates in its own unit, so 225 lb stays exactly 225 lb.",
    specimen: {
      eyebrow: "Week 3 / Bench press",
      hero: { value: "102.5", unit: "kg", caption: "Set 2 of 4, up from 100 kg last time" },
      meter: { value: 2, max: 4, valueText: "Set 2 of 4" },
      rows: [
        { label: "Target", value: "8", unit: "reps" },
        { label: "In reserve", value: "2", unit: "reps" },
        { label: "Plates per side", value: "25 + 15 + 1.25", unit: "kg" },
      ],
    },
    caveats: [
      "Prescriptions follow the app’s own progression rules. They are not individual coaching or medical advice.",
      "Estimated one-rep max uses the Epley formula, which runs high at high reps. Estimates past about 12 reps are rough.",
      "Backup passwords cannot be recovered, and a restore replaces your records rather than merging them.",
      "Exercise and muscle names are in English in every language, and the Apple Watch app is in English only.",
      "The Apple Watch app needs the iPhone app. There is no iPad version.",
    ],
    faq: [
      {
        question: "Does Pendum Lift work offline?",
        answer:
          "Yes. Pendum Lift makes no network requests of its own, and every workout lives in a database on your phone. Health sync is optional and off until you turn it on.",
      },
      {
        question: "Does Pendum Lift need an account or a subscription?",
        answer:
          "No. Pendum Lift is a one-time purchase with no account, no server and no subscription, so there is nothing to renew.",
      },
      {
        question: "Can I run my own program in Pendum Lift?",
        answer:
          "Yes. Paste a program with lines like Bench Press 3x6-8 into Pendum Lift and it opens in the program editor, or type bench 225x5x3 and the sets are matched to the library, ready to confirm. Every part of a built program can be edited too.",
      },
      {
        question: "Does Pendum Lift build a program for me?",
        answer:
          "Yes. In Pendum Lift, pick a gym, then answer days a week, minutes a session, years lifting and weeks before the deload. The builder makes 4 to 6 training weeks with a deload week at the end, and every part can be edited before you start.",
      },
      {
        question: "How does Pendum Lift choose the weight for each set?",
        answer:
          "Each Pendum Lift program session sets load, reps and reps in reserve from your last performance, how hard it felt and the week’s target, rounded to loads your gym can make. Every exercise shows a one-line reason. These are the app’s own progression rules, not individual coaching.",
      },
      {
        question: "Does Pendum Lift have an Apple Watch app?",
        answer:
          "Yes. On the watch, start the next session or follow the one on your phone, log a set in one tap with load and reps on the Digital Crown, and feel a tap when rest is over. The Pendum Lift watch app needs the iPhone app and is in English only.",
      },
      {
        question: "Does Pendum Lift have a rest timer?",
        answer:
          "Yes. In Pendum Lift, rest starts on each checked set, with a length set by the exercise. On iPhone a Live Activity counts down on the Lock Screen and, on iPhones that have one, in the Dynamic Island; a notification says when rest ends while the app is in the background. On Android, an ongoing notification shows the time rest ends.",
      },
      {
        question: "How many exercises does Pendum Lift have?",
        answer:
          "Pendum Lift has 258 exercises. Each lists its primary and secondary muscles across 17 muscle groups, and search reads gym shorthand such as rdl, db and ohp.",
      },
      {
        question: "Does Pendum Lift sync with Apple Health or Health Connect?",
        answer:
          "Once you turn it on, body weight syncs both ways and finished workouts are saved as strength training with their name and start and end times. Sets and loads stay in Pendum Lift, and no calories are estimated.",
      },
      {
        question: "How do I back up Pendum Lift, or move it to a new phone?",
        answer:
          "Make an encrypted backup in Pendum Lift: a file protected by a password you choose, saved where you choose from the share sheet. Restore it on the new phone with the same password. The password is not stored and cannot be recovered, a restore replaces your records rather than merging them, and sets and body weight also export as CSV.",
      },
      {
        question: "Is Pendum Lift on Android?",
        answer:
          "Yes. Pendum Lift runs on iPhone and Android phones. The Apple Watch app and the Lock Screen countdown are iPhone features; on Android an ongoing notification shows when rest ends. There is no iPad version.",
      },
      {
        question: "Which languages does Pendum Lift support?",
        answer:
          "Pendum Lift’s interface is in 11 languages. Exercise and muscle names are in English in every language, and the Apple Watch app is in English only.",
      },
    ],
    stores: { appStore: null, googlePlay: null },
    price: usd(19.99, "once"),
    unlock: true,
    trial: { days: 21 },
    calculators: ["one-rep-max", "plates", "strength-score"],
  },
  {
    slug: "macros",
    released: false,
    name: "Pendum Macros",
    label: "Macros",
    model: "purchase",
    tagline: "Calories and macros, with 3.2 million foods offline",
    summary:
      "Pendum Macros is a calorie and macro tracker for iPhone and Android with 3.2 million foods offline, a weekly check-in and no account, bought once.",
    definition:
      "Pendum Macros is a one-time purchase calorie and macro tracker for iPhone and Android with 3.2 million foods searchable offline, barcode and nutrition label scanning, a weekly check-in that proposes target changes, and no account, no server and no analytics.",
    category: "calorie and macro tracker",
    subCategory: "Calorie and macro tracker",
    seoTitle: "Pendum Macros: offline calorie and macro tracker, one-time purchase",
    backup: "An encrypted file protected by a password you choose, saved where you choose; there is no backup server.",
    analytics: "None: no analytics or crash reporting, and the app’s own code makes no network requests.",
    updated: "2026-10-02",
    chooser: {
      want: "I count calories and macros and want it offline",
      facts: "3.2 million foods offline, weekly adaptive check-ins, no account",
    },
    // The storage caveat below, restated for the page header (CRO-12): a buyer reads it before the store button.
    note: "The food catalogs ship inside the app: about 590 MB on the phone, about twice that installed on Android.",
    icon: { light: "/apps/macros.png", dark: "/apps/macros-dark.png" },
    glyph: "food",
    platforms: ["iPhone", "Android"],
    features: [
      {
        title: "3.2 million foods offline",
        body: "Search 7,793 USDA foods and 3,192,971 packaged foods from 184 countries with no connection. Search forgives typos and ranks foods sold in your region first.",
        icon: "food",
      },
      {
        title: "Weekly adaptive check-ins",
        body: "A cut, bulk or maintenance program sets calories and macros from your profile. Each week a check-in compares your logged intake with your weight trend and proposes a change of at most 150 kcal, which you accept, keep or adjust.",
        icon: "date",
      },
      {
        title: "Photo and description logging",
        body: "On phones with Apple Intelligence or Gemini Nano, a photo, a description or both become an editable draft of foods and estimated portions. The model runs on the phone, and nothing is uploaded.",
        icon: "analysis",
      },
      {
        title: "Barcode and label scanning",
        body: "Scan EAN-13, EAN-8, UPC-A, UPC-E and ITF-14 barcodes, or type the number. For an unknown product, a photo of its Nutrition Facts panel fills in a new food for you to check.",
        icon: "scan",
      },
      {
        title: "Log again ranks your foods",
        body: "Foods are ranked by how often, how recently and at what hour you eat them. Amounts take grams, ounces, volumes or the food’s own portions, and every diary change has Undo.",
        icon: "repeat",
      },
      {
        title: "Recipes and saved meals",
        body: "Build recipes from food search and log whole or partial servings. Save meals, and copy a meal or a whole day.",
        icon: "document",
      },
      {
        title: "34 nutrients per food",
        body: "A food shows up to 34 nutrients beyond calories and macros, from fiber and sodium to vitamins and caffeine. Day totals are set against FDA Daily Values where one exists.",
        icon: "health",
      },
      {
        title: "Calorie shifting",
        body: "In a program, give 1 to 6 chosen weekdays more calories. The other days give up the same total, so the week stays on budget.",
        icon: "swap",
      },
    ],
    integrations: [
      {
        title: "Apple Health and Health Connect",
        body: "Sync is off until you turn it on. Weight and height sync both ways, and logged food is written with its macros, vitamins and minerals.",
        icon: "health",
      },
      {
        title: "Home and Lock Screen widgets",
        body: "On iPhone, widgets show calories left with protein, carbs and fat, and buttons that open the scanner or the photo logger. Lock Screen widgets come in circular, rectangular and inline sizes.",
        icon: "phone",
      },
      {
        title: "Shortcuts and Action Button",
        body: "App links open the log, search, scanner, photo logger or weigh-in. A Shortcuts Open URL action can run them from the Action Button.",
        icon: "link",
      },
      {
        title: "On-device AI models",
        body: "Photo logging uses Apple Foundation Models on iPhone and Gemini Nano on Android. Only the on-device model is used, never Private Cloud Compute.",
        icon: "analysis",
      },
      {
        title: "On-device text recognition",
        body: "Label scanning reads text with Apple Vision on iPhone and ML Kit on Android. It needs no Apple Intelligence and no model download.",
        icon: "scanText",
      },
    ],
    privacy: [
      "No account and no sign-in.",
      "No analytics or crash reporting. The app’s own code makes no network requests, and food search runs on catalogs stored on the phone.",
      "Your diary lives in a database on your phone. Meal photos are deleted from the app’s cache when the photo logger closes, and label photos once they are read.",
      "Health sync is off until you turn it on.",
      "Backups are encrypted files, protected by a password you choose and saved where you choose. There is no backup server, and the password cannot be recovered.",
      "On Android, text recognition, the barcode scanner and Gemini Nano are Google system components that follow Google’s own terms.",
    ],
    languages: ["English"],
    units: "Body weight in kg, lb or stone. Food in grams, ounces, volumes or portions. Energy in kcal.",
    specimen: {
      eyebrow: "Today / Calories",
      hero: { value: "1,240", unit: "kcal left", caption: "1,060 of 2,300 kcal logged" },
      meter: { value: 1060, max: 2300, valueText: "1,060 of 2,300 kcal" },
      rows: [
        { label: "Protein", value: "90 / 165", unit: "g" },
        { label: "Carbs", value: "100 / 252", unit: "g" },
        { label: "Fat", value: "34 / 70", unit: "g" },
      ],
    },
    caveats: [
      "Coaching uses the app’s own approximate method, which is not clinically validated. Targets, expenditure and trend weight are estimates for general tracking, not medical advice.",
      "Coaching is for adults 18 and over who are not pregnant or breastfeeding. Medical nutrition needs and eating disorder care need professional guidance.",
      "Check-ins wait until the last 21 days hold at least 12 logged days and 6 weigh-ins, so the first one can take 2 to 3 weeks.",
      "Photo logging needs an eligible iPhone with Apple Intelligence, on iOS 27 for photos and iOS 26 or later for descriptions, or an Android phone with Gemini Nano. Its foods and portions are estimates for you to review.",
      "Packaged food data comes from Open Food Facts under ODbL 1.0, and generic foods from the USDA. Community label data can contain errors.",
      "The food catalogs ship with the app, so it needs a lot of storage. The catalogs alone take about 590 MB on the phone, and an Android install takes about twice that.",
    ],
    faq: [
      {
        question: "Does Pendum Macros need a subscription or an account?",
        answer:
          "No. Pendum Macros is a one-time purchase with no subscription, no account, no sign-in and no server. Your diary lives in a database on your phone.",
      },
      {
        question: "Does Pendum Macros work offline?",
        answer:
          "Yes. Pendum Macros runs food search and barcode lookup against catalogs stored on the phone, and the app’s own code makes no network requests. Apple Health and Health Connect sync is optional and off until you turn it on.",
      },
      {
        question: "How many foods does Pendum Macros have?",
        answer:
          "Pendum Macros has 3.2 million: 7,793 USDA foods and 3,192,971 packaged foods from 184 countries, all searchable offline. Packaged food data comes from Open Food Facts under ODbL 1.0 and generic foods from the USDA, and community label data can contain errors.",
      },
      {
        question: "How much storage does Pendum Macros need?",
        answer:
          "A lot, because the food catalogs ship inside Pendum Macros. The catalogs alone take about 590 MB on the phone, and an Android install takes about twice that. Catalog updates ship with app updates.",
      },
      {
        question: "Which barcodes can Pendum Macros scan?",
        answer:
          "Pendum Macros scans EAN-13, EAN-8, UPC-A, UPC-E and ITF-14 barcodes, or you can type the number. For an unknown product, a photo of its Nutrition Facts panel fills in a new food for you to check. Barcode and label scanning need no AI model.",
      },
      {
        question: "Can Pendum Macros log a meal from a photo?",
        answer:
          "On phones with Apple Intelligence or Gemini Nano, Pendum Macros turns a photo, a description or both into an editable draft of foods and estimated portions. The model runs on the phone and nothing is uploaded. Photos need an eligible iPhone on iOS 27, descriptions iOS 26 or later, or an Android phone with Gemini Nano.",
      },
      {
        question: "Does Pendum Macros set my calorie target?",
        answer:
          "A cut, bulk or maintenance program in Pendum Macros sets calories and macros from your profile, and manual targets stay available. A weekly check-in compares logged intake with your weight trend and proposes a change of at most 150 kcal, which you accept, keep or adjust. The method is the app’s own and is not clinically validated; targets are estimates, not medical advice.",
      },
      {
        question: "Does Pendum Macros sync with Apple Health or Health Connect?",
        answer:
          "Yes, once you turn it on in Pendum Macros. Weight and height sync both ways, and logged food is written with its macros, vitamins and minerals.",
      },
      {
        question: "How do I back up Pendum Macros, or move it to a new phone?",
        answer:
          "Pendum Macros backups are encrypted files (AES-256-GCM) protected by a password you choose and saved where you choose from the share sheet, so restore one on the new phone with the same password. There is no backup server, and the password cannot be recovered. CSV exports cover food, weight and targets.",
      },
      {
        question: "Is Pendum Macros on Android or Apple Watch?",
        answer:
          "Pendum Macros runs on iPhone and Android phones. Widgets and Shortcuts are iPhone features, and on Android, text recognition, the barcode scanner and Gemini Nano are Google system components. There is no Apple Watch app and no iPad version.",
      },
    ],
    stores: { appStore: null, googlePlay: null },
    price: usd(19.99, "once"),
    unlock: true,
    trial: { days: 21 },
    calculators: ["tdee", "macros", "protein", "calorie-deficit"],
  },
  {
    slug: "hydration",
    released: false,
    name: "Pendum Hydration",
    // TODO(owner): the rename is pending sign-off; the build still says VECTOR HYDRATION with the label HYDRATE.
    // The label is the planned home-screen name, so the site does not show it.
    label: "Hydration",
    model: "purchase",
    tagline: "Fluids, caffeine and alcohol, logged in one tap",
    summary:
      "Pendum Hydration is a water intake tracker for iPhone, Android and Apple Watch that logs drinks, caffeine and alcohol in one tap, with no account.",
    definition:
      "Pendum Hydration is a one-time purchase water intake tracker for iPhone, Android and Apple Watch that logs drinks toward a daily goal with caffeine and alcohol totals and reminders, and keeps the log on the phone with no account.",
    category: "water intake tracker",
    subCategory: "Water intake tracker",
    seoTitle: "Pendum Hydration: water intake tracker, one-time purchase",
    backup: "None in the app, and no export; deleting the app removes the log.",
    analytics: "None: no analytics, crash reporting or ads, and no network requests of its own.",
    updated: "2026-10-02",
    chooser: {
      want: "I log drinks, caffeine and alcohol",
      facts: "one tap logs a drink, a reminder comes each hour only when you are behind plan, Apple Watch app",
    },
    icon: { light: "/apps/hydration.png", dark: "/apps/hydration-dark.png" },
    glyph: "water",
    platforms: ["iPhone", "Android", "Apple Watch"],
    features: [
      {
        title: "One tap logs a drink",
        body: "Today shows your favorite drinks in a grid, and one tap logs a drink at the selected size. Undo takes it back.",
        icon: "add",
      },
      {
        title: "41 drinks ready to log",
        body: "Presets cover water, coffee, tea, juice, milk, energy drinks and alcohol. Add your own drinks with a size, caffeine and alcohol by volume.",
        icon: "coffee",
      },
      {
        title: "A daily fluid goal",
        body: "Non-alcoholic drinks count toward the goal, coffee and tea included. It starts at 2,500 mL, and you set your own.",
        icon: "water",
      },
      {
        title: "Caffeine and alcohol totals",
        body: "Today shows caffeine in milligrams and pure alcohol in grams beside your fluid progress. Caffeine scales with the size you log.",
        icon: "energy",
      },
      {
        title: "Reminders that follow your day",
        body: "Set a wake-up time and bedtime for the week or for each day. A reminder comes each hour only when you are behind plan, and none come in the wind-down before bed.",
        icon: "notification",
      },
      {
        title: "History by day, week or month",
        body: "Each period shows total fluids, a daily average, caffeine and alcohol, then the drinks logged each day.",
        icon: "history",
      },
      {
        title: "Every entry stays editable",
        body: "Change a drink, its size or when it was logged. Delete it, and Undo brings it back.",
        icon: "time",
      },
      {
        title: "Optional BAC estimate",
        body: "Off by default, and a rough estimate only: never use it to decide whether to drive. With it on and a body weight entered or read from the health app, Today shows an estimated blood alcohol content and a 6-hour trend.",
        icon: "alcohol",
      },
    ],
    integrations: [
      {
        title: "Apple Watch app",
        body: "The watch shows today’s progress and up to 24 favorites. Turn the Digital Crown to browse, tap one to log it, and you have 4 seconds to undo.",
        icon: "watch",
      },
      {
        title: "Log from the reminder",
        body: "Each reminder has a button that logs a glass of water at your default size without opening the app.",
        icon: "notification",
      },
      {
        title: "Apple Health sync",
        body: "Off until you turn it on. It exports non-alcoholic fluids, caffeine, standard drinks and any BAC estimates, and reads your latest weight for the BAC estimate.",
        icon: "health",
      },
      {
        title: "Health Connect sync",
        body: "On Android it exports non-alcoholic fluids and caffeine; alcohol and BAC stay on the phone.",
        icon: "health",
      },
      {
        title: "Schedule from a sentence",
        body: "On iPhones with Apple Intelligence, describe your routine in plain words and Apple’s on-device model sets a week of wake-up times and bedtimes. The description is not uploaded.",
        icon: "analysis",
      },
    ],
    privacy: [
      "No account and no sign-in.",
      "No analytics, crash reporting or ads. The app makes no network requests of its own.",
      "Drink logs live in a database on your phone. There is no backup or export, so deleting the app removes them.",
      "Health sync is off until you turn it on. Turning it off stops new exports and leaves earlier ones in the health app.",
      "Reminders are local notifications scheduled on the phone. There is no push server.",
      "The Apple Watch app talks to the iPhone app directly.",
    ],
    languages: [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Dutch",
      "Swedish",
      "Japanese",
      "Korean",
      "Simplified Chinese",
    ],
    units: "Metric (mL, kg) or US (fl oz, lb). The starting choice follows your region.",
    specimen: {
      eyebrow: "Today / Fluids",
      hero: { value: "1,750", unit: "mL", caption: "Daily fluid goal 2,500 mL" },
      meter: { value: 1750, max: 2500, valueText: "1,750 of 2,500 mL" },
      rows: [
        { label: "Caffeine", value: "158", unit: "mg" },
        { label: "Pure alcohol", value: "0.0", unit: "g" },
        { label: "Drink size", value: "250", unit: "mL" },
      ],
    },
    caveats: [
      "Progress measures what you log, not how hydrated you are. The 2,500 mL starting goal is not a personal recommendation.",
      "The BAC estimate is a rough calculation, not a measurement. Never use it to decide whether to drive or whether someone is sober, even at 0.000%.",
      "Caffeine and alcohol values on preset drinks are estimates. Check the label.",
      "Reminders and background sync run when iOS or Android allows. If the app goes unopened for about 4 days, reminders stop.",
      "The Apple Watch app needs the iPhone app. Brand names in the presets do not imply endorsement.",
    ],
    faq: [
      {
        question: "Does Pendum Hydration need a subscription or an account?",
        answer:
          "No. Pendum Hydration is a one-time purchase with no account, no server and no subscription. Drink logs live in a database on your phone.",
      },
      {
        question: "Does Pendum Hydration work offline?",
        answer:
          "Yes. Pendum Hydration makes no network requests of its own. Reminders are local notifications scheduled on the phone, with no push server.",
      },
      {
        question: "Does Pendum Hydration have an Apple Watch app?",
        answer:
          "Yes. The Pendum Hydration watch app shows today’s progress and up to 24 favorite drinks. Turn the Digital Crown to browse, tap one to log it, and you have 4 seconds to undo. It needs the iPhone app.",
      },
      {
        question: "Is Pendum Hydration on Android, and is there a Wear OS app?",
        answer:
          "Pendum Hydration runs on Android phones, and there is no Wear OS app. On Android, Health Connect receives fluids and caffeine; alcohol and BAC stay on the phone.",
      },
      {
        question: "Does Pendum Hydration track caffeine and alcohol?",
        answer:
          "Yes. Today in Pendum Hydration shows caffeine in milligrams and pure alcohol in grams beside your fluid progress. Non-alcoholic drinks count toward the goal, coffee and tea included; alcoholic drinks do not. Caffeine and alcohol values on preset drinks are estimates.",
      },
      {
        question: "What is the daily goal in Pendum Hydration?",
        answer:
          "Pendum Hydration’s goal starts at 2,500 mL of non-alcoholic fluids, and you set your own. It is not a personal recommendation, and progress measures what you log, not how hydrated you are.",
      },
      {
        question: "How do Pendum Hydration reminders work?",
        answer:
          "In Pendum Hydration, set a wake-up time and bedtime for the week or for each day. A reminder comes each hour only when you are behind plan, none come in the wind-down before bed, and each reminder has a button that logs a glass of water at your default size. If the app goes unopened for about 4 days, reminders stop until you open it.",
      },
      {
        question: "Does Pendum Hydration sync with Apple Health or Health Connect?",
        answer:
          "Only once you turn it on. Apple Health receives non-alcoholic fluids, caffeine, standard drinks and any BAC estimates, and Pendum Hydration reads your latest weight for the BAC estimate. On Android, Health Connect receives fluids and caffeine; alcohol and BAC stay on the phone.",
      },
      {
        question: "Can I back up or export my Pendum Hydration log?",
        answer:
          "Not from the app. Pendum Hydration has no backup or export, so deleting the app removes the log.",
      },
      {
        question: "Which units does Pendum Hydration use?",
        answer: "Pendum Hydration uses metric (mL, kg) or US (fl oz, lb). The starting choice follows your region.",
      },
    ],
    stores: { appStore: null, googlePlay: null },
    price: usd(4.99, "once"),
    calculators: ["water"],
  },
];

/**
 * "How much does … cost?" for each priced one-time purchase app, written from its price so the answer can never
 * disagree with the pricing page. It goes second, after the account and subscription question each app opens with.
 * It says what the owner decided (owner-decisions.md, 2026-10-04) and nothing about what an app does after a trial.
 */
for (const app of apps) {
  if (app.model !== "purchase" || !app.price || !app.faq) continue;
  const answer = app.unlock
    ? `${app.name} is free to download${app.trial ? ` with a ${app.trial.days}-day free trial` : ""}, then a one-time ${app.price.display} unlock. There is no subscription and nothing renews.`
    : `${app.name} costs ${app.price.display}, paid once when you download it. There is no subscription and nothing renews.`;
  app.faq.splice(1, 0, { question: `How much does ${app.name} cost?`, answer });
}

export function getApp(slug: string) {
  return apps.find((a) => a.slug === slug);
}

/** The one subscription app (account, server, sync), or undefined if the content lists none. */
export const subscriptionApp = apps.find((a) => a.model === "subscription");

/** The one-time purchase apps, in list order. */
export const purchaseApps = apps.filter((a) => a.model === "purchase");

/**
 * Every app's full name by slug (`names.lift` is "Pendum Lift"), for prose that names one app. Slugs are permanent
 * URLs (types.ts), so a rename changes the value here and nothing in page code.
 */
export const names = Object.fromEntries(apps.map((a) => [a.slug, a.name])) as Record<AppSlug, string>;

/** The purchase apps' full names as one list: "Pendum Body, Pendum Lift, Pendum Macros and Pendum Hydration". */
export const seriesNames = (list: readonly App[] = purchaseApps) => listFormat.format(list.map((a) => a.name));

