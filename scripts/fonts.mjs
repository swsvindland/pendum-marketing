#!/usr/bin/env node
// Vector kit, web edition: the web fonts. The kit's two bundled faces (design-system §3.1) stay in src/fonts as TTF,
// byte-identical with the apps, and remain the source. The site serves WOFF2 subsets of them, which this writes next
// to them for next/font/local (src/fonts/index.ts):
//
//   node scripts/fonts.mjs        (pnpm fonts)   src/fonts/{Inter,IBMPlexMono-Regular}.ttf -> *.subset.woff2
//
// Run it when a TTF changes or the site starts using a character outside CHARACTERS, then commit the output.
// Subsetting keeps every OpenType feature and the variation tables, so Inter stays variable: its wght axis is
// narrowed to 400–700 (the roles use 400, 500 and 600; a browser's default <strong> is 700), and its opsz axis
// stays whole, since browsers set it from the font size. next/font/local declares the same weight range.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const fonts = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "src/fonts");

/**
 * The characters the site sets: Latin with Latin-1 (accents, ×, ÷, ·, ², ³, §, ©, the no-break space), the
 * typographic punctuation (en and em dashes, curly quotes, the ellipsis, narrow no-break space), superscript
 * digits, the euro, arrows, the minus sign (U+2212, how negative values are formatted), ≈, ≤ and ≥. Found with a
 * scan of src for non-ASCII characters; add to it when copy needs more.
 */
const CHARACTERS = [
  [0x0020, 0x007e],
  [0x00a0, 0x00ff],
  [0x0131],
  [0x0152, 0x0153],
  [0x02c6],
  [0x02da],
  [0x02dc],
  [0x2000, 0x206f],
  [0x2070],
  [0x2074, 0x2079],
  [0x20ac],
  [0x2122],
  [0x2190, 0x2193],
  [0x2212],
  [0x2248],
  [0x2264, 0x2265],
];

const text = CHARACTERS.flatMap(([from, to = from]) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i))
).join("");

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

/** Axis ranges to keep, per face (static faces have none). */
const VARIATION = { Inter: { wght: { min: 400, max: 700 } }, "IBMPlexMono-Regular": undefined };

for (const [name, variationAxes] of Object.entries(VARIATION)) {
  const source = readFileSync(join(fonts, `${name}.ttf`));
  const sfnt = await subsetFont(source, text, { targetFormat: "sfnt", variationAxes });
  const woff2 = await subsetFont(source, text, { targetFormat: "woff2", variationAxes });
  writeFileSync(join(fonts, `${name}.subset.woff2`), woff2);
  const variable = axes(sfnt);
  console.log(
    `${name}: ${source.length} B TTF -> ${woff2.length} B WOFF2` +
      (variable.length ? `, variable: ${variable.join(", ")}` : ", static")
  );
}
