#!/usr/bin/env node
// Vector kit, web edition: the web fonts. The kit's two bundled faces (design-system §3.1) stay in src/fonts as TTF,
// byte-identical with the apps, and remain the source. The site serves WOFF2 subsets of them, which this writes:
//
//   node scripts/fonts.mjs        (pnpm fonts)   src/fonts/{Inter,IBMPlexMono-Regular}.ttf
//                                                  -> public/fonts/<face>.<hash>.woff2
//                                                  -> src/fonts/faces.css   (the @font-face rules, generated)
//                                                  -> src/fonts/index.ts    (the preload list, generated)
//
// Run it when a TTF changes or the site starts using a character outside CHARACTERS, then commit the output.
//
// Why the site declares its own @font-face rules instead of next/font/local (measured 2026-10-03 with Lighthouse's
// lantern graphs): next/font writes its rules into a stylesheet of its own, a second render-blocking request that
// took the one warm connection in the simulation and pushed the main stylesheet onto a cold one (+300 ms on every
// first paint), and it cannot order a unicode-range face in front of its own fallback family. Here the rules are
// inlined into the main stylesheet (globals.css imports faces.css) and the root layout preloads the two files.
//
// Each face is one preloaded file. A split into a basic file and a unicode-range file for the rare characters
// was measured and rejected (2026-10-03): a font the stylesheet requests is VeryHigh priority, which Lighthouse's
// lantern counts as render-blocking, so every page that set a rare character paid a cold connection on first
// paint (+300 ms), while a preloaded font is not in its first-paint graph at all and the rare characters cost
// under 5 KB.
// Subsetting keeps the variation tables, so Inter stays variable on wght, narrowed to 400–600 (the roles use 400,
// 500 and 600; a browser's default <strong> at 700 clamps to 600, which the kit prefers over a synthetic bold). Its
// opsz axis is pinned at 14, the Text master: the Display master's second set of outlines roughly doubled the file.
// Only the OpenType layout features a browser applies by default are kept (FEATURES): the stylistic sets, character
// variants, fractions, superscript and subscript forms the site never enables carried their alternate glyphs along
// and more than doubled Inter (35 KB -> 16 KB for the same text); the CSS enables tabular figures (tnum) and nothing
// else.

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fonts = join(root, "src/fonts");
const out = join(root, "public/fonts");

/**
 * The characters the site sets: basic Latin plus exactly the others found in the copy and the formatters
 * (2026-10-03: `grep -rhoP '[^\x00-\x7F]' src --include='*.ts' --include='*.tsx' | sort -u`, listed per range
 * below). Add a range when copy needs a character outside it, then run `pnpm fonts`.
 */
const CHARACTERS = [
  [0x0020, 0x007e], // basic Latin
  [0x00a0], // no-break space (Value: a number and its unit stay together)
  [0x00a3], // £ (pricing)
  [0x00a5], // ¥ (pricing)
  [0x00a7], // § (sources)
  [0x00a9], // © (footer)
  [0x00b0, 0x00b3], // ° ± ² ³
  [0x00b7], // · (separators in copy)
  [0x00d6], // Ö
  [0x00d7], // × (formulas)
  [0x00e4], // ä
  [0x00f7], // ÷ (formulas)
  [0x2013, 0x2014], // – —
  [0x2018, 0x2019], // ‘ ’
  [0x201c, 0x201d], // “ ”
  [0x2026], // …
  [0x202f], // narrow no-break space (Value)
  [0x203a], // › (breadcrumbs)
  [0x20ac], // € (pricing)
  [0x2074, 0x2075], // ⁴ ⁵ (formulas)
  [0x2192], // →
  [0x2212], // − (how negative values are formatted)
  [0x2264, 0x2265], // ≤ ≥
];

/**
 * The layout features a browser applies without being asked (HarfBuzz's defaults for horizontal Latin text), plus
 * tnum, which the type roles and Value enable with `tabular-nums`. Everything else in Inter (ss01–ss08, cv01–cv13,
 * frac, sups, subs, case, salt, dlig…) is never enabled by the site's CSS and is dropped with its glyphs.
 */
const FEATURES = ["abvm", "blwm", "calt", "ccmp", "clig", "curs", "dist", "kern", "liga", "locl", "mark", "mkmk", "rclt", "rlig", "rvrn", "tnum"];

/** Axis ranges to keep (or a value to pin), per face (static faces have none). */
const VARIATION = { Inter: { wght: { min: 400, max: 600 }, opsz: 14 }, "IBMPlexMono-Regular": undefined };

