// Brand names live in src/content only (CLAUDE.md, content rules): page code reads site.name, site.family,
// site.series, app.name, app.plan and the name helpers in src/content/apps.ts (names, seriesNames), so a rename
// is a content edit. This check fails on a product name written into page code.
// A module of its own, like kit-rules.mjs, so vector-web.mjs check can call lintBrands and brand-rules.test.mjs can
// test lintBrandSource; run directly (`node scripts/brand-rules.mjs check`, the lint script does) it prints every
// hit as file:line and exits 1.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Page code. src/content holds the names; src/vector is the kit, whose own name is the design system's. */
export const PAGE_DIRS = ["src/app", "src/components", "src/calculators"];

/**
 * The product names: the subscription app, the purchase apps in full and the collective noun, under today's names
 * (Pendum) and the retired ones (Vector, OmegaFyt), so a stale name in page code fails too.
 */
export const PRODUCT = /\b(OmegaFyt|Pendum (One|Body|Lift|Macros|Hydration|apps)|Vector (One|Body|Lift|Macros|Hydration|apps|series))\b/;
/**
 * The family word alone (today's, Pendum, or the retired Vector), as JSX text or in a string literal. An identifier never contains it as a whole word
 * (VectorProvider, @/vector, vector-units), so the line is tested as it stands once comments are blanked; a type
 * or variable named exactly `Vector` would trip this and is named otherwise.
 */
export const FAMILY = /\b(Pendum|Vector)\b/;

/**
 * Lines that may keep a literal, as the file and the text on the line. Each says why: the word is not the
 * product's name. (The root error boundary reads site.family for its <title>, so it needs no entry.)
 */
export const ALLOW = [
  // The gallery's title names the design system (src/vector, "the Vector kit"), not the product.
  { file: "src/app/kit/page.tsx", text: "Vector kit" },
];

/**
 * The file with its comments blanked (line, block and JSX block comments), so a comment may still say "Pendum Lift"
 * while every line number stays a line number. String literals are copied whole, so a "//" inside a URL is not a
 * comment. (JSX text holding "//" outside a string, and a template literal nesting a backtick, are not handled.)
 */
export function stripComments(text) {
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    const next = text[i + 1];
    if (c === "/" && next === "/") {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      for (; i < stop; i++) out += text[i] === "\n" ? "\n" : " ";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      out += c;
      i++;
      while (i < n && text[i] !== c) {
        if (text[i] === "\\") {
          out += text[i] + (text[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += text[i];
        i++;
      }
      out += text[i] ?? "";
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

const WHY = {
  "product-name": "a product name; read it from src/content (app.name, app.plan, site.series, names, seriesNames)",
  "family-name": "the family name; read site.family from src/content",
};

/** Problems in one page-code file, as `path:line  rule  "match" is why` strings. Test files are not page code. */
export function lintBrandSource(rel, text) {
  if (/\.test\.(tsx?|mjs)$/.test(rel)) return [];
  const problems = [];
  stripComments(text)
    .split("\n")
    .forEach((line, i) => {
      if (/^\s*(import|export)\b.*\bfrom\s*["']/.test(line)) return; // module paths, never prose
      if (ALLOW.some((a) => a.file === rel && line.includes(a.text))) return;
      const product = line.match(PRODUCT);
      if (product) problems.push(`${rel}:${i + 1}  product-name  "${product[0]}" is ${WHY["product-name"]}`);
      const family = line.replace(new RegExp(PRODUCT.source, "g"), "").match(FAMILY);
      if (family) problems.push(`${rel}:${i + 1}  family-name  "${family[0]}" is ${WHY["family-name"]}`);
    });
  return problems;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.tsx?$/.test(name)) yield path;
  }
}

/** Every brand-name problem in page code under `root`. */
export function lintBrands(root) {
  const problems = [];
  for (const dir of PAGE_DIRS) {
    for (const path of walk(join(root, dir))) {
      problems.push(...lintBrandSource(relative(root, path), readFileSync(path, "utf8")));
    }
  }
  return problems;
}

// The CLI, only when this file is the one run (an import from vector-web.mjs or a test never runs it).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2] ?? "check";
  if (cmd !== "check") {
    console.error(`Unknown command ${cmd}. Use check.`);
    process.exit(1);
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const problems = lintBrands(root);
  if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`${problems.length} brand name(s) in page code. Names live in src/content (CLAUDE.md, content rules).`);
    process.exit(1);
  }
  console.log("Brand names: page code names no product; src/content holds the names.");
}
