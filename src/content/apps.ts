import type { App } from "./types";

/**
 * The five apps, in site order. Every claim comes from docs/sources/app-facts.json, which checks each one against
 * the app repos: nothing from a fact sheet's notYetShipped is claimed, and its caveats travel in `caveats`.
 * Specimens are fictional example data and carry no `meta`, so the panel keeps its "Example" label.
 */
export const apps: App[] = [
  {
    slug: "omegafyt",
    // TODO(owner): public builds exist (1.7.0, app-facts.json); confirm both store listings are live, then set
    // stores.appStore and stores.googlePlay. Until then the page tells visitors to search the stores.
    released: true,
    name: "OmegaFyt",
    label: "OmegaFyt",
    model: "subscription",
    tagline: "Training and nutrition, planned and tracked together",
    summary:
      "OmegaFyt tracks workouts, food, body measurements, supplements and soreness against calorie targets that follow your trend weight. One account keeps the same records on iPhone and Android.",
    icon: { light: "/apps/omegafyt.png" },
    glyph: "sync",
    // TODO(owner): add "Web" once the web address is public and set in stores.web. Until then the site describes
    // the web version (same account in a browser, address published at launch) and never lists it as a platform.
    platforms: ["iPhone", "Android"],
    // The public 1.7.0 build has every feature up to the TODO below, so lists that show the first few (home, /apps)
    // only show what is in the stores today.
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
        body: "OmegaFyt estimates the energy you use each day from logged intake and weight change over 14-day windows. Reports show weekly, monthly or yearly averages.",
        icon: "energy",
      },
      {
        title: "Body and strength reports",
        body: "Trend weight sits over your scale readings, beside 12-site measurements and a US Navy body fat estimate. Strength charts track an estimated one-rep max for 11 main lifts.",
        icon: "chart",
      },
      {
        title: "Supplements and soreness",
        body: "Tick off supplements across seven time slots each day. Rate 14 muscle groups for soreness and see the day on a front and back body map.",
        icon: "check",
      },
      // TODO(owner): the program builder, saved gyms and the rest timer ship in 1.8.0 with the matching backend
      // deploy. Confirm both are live before launch.
      {
        title: "Programs built for your gym",
        body: "Choose a gym, 2 to 6 training days, 30 to 90 minute sessions and up to three muscles to bring up. The program uses only that gym’s equipment, or you can start a ready-made program or build your own.",
        icon: "lift",
      },
      {
        title: "Rest timer on every set",
        body: "A rest timer starts when you log a set, timed to the exercise or the type of lift. It keeps its end time when the app closes.",
        icon: "timer",
      },
    ],
    integrations: [
      {
        title: "Apple Health sync",
        body: "On iPhone, OmegaFyt imports weigh-ins from Apple Health and writes back your weight and daily calories, protein, carbs and fat. Sync is off until you turn it on.",
        icon: "health",
      },
      {
        title: "Health Connect on Android",
        body: "On Android, OmegaFyt reads weight and steps from Health Connect and writes weight and daily nutrition totals. Sync is off until you turn it on.",
        icon: "health",
      },
      {
        title: "Daily steps on Home",
        body: "With health sync on, Home shows the day’s steps against a goal you set. Steps come from the health app; OmegaFyt does not count them itself.",
        icon: "pulse",
      },
      {
        title: "Barcode camera",
        body: "The camera reads EAN-13, EAN-8, UPC-A and UPC-E codes on food packaging. The app does not use the microphone.",
        icon: "camera",
      },
      // TODO(owner): ships with the 1.8.0 rest timer (see features).
      {
        title: "Rest notifications",
        body: "On iPhone and Android, a notification says when rest is over while the app is in the background, if notifications are allowed.",
        icon: "notification",
      },
    ],
    privacy: [
      "An account is required. Sign-in goes through Clerk.",
      "Your logs are stored on the OmegaFyt server, hosted on Fly.io in the United States, so the same records open on every device.",
      "Food search and barcode lookups go through that server to the FatSecret food database.",
      "The iPhone and Android apps send usage events and error reports to PostHog. Events include plan choices such as goal and pace, and leave out weight, height, sex and measurements.",
      "Subscriptions go through RevenueCat with App Store and Google Play billing. On iPhone, RevenueCat also receives Apple Search Ads attribution.",
      "Health sync is off until you turn it on. Delete account in Settings removes your data from the server, then your login.",
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
      "OmegaFyt needs an account and a network connection. There is no offline mode.",
      "Health sync, steps and rest notifications are on iPhone and Android only. There is no iPad version.",
      "English only, with numbers and dates in your device’s regional format.",
    ],
    stores: { appStore: null, googlePlay: null, web: null },
    price: null,
    calculators: ["tdee", "macros", "one-rep-max", "body-fat"],
  },
  {
    slug: "body",
    released: false,
    name: "Vector Body",
    // TODO(owner): the rename to Vector Body is pending sign-off and the build still says VECTOR BODY. The label is
    // the planned home-screen name, so the site does not show it.
    label: "Body",
    model: "purchase",
    tagline: "Weight trend, tape measurements and progress photos",
    summary:
      "Vector Body tracks weight, tape measurements and progress photos, with a smoothed weight trend and body composition estimates. There is no account, and your records live in a database on your phone.",
    icon: { light: "/apps/body.png", dark: "/apps/body-dark.png" },
    glyph: "scale",
    platforms: ["iPhone", "Android"],
    features: [
      {
        title: "Smoothed weight trend",
        body: "Trend weight averages each day’s weigh-ins and smooths them with a seven-day half-life. The chart shows the daily averages beside the trend.",
        icon: "chart",
      },
      {
        title: "16 tape measurement sites",
        body: "Record up to 16 circumference sites, from neck and shoulders to each ankle. Add a measured body fat percentage in the same session.",
        icon: "ruler",
      },
      {
        title: "Body fat from a tape",
        body: "The US Navy circumference method estimates body fat from your height and two or three tape sites. A measured percentage takes precedence over the estimate.",
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
    stores: { appStore: null, googlePlay: null },
    price: null,
    calculators: ["bmi", "body-fat", "ffmi"],
  },
  {
    slug: "lift",
    released: false,
    name: "Vector Lift",
    label: "Lift",
    model: "purchase",
    tagline: "Strength programs that write every set",
    summary:
      "Vector Lift builds training programs for your gym and sets the load, reps and reps in reserve for every set from your last session. Workouts live in a database on your phone, with no account and no server.",
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
        body: "After a session, two optional taps per muscle, for workload and soreness, set next week’s sets. Without an answer, hitting your reps decides.",
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
        icon: "document",
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
    stores: { appStore: null, googlePlay: null },
    price: null,
    calculators: ["one-rep-max", "plates", "strength-score"],
  },
  {
    slug: "macros",
    released: false,
    name: "Vector Macros",
    label: "Macros",
    model: "purchase",
    tagline: "Calories and macros, with 3.2 million foods offline",
    summary:
      "Vector Macros logs calories, macros and nutrients toward a cut, bulk or maintenance goal, with 3.2 million foods searchable offline. A weekly check-in proposes target changes from your intake and weight trend, with no account.",
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
        body: "A weekly check-in compares your logged intake with your weight trend and proposes a change of at most 150 kcal. Nothing changes until you accept or adjust it.",
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
        body: "Log again ranks foods by how often, how recently and at what hour you eat them. Amounts take grams, ounces, volumes or the food’s own portions, and every diary change has Undo.",
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
        body: "In a program, give one to six chosen weekdays more calories. The other days give up the same total, so the week stays on budget.",
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
      "Photo logging needs an eligible iPhone with Apple Intelligence, on iOS 27 for photos and iOS 26 or later for descriptions, or an Android phone with Gemini Nano. Its foods and portions are estimates for you to review.",
      "Packaged food data comes from Open Food Facts under ODbL 1.0, and generic foods from the USDA. Community label data can contain errors.",
      "The food catalogs ship with the app, so it needs a lot of storage. The catalogs alone take about 590 MB on the phone, and an Android install takes about twice that.",
    ],
    stores: { appStore: null, googlePlay: null },
    price: null,
    calculators: ["tdee", "macros", "protein", "calorie-deficit"],
  },
  {
    slug: "hydration",
    released: false,
    name: "Vector Hydration",
    // TODO(owner): the rename is pending sign-off; the build still says VECTOR HYDRATION with the label HYDRATE.
    // The label is the planned home-screen name, so the site does not show it.
    label: "Hydration",
    model: "purchase",
    tagline: "Fluids, caffeine and alcohol, logged in one tap",
    summary:
      "Vector Hydration logs what you drink toward a daily fluid goal, with caffeine and alcohol totals beside it. Reminders follow your day, an Apple Watch app logs from the wrist, and there is no account.",
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
        title: "History by day, week, month",
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
        body: "Off by default, and a rough estimate only: never use it to decide whether to drive. With it on, Today shows an estimated blood alcohol content and a six-hour trend.",
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
        body: "Off until you turn it on. On Android it exports non-alcoholic fluids and caffeine; alcohol and BAC stay on the phone.",
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
      "Reminders and background sync run when iOS or Android allows. If the app goes unopened for about four days, reminders stop.",
      "The Apple Watch app needs the iPhone app. Brand names in the presets do not imply endorsement.",
    ],
    stores: { appStore: null, googlePlay: null },
    price: null,
    calculators: ["water"],
  },
];

export function getApp(slug: string) {
  return apps.find((a) => a.slug === slug);
}
