import type { CalculatorCategory, CalculatorMeta, Question } from "./types";

/**
 * The free calculators, in list order: the source of every calculator's title, meta description, sitemap entry and
 * list row. Each slug has its own route, src/app/calculators/<slug>/page.tsx, rendering src/calculators/<slug>.
 *
 * `next` says what the app does with the result just computed; every sentence maps to a feature in apps.ts.
 * `titleSuffix` is added to the <title> only, after the title and a space. `reviewed` is the day the method and
 * sources were last checked (2026-10-02). The questions live in `questions` below, keyed by slug.
 */
const entries = [
  {
    slug: "bmi",
    title: "BMI calculator",
    short: "BMI",
    description: "Body mass index from height and weight, with the adult screening category.",
    category: "body",
    app: "body",
    next: "Pendum Body puts BMI beside body fat and FFMI on one dashboard, each with its adult reference label, and charts your trend weight above them.",
    reviewed: "2026-10-02",
    icon: "scale",
  },
  {
    slug: "body-fat",
    title: "Body fat calculator",
    short: "Body fat",
    description: "Body-fat percentage from a tape measure, using the US Navy circumference method.",
    category: "body",
    app: "body",
    next: "Pendum Body makes the same estimate from your tape sites, with a measured percentage taking precedence, and shows it on its dashboard with the adult reference label.",
    titleSuffix: "(US Navy tape method)",
    reviewed: "2026-10-02",
    icon: "ruler",
  },
  {
    slug: "ffmi",
    title: "FFMI calculator",
    short: "FFMI",
    description: "Fat-free mass index: lean mass relative to height, raw and normalized to 1.8 m.",
    category: "body",
    app: "body",
    next: "Pendum Body computes FFMI from your trend weight and body-fat estimate and shows it on its dashboard with the same bands.",
    reviewed: "2026-10-02",
    icon: "weight",
  },
  {
    slug: "tdee",
    title: "TDEE calculator",
    short: "TDEE",
    description: "Resting energy and total daily energy expenditure from the Mifflin-St Jeor equation.",
    category: "nutrition",
    app: "macros",
    next: "This is a starting estimate. Pendum Macros checks it against your logged intake and trend weight each week and proposes a change of at most 150 kcal.",
    titleSuffix: "(Mifflin-St Jeor)",
    reviewed: "2026-10-02",
    icon: "energy",
  },
  {
    slug: "macros",
    title: "Macro calculator",
    short: "Macro",
    description: "Daily calories, protein, fat and carbohydrate for a cut, maintenance or a bulk.",
    category: "nutrition",
    app: "macros",
    next: "Pendum Macros sets these targets for a cut, bulk or maintenance program and logs against them with 3.2 million foods offline.",
    titleSuffix: "for a cut, bulk or maintenance",
    reviewed: "2026-10-02",
    icon: "food",
  },
  {
    slug: "protein",
    title: "Protein calculator",
    short: "Protein",
    description: "A daily protein range for your body weight and training goal.",
    category: "nutrition",
    app: "macros",
    next: "Pendum Macros logs protein for every food and totals it each day against the target its program sets.",
    reviewed: "2026-10-02",
    icon: "food",
  },
  {
    slug: "calorie-deficit",
    title: "Calorie deficit and goal date calculator",
    short: "Calorie deficit",
    description: "How long a weight change takes at a weekly rate, and the daily calorie change it needs.",
    category: "nutrition",
    app: "macros",
    next: "Pendum Macros sets a daily target for this pace, then a weekly check-in compares your logged intake with your trend weight and proposes a change of at most 150 kcal.",
    reviewed: "2026-10-02",
    icon: "date",
  },
  {
    slug: "one-rep-max",
    title: "One-rep max calculator",
    short: "One-rep max",
    description: "Estimated one-rep max from a set of reps, with a rep-max table for programming.",
    category: "strength",
    app: "lift",
    next: "Pendum Lift charts an estimated one-rep max for every exercise and sets the next load from your last session.",
    titleSuffix: "with rep-max table",
    reviewed: "2026-10-02",
    icon: "record",
  },
  {
    slug: "plates",
    title: "Plate calculator",
    short: "Plates",
    description: "The plates to load on each side of the bar for a target weight, in kilograms or pounds.",
    category: "strength",
    app: "lift",
    // Lift does not track a plate count over time; it shows the plates for each barbell set as you train.
    track: "Pendum Lift shows the plates per side for your next barbell set",
    next: "Pendum Lift shows the plates per side for the next barbell set, from the bar and plates your own gym keeps.",
    reviewed: "2026-10-02",
    icon: "lift",
  },
  {
    slug: "strength-score",
    title: "DOTS and Wilks calculator",
    short: "DOTS and Wilks",
    description: "DOTS and Wilks scores for comparing a powerlifting total across body weights.",
    category: "strength",
    app: "lift",
    // Lift has no DOTS or Wilks score; it charts an estimated one-rep max for each exercise.
    track: "Pendum Lift tracks the estimated one-rep max behind your total",
    next: "Pendum Lift has no DOTS or Wilks score, but it charts an estimated one-rep max for each exercise, the lifts behind this total included.",
    reviewed: "2026-10-02",
    icon: "chart",
  },
  {
    slug: "water",
    title: "Water intake calculator",
    short: "Water intake",
    description: "A daily fluid estimate from body weight and exercise, set against reference intakes.",
    category: "hydration",
    app: "hydration",
    next: "Pendum Hydration logs every drink toward a daily goal you set, coffee and tea included, and reminds you each hour only when you are behind.",
    titleSuffix: "by body weight",
    reviewed: "2026-10-02",
    icon: "water",
  },
  {
    slug: "heart-rate-zones",
    title: "Heart rate zone calculator",
    short: "Heart rate zones",
    description: "Five training zones from your age, or from your maximum and resting heart rate.",
    category: "cardio",
    // No app keeps a heart rate record (docs/sources/formulas.json; the Pendum Lift watch app only shows it live), so
    // the closing panel speaks for the family.
    next: "None of the apps keeps a heart rate record; Pendum Lift’s watch app shows it live during a workout and discards it. Buy a Pendum app once and keep its records on your phone, or subscribe to Pendum One and sync one account across phones.",
    titleSuffix: "(Tanaka and Karvonen)",
    reviewed: "2026-10-02",
    icon: "pulse",
  },
] as const satisfies readonly CalculatorMeta[];