/**
 * Each face as CSS: the family names the generated stacks use (scripts/vector-web.mjs), the weight descriptor, and
 * the metrics that size the local fallback (Arial) to the face so the swap moves nothing (CLS 0). The overrides are
 * the ones next/font/local computed for these same TTFs (2026-10-03); subsetting does not change a font's metrics.
 */
const FACES = {
  Inter: {
    family: "Inter Web",
    weight: "400 600",
    fallback: { ascent: "89.79%", descent: "22.36%", lineGap: "0%", sizeAdjust: "107.89%" },
  },
  "IBMPlexMono-Regular": {
    family: "Plex Mono Web",
    weight: "400",
    fallback: { ascent: "77.95%", descent: "20.91%", lineGap: "0%", sizeAdjust: "131.49%" },
  },
};

const codePoints = (ranges) => ranges.flatMap(([from, to = from]) => Array.from({ length: to - from + 1 }, (_, i) => from + i));
const text = (points) => points.map((p) => String.fromCodePoint(p)).join("");

/** The variation axes of an SFNT font, from its fvar table: `wght 100–900 (400)`. */
function axes(sfnt) {
  const tables = sfnt.readUInt16BE(4);
  for (let i = 0; i < tables; i++) {
    const entry = 12 + i * 16;
    if (sfnt.toString("latin1", entry, entry + 4) !== "fvar") continue;
    const fvar = sfnt.readUInt32BE(entry + 8);
    const first = fvar + sfnt.readUInt16BE(fvar + 4);
    const count = sfnt.readUInt16BE(fvar + 8);
    const size = sfnt.readUInt16BE(fvar + 10);
    const fixed = (at) => sfnt.readInt32BE(at) / 65536;
    return Array.from({ length: count }, (_, a) => {
      const at = first + a * size;
      const tag = sfnt.toString("latin1", at, at + 4);
      return `${tag} ${fixed(at + 4)}–${fixed(at + 12)} (${fixed(at + 8)})`;
    });
  }
  return [];
}

const points = codePoints(CHARACTERS).sort((a, b) => a - b);
mkdirSync(out, { recursive: true });
const written = new Set();
const css = ["/* GENERATED by scripts/fonts.mjs from src/fonts/*.ttf. Do not edit: run `pnpm fonts`. */", ""];
const preloads = [];

for (const [name, face] of Object.entries(FACES)) {
  const source = readFileSync(join(fonts, `${name}.ttf`));
  const options = { variationAxes: VARIATION[name], keepFeatures: FEATURES };
  const woff2 = await subsetFont(source, text(points), { targetFormat: "woff2", ...options });
  const hash = createHash("sha256").update(woff2).digest("hex").slice(0, 8);
  const file = `${name}.${hash}.woff2`;
  writeFileSync(join(out, file), woff2);
  written.add(file);
  preloads.push(`/fonts/${file}`);
  css.push(
    "@font-face {",
    `  font-family: "${face.family}";`,
    `  src: url("/fonts/${file}") format("woff2");`,
    `  font-weight: ${face.weight};`,
    "  font-display: swap;",
    "}",
    "@font-face {",
    `  font-family: "${face.family} Fallback";`,
    '  src: local("Arial");',
    `  ascent-override: ${face.fallback.ascent};`,
    `  descent-override: ${face.fallback.descent};`,
    `  line-gap-override: ${face.fallback.lineGap};`,
    `  size-adjust: ${face.fallback.sizeAdjust};`,
    "}",
    ""
  );
  const sfnt = await subsetFont(source, text(points), { targetFormat: "sfnt", ...options });
  const variable = axes(sfnt);
  console.log(
    `${name}: ${source.length} B TTF -> ${woff2.length} B WOFF2 (${points.length} characters)` +
      (variable.length ? `, variable: ${variable.join(", ")}` : ", static")
  );
}

// A face rebuilt with a new hash leaves its old file behind: removed here, so public/fonts holds only what is declared.
for (const file of readdirSync(out)) if (file.endsWith(".woff2") && !written.has(file)) unlinkSync(join(out, file));

writeFileSync(join(fonts, "faces.css"), css.join("\n"));
writeFileSync(
  join(fonts, "index.ts"),
  [
    "// GENERATED by scripts/fonts.mjs. Do not edit: run `pnpm fonts`.",
    "/** The two font files, preloaded by the root layout and the global error page: both are on every page's first paint. */",
    `export const fontPreloads = ${JSON.stringify(preloads)} as const;`,
    "",
  ].join("\n")
);