/** A listed calculator's slug. Each route names its calculator with this type, so an unlisted one fails to compile. */
export type CalculatorSlug = (typeof entries)[number]["slug"];

/**
 * Common questions per calculator, three to five each, answered only from that page's method text, caveat and cited
 * sources (src/calculators/<slug>/page.tsx) and its lib (src/lib/calc/<slug>.ts). No medical advice and no claim
 * the page does not already make.
 */
const questions: Record<CalculatorSlug, Question[]> = {
  bmi: [
    {
      question: "How is BMI calculated?",
      answer:
        "Weight in kilograms divided by the square of height in meters. Imperial inputs are converted exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) before the division, and the result is rounded to one decimal.",
    },
    {
      question: "Which BMI counts as a healthy weight?",
      answer:
        "The CDC adult categories: underweight below 18.5, healthy weight from 18.5 to 24.9, overweight from 25.0 to 29.9 and obesity from 30.0. The category follows the one-decimal value, as in the CDC’s example table.",
    },
    {
      question: "Does BMI measure body fat?",
      answer:
        "No. BMI compares weight with height and does not separate muscle from fat. A muscular person can read as overweight, and an older adult with little muscle can read as healthy. Body-fat percentage and FFMI describe composition better.",
    },
    {
      question: "Does the BMI calculator work for children?",
      answer:
        "No. It is for adults aged 20 and over. Children and teens use age- and sex-specific percentiles instead, and BMI is a screening tool, not a diagnosis.",
    },
    {
      question: "Does Pendum Body give the same BMI?",
      answer:
        "Not always. Pendum Body computes BMI from your trend weight, not one reading, and applies the same CDC cutoffs to the unrounded value, so for a BMI less than 0.05 below 18.5, 25 or 30 the app names the category below the one shown here.",
    },
  ],
  "body-fat": [
    {
      question: "How accurate is the US Navy body fat method?",
      answer:
        "The standard error of the estimate is 3 to 4 percentage points of body fat, so read one result as a range. Tape position moves the result more than anything else: measure the same sites the same way each time and compare your own readings with each other.",
    },
    {
      question: "Where do I measure?",
      answer:
        "Men: the neck and the abdomen at the navel. Women: the neck, the natural waist and the hips. Every measurement is converted to inches before the equations run, and a result is kept only when it falls between 0 and 75%.",
    },
    {
      question: "What do the body fat categories mean?",
      answer:
        "They are the ACE body-fat categories with the edges Pendum Body uses. For men: very low below 6%, lean from 6.0 to 13.9%, typical from 14.0 to 24.9% and elevated from 25.0%. For women: very low below 14%, lean from 14.0 to 20.9%, typical from 21.0 to 31.9% and elevated from 32.0%. These are general comparisons, not personal targets.",
    },
    {
      question: "Where do the US Navy equations come from?",
      answer:
        "Hodgdon and Beckett fitted them for the US Navy in 1984, against underwater weighing in 602 men and 214 women. The US Army prints the same equations in AR 600-9 (2019), Appendix B, and this calculator computes them as Pendum Body does.",
    },
    {
      question: "Is this a measurement of body fat?",
      answer:
        "No. It is an estimate from a tape measure for adults, not a measurement of body fat and not a diagnosis. Small changes in where the tape sits change the result.",
    },
  ],
  ffmi: [
    {
      question: "How is FFMI calculated?",
      answer:
        "Lean mass is weight × (1 − body fat % ÷ 100), and FFMI divides it by height squared, in kilograms and meters. Pendum Body computes the same value as BMI × (1 − body fat % ÷ 100). Imperial inputs are converted exactly first.",
    },
    {
      question: "What is a typical FFMI?",
      answer:
        "Pendum Body’s bands for the unadjusted FFMI call 17.0 to 20.0 typical lean mass for men and 14.0 to 17.0 for women, both ends included, with lower and higher lean mass on either side. They are simplified comparisons, not clinical cutoffs and not targets. For context, Schutz et al. (2002) found a median FFMI of 18.9 in men and 15.4 in women aged 18 to 34.",
    },
    {
      question: "What is normalized FFMI?",
      answer:
        "An adjustment to a height of 1.8 m from Kouri et al. (1995): it adds 0.061 for each centimeter under 1.8 m and takes off the same for each centimeter over it. This calculator uses the coefficient 6.1, the value in common use; from 1.55 to 2.05 m it differs from the paper’s 6.3 by 0.05 or less.",
    },
    {
      question: "Is there an FFMI limit for lifters who do not use steroids?",
      answer:
        "In Kouri et al. (1995), normalized FFMI among male athletes who had not used anabolic steroids reached a limit of 25.0. The number is only as good as the body-fat figure behind it: an error of 3 points of body fat moves FFMI by about 0.7 for a person with a BMI of 24.",
    },
  ],
  tdee: [
    {
      question: "What is the difference between resting energy and TDEE?",
      answer:
        "Resting energy is what the Mifflin-St Jeor equation predicts from weight, height, age and sex: the energy you use at rest. TDEE multiplies it by an activity factor to cover your day, and it is the intake that would hold your weight steady.",
    },
    {
      question: "How accurate is a TDEE estimate?",
      answer:
        "The equation predicts resting energy from size and age, not body composition, and the activity multipliers are coarse conventions, not part of the 1990 study. Treat the result as a starting estimate: Pendum Macros then compares your logged intake with your trend weight each week and proposes a change.",
    },
    {
      question: "Which activity level should I choose?",
      answer:
        "Mostly seated (× 1.2) is desk work and little or no exercise; Lightly active (× 1.375) is light exercise or sport 1 to 3 days a week; Active (× 1.55) is moderate exercise or sport 3 to 5 days a week; Very active (× 1.725) is hard exercise or sport 6 to 7 days a week.",
    },
    {
      question: "Is this the Mifflin-St Jeor equation?",
      answer:
        "Yes, in the simplified form for each sex that Pendum Macros uses: 10 × weight (kg) + 6.25 × height (cm) − 5 × age, plus 5 for the male equation or minus 161 for the female one. Over the accepted inputs it differs from the full regression by less than 8 kcal a day of resting energy.",
    },
    {
      question: "Who is the TDEE calculator for?",
      answer:
        "Adults 18 and over who are not pregnant or breastfeeding. Ages 18 to 100, heights 120 to 230 cm and weights 35 to 350 kg are accepted, as in Pendum Macros.",
    },
  ],
  macros: [
    {
      question: "How are the macros calculated?",
      answer:
        "Calories are maintenance plus the weekly rate at 7,700 kcal per kg. Protein is body weight × g/kg; fat is the larger of 0.6 g per kg and a share of the calories left after protein (0.40 for Balanced, 0.25 for More carbs, 0.60 for More fat); carbs take the rest at 4 kcal per gram.",
    },
    {
      question: "How much protein should I eat on a cut?",
      answer:
        "The levels are the four Pendum Macros offers: 1.4, 1.6, 2.0 and 2.2 g per kg, with 1.6 the default. The ISSN position stand finds 1.4 to 2.0 g/kg a day sufficient for most people who exercise, and says 2.3 to 3.1 g/kg may be needed to maximize lean-mass retention in resistance-trained people during a calorie deficit; the levels here stop at 2.2 g/kg.",
    },
    {
      question: "How fast should I cut or bulk?",
      answer:
        "The weekly pace runs from 0.25 to 1% of body weight for a cut and from 0.1 to 0.5% for a bulk. Pendum Macros recommends 0.5 to 1% for a cut and 0.1 to 0.25% for a bulk; its slider reaches 1.5% for a mini-cut of 2 to 4 weeks.",
    },
    {
      question: "Why is no cut generated?",
      answer:
        "Targets are generated only between 1,500 and 5,000 kcal a day, from a maintenance of 1,200 to 5,000 kcal, and only while carbs stay at zero or above. A cut is not generated when BMI is under 18.5 now, or would be after a week at the chosen pace. These are the limits Pendum Macros uses: product limits, not individual safety thresholds.",
    },
    {
      question: "Why 7,700 kcal per kilogram?",
      answer:
        "It is the familiar 3,500 kcal per pound and a short-term approximation. The energy in a kilogram lost depends on body fat, and expenditure falls as weight changes, so over months the real rate drifts from the plan.",
    },
  ],
  protein: [
    {
      question: "How much protein should I eat a day?",
      answer:
        "A range per kilogram of body weight with a target inside it: 1.4 to 2.0 g/kg with a 1.6 target to maintain, 1.6 to 2.2 g/kg with a 2.0 target to build muscle, and 1.6 to 2.4 g/kg with a 2.2 target to lose fat. Each target is one of the protein settings Pendum Macros offers.",
    },
    {
      question: "Why is the target 1.6 g/kg?",
      answer:
        "In a meta-analysis of 49 trials, Morton and colleagues found no further average gain in lean mass from protein beyond about 1.6 g/kg, and the ISSN puts 1.4 to 2.0 g/kg a day as enough for most people who exercise.",
    },
    {
      question: "Does protein per meal matter?",
      answer:
        "About 0.4 g/kg a meal over four or more meals reaches 1.6 g/kg a day (Schoenfeld and Aragon). The table divides the daily target evenly across 3, 4 and 5 meals.",
    },
    {
      question: "What if my body fat is high?",
      answer:
        "Every range is per kg of total body weight, so with a high body-fat percentage the number runs high. When the target comes to more than 3.1 g per kg of lean mass, the top of the Helms range, the result says so; that happens past about 29% body fat for Lose fat, 35% for Build muscle and 48% for Maintain. Base the number on a goal weight instead.",
    },
    {
      question: "What is the RDA for protein?",
      answer:
        "0.8 g/kg a day for adults. It is set to prevent deficiency in nearly all healthy adults, not to support training, so it appears as a floor for comparison.",
    },
  ],
  "calorie-deficit": [
    {
      question: "How long does it take to lose 5 kg?",
      answer:
        "At 0.5% of body weight a week from 80 kg, the first step is 0.4 kg and the goal comes at 12.9 weeks, 91 days from today, because each week’s step is a share of the weight the week before. Enter your own weights and pace for your date.",
    },
    {
      question: "How big a calorie deficit do I need?",
      answer:
        "The first week’s change × 7,700 / 7: for 0.4 kg a week, 440 kcal a day below maintenance. Because the step is a share of weight, it shrinks as you lose and grows as you gain, and the calorie change follows it.",
    },
    {
      question: "Which weekly pace should I choose?",
      answer:
        "A loss of 0.25%, 0.5%, 0.75% or 1% a week, or a gain of 0.1%, 0.25% or 0.5% a week. Pendum Macros marks 0.5 to 1% as the band that suits most people losing weight and 0.1 to 0.25% for gaining; a higher gain adds more fat alongside the muscle.",
    },
    {
      question: "Why does the real rate drift from the plan?",
      answer:
        "7,700 kcal per kilogram is a short-term approximation. As weight falls, the energy the body uses falls with it, so a fixed deficit brings less loss over time than this model shows, and the energy in a kilogram lost depends on body fat (Hall 2008, 2011). The NIDDK Body Weight Planner models both for a longer plan.",
    },
    {
      question: "Why does a cut state a minimum maintenance?",
      answer:
        "Pendum Macros does not set a daily target under 1,500 kcal. This page asks for neither your maintenance nor your height, so for a cut it states the maintenance the pace needs to keep intake at 1,500 kcal or more: 1,500 + 440 = 1,940 kcal a day in the example.",
    },
  ],
  "one-rep-max": [
    {
      question: "What percentage of my max is 5 reps?",
      answer:
        "86% by Epley: the load for r reps to failure is the e1RM divided by (1 + r / 30), so 94% for 2 reps, 86% for 5 and 75% for 10. The table counts reps to failure, so a set of 5 with 2 in reserve is the 7-rep row.",
    },
    {
      question: "Is Epley or Brzycki more accurate?",
      answer:
        "Neither is more accurate for everyone. LeSuer and colleagues compared seven equations, Epley and Brzycki among them, with measured one-rep maxes in untrained college students: accuracy differed by lift, and every equation underestimated the deadlift. From 2 to 9 reps Brzycki reads a little lower than Epley, and the two agree at 1 and at 10 reps.",
    },
    {
      question: "Do reps in reserve count?",
      answer:
        "Yes. Reps left in reserve count as reps you could have done, so 5 reps with 2 in reserve is 7 reps to failure. An empty reserve field counts as 0, a set taken to failure, and the result depends on how honest the reserve is.",
    },
    {
      question: "How many reps is too many for an estimate?",
      answer:
        "Estimates beyond about 12 reps to failure are rough, and Epley overestimates at high reps. The rep-max table runs to 12 reps, and Brzycki is shown only up to 10, past which its denominator shrinks quickly and its estimate climbs.",
    },
    {
      question: "Should I test my one-rep max?",
      answer:
        "This is an estimate, not a tested max. Test a heavy single only with a spotter or safety arms.",
    },
  ],
  plates: [
    {
      question: "Which plates does the calculator assume?",
      answer:
        "Kilograms: a 20 kg bar (15 and 10 kg also offered) and plates of 25, 20, 15, 10, 5, 2.5 and 1.25 kg. Pounds: a 45 lb bar (35, 25 and 15 lb also offered) and plates of 45, 35, 25, 10, 5 and 2.5 lb, as in Pendum Lift’s default gym. Mark the plates you have, and any number of pairs of each is assumed.",
    },
    {
      question: "What if the plates cannot make the load exactly?",
      answer:
        "The calculator lists every load the plates can make and takes the one nearest the target; when two are equally near, it takes the lighter. A target under the empty bar has nothing to load.",
    },
    {
      question: "Why does it load fewer plates than I expect?",
      answer:
        "Each side uses the fewest plates that make the load, heaviest first against the collar. That can differ from loading the heaviest plate that fits each time: 165 lb on a 45 lb bar is 35 and 25 lb a side, two plates instead of three.",
    },
    {
      question: "Are collars counted?",
      answer:
        "No. Competition collars weigh 2.5 kg each. Gym plates and bars can differ from their stated weight; calibrated competition plates are made to it, and the IPF uses a 20 kg bar and discs from 25 kg down to 1.25 kg, with smaller discs only for record attempts.",
    },
    {
      question: "Does Pendum Lift give the same load?",
      answer:
        "With a 5 kg or 5 lb plate or a lighter one available, as in both default sets, yes. Pendum Lift searches loads only up to the target × 1.25 + 10, so with only large plates it can settle on a lighter load when a heavier one is nearer: a 95 lb target on a 45 lb bar with only 45 lb plates gives 45 lb in Pendum Lift and 135 lb here.",
    },
  ],
  "strength-score": [
    {
      question: "What is the difference between DOTS and Wilks?",
      answer:
        "Both multiply a powerlifting total by a coefficient that falls as body weight rises. DOTS, written by Tim Konertz for the German federation BVDK, uses a fourth-degree polynomial in body weight; Wilks is Robert Wilks’ original fifth-degree formula, which the IPF has since replaced with its own points.",
    },
    {
      question: "What is a good DOTS score?",
      answer:
        "Neither formula defines levels such as beginner or elite, so none are shown. The scores are for comparing lifters, within a meet or across meets, not for grading one lifter, and a score is only as comparable as the totals behind it: equipment, federation rules and drug testing all differ.",
    },
    {
      question: "Which body weights are valid?",
      answer:
        "The limits OpenPowerlifting uses. DOTS counts body weight outside 40 to 210 kg (men) or 40 to 150 kg (women) as the nearest end of that range. Wilks holds it to 40 to 201.9 kg for men and 26.51 to 154.53 kg for women, clear of the polynomial’s asymptote at the heavy end and of very large coefficients at the light end.",
    },
    {
      question: "Can I compare a DOTS score with a Wilks score?",
      answer:
        "No. Federations rank by different formulas, so compare a score only with scores from the same formula. Points are rounded to two decimals, as OpenPowerlifting shows them.",
    },
  ],
  water: [
    {
      question: "How much water should I drink a day?",
      answer:
        "There is no single daily requirement. The National Academies (NASEM, 2005) set 3.7 L of total water a day for men and 2.7 L for women, about 81% of it from drinks; EFSA (2010) sets 2.5 L and 2.0 L for moderate temperatures and activity. Total water includes the water in food, and most healthy people meet their needs by drinking to thirst.",
    },
    {
      question: "How does the estimate use body weight?",
      answer:
        "The baseline is 19 mL per kg, from D-A-CH’s 35 mL of total water per kg and its split of 1,410 mL from drinks in 2,600. It is then kept between EFSA’s figure and NASEM’s for your sex: 2.0 to 3.0 L for men and 1.6 to 2.2 L for women.",
    },
    {
      question: "Does coffee count?",
      answer:
        "The reference intakes count water from all drinks. In Pendum Hydration, coffee and tea count toward the daily goal and alcohol does not.",
    },
    {
      question: "How much more should I drink when I exercise?",
      answer:
        "The calculator adds 10 mL per minute of exercise, the middle of ACSM’s 0.4 to 0.8 L an hour suggestion for marathon runners who do not know their own sweat rate. Sweat rates run from about 0.3 to 2.4 L an hour, so weigh yourself before and after an hour of exercise: each kilogram lost, plus what you drank, is about a liter of sweat.",
    },
    {
      question: "Can I drink too much water?",
      answer:
        "Yes. Drinking far beyond sweat losses during long endurance events can cause hyponatremia, a dangerous fall in blood sodium, and the kidneys clear at most about 0.7 to 1.0 L an hour. With a heart, kidney or liver condition, or a fluid restriction, follow your clinician’s advice.",
    },
  ],
  "heart-rate-zones": [
    {
      question: "What is zone 2?",
      answer:
        "Light: 60 to 70% of your maximum heart rate, or of your heart rate reserve when you enter a resting rate. At age 40, with a maximum of 180 bpm, zone 2 runs from 108 to 125 bpm; with a resting rate of 60 bpm it runs from 132 to 143 bpm.",
    },
    {
      question: "How is maximum heart rate estimated?",
      answer:
        "With the Tanaka equation, 208 − 0.7 × age, fitted in a meta-analysis of 351 studies and confirmed in 514 people tested in the laboratory. 220 − age is shown for comparison: the two agree at 40, and above 40 the older rule gives a lower maximum.",
    },
    {
      question: "What is the Karvonen method?",
      answer:
        "Zones from heart rate reserve, maximum minus resting heart rate: each zone edge is a percent of the reserve added to the resting rate, so the zones sit higher than the same percent of maximum. It is the method of Karvonen and colleagues (1957) that ACSM uses to set exercise intensity.",
    },
    {
      question: "How accurate are the zones?",
      answer:
        "Any age formula has a typical error of 7 to 11 bpm, and your true maximum can differ from it by 20 bpm or more. A laboratory exercise test or a field test measures your maximum more accurately, and medications such as beta blockers lower heart rate and change these zones.",
    },
    {
      question: "Are five zones a standard?",
      answer:
        "No. Five zones in 10% steps are a common training convention, the one heart rate monitors use. For comparison, ACSM classes 64 to 76% of maximum (40 to 59% of reserve) as moderate and 77 to 95% of maximum (60 to 89% of reserve) as vigorous.",
    },
  ],
};

export const calculators: readonly CalculatorMeta[] = entries.map((entry) => ({
  ...entry,
  questions: questions[entry.slug],
}));

export const categoryLabel: Record<CalculatorCategory, string> = {
  body: "Body composition",
  strength: "Strength",
  nutrition: "Nutrition",
  hydration: "Water",
  cardio: "Cardio",
};

export const categoryOrder: CalculatorCategory[] = ["body", "nutrition", "strength", "hydration", "cardio"];

export function getCalculator(slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}
