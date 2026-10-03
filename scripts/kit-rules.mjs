// Vector kit, web edition: the page-code rules (the native kit's `vector-kit check`, for the web). Type is a role,
// colour is a token, shape is the kit's, and HeroUI is reached only through the kit. A module of its own so the
// rules can be unit-tested (kit-rules.test.mjs) without running vector-web.mjs, whose import runs its CLI.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/** Page code. src/vector is the kit and is exempt. */
export const PAGE_DIRS = ["src/app", "src/components", "src/calculators"];
/** The kit's own stylesheet. */
const EXEMPT = [/^src\/app\/globals\.css$/];
/** Raster and meta routes (OG card, touch icon, manifest, brand plate): they draw assets and may write colours. */
const ASSETS = [/opengraph-image\.tsx$/, /apple-icon\.tsx$/, /manifest\.ts$/, /components\/site\/brand\.tsx$/];
/** The assets, plus the root layout's browser theme colour. */
const COLOUR_ALLOWED = [...ASSETS, /^src\/app\/layout\.tsx$/];

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white";

/** Rules on class strings: string literals (and the static parts of template literals) that read as utilities. */
export const CLASS_RULES = [
  {
    id: "size",
    re: /(?<![\w-])text-(xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/,
    why: "a size class; use a type role (Text variant or type-*)",
  },
  {
    id: "arbitrary-text",
    re: /(?<![\w-])text-\[/,
    why: "an arbitrary text value; use a type role for size and a token utility for colour",
  },
  {
    id: "leading",
    re: /(?<![\w-])leading-[\w[]/,
    why: "a line-height class; roles set line height",
  },
  {
    id: "weight",
    re: /(?<![\w-])font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[)/,
    why: "a weight class; roles set weight ([font-weight:500] for a rare change)",
  },
  {
    id: "case",
    re: /(?<![\w-])(uppercase|lowercase|capitalize)(?![\w-])/,
    why: "a case class; the label role uppercases, strings stay sentence case",
  },
  { id: "tracking", re: /(?<![\w-])tracking-[\w[]/, why: "a tracking class; roles set tracking" },
  {
    id: "shadow",
    re: /(?<![\w-])(drop-|inset-|text-)?shadow(?!-none(?![\w-]))(-[\w[][^\s]*)?(?![\w-])/,
    why: "a shadow; content never casts one (§4.6)",
  },
  {
    id: "radius",
    re: /(?<![\w-])rounded(-[trblse]{1,2})?(-(xs|sm|md|lg|xl|2xl|3xl|4xl|none|\[[^\]]*\]))?(?![\w-])/,
    why: "a radius class; use rounded-control, rounded-panel or rounded-mark",
  },
  {
    id: "palette",
    re: new RegExp(
      `(?<![\\w-])(bg|text|border|ring|outline|fill|stroke|divide|decoration|caret|accent|from|via|to)-(${PALETTE})(-\\d+)?(?![\\w-])`
    ),
    why: "a Tailwind palette colour (white and black included); use a token utility",
  },
  {
    id: "gradient",
    re: /(?<![\w-])bg-(gradient-|linear-|radial|conic|\[(repeating-)?(linear|radial|conic)-gradient)/,
    why: "a gradient (§1: none anywhere)",
  },
];

/** Rules on whole lines (comments skipped). */
export const LINE_RULES = [
  {
    id: "hex",
    // 3, 4, 6 or 8 digits, not part of a longer word. A fragment is not a colour: href="#add", "/support#add".
    re: /(?<![\w/]|href=\{?["'`])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/,
    why: "a hex colour; app code never writes one",
    skip: COLOUR_ALLOWED,
  },
  {
    id: "colour-function",
    // Underscores are spaces in a Tailwind arbitrary value: shadow-[0_1px_rgba(...)].
    re: /(?<![a-zA-Z0-9-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/,
    why: "a colour function; app code uses token utilities",
    skip: COLOUR_ALLOWED,
  },
  {
    id: "raw-heroui",
    re: /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\(\s*)["']@heroui\//,
    why: "HeroUI outside the kit (any @heroui package or subpath); import the kit component from @/vector",
  },
];

const STRING = /"([^"\\\n]*)"|'([^'\\\n]*)'|`([^`\\\n]*)`/g;

/** True when every word of a string looks like a utility class (no capitals, no sentence end). */
export const classLike = (s) => {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((w) => /^[a-z0-9!\-:[\]()/%.#_=&>*,'"@]+$/.test(w) && !/[.,]$/.test(w));
};

/** The class-like candidates on one line: string literals, and each static part of a template literal. */
function candidates(code) {
  const out = [];
  for (const [, a, b, c] of code.matchAll(STRING)) {
    if (c !== undefined) out.push(...c.split(/\$\{[^}]*\}/));
    else out.push(a ?? b ?? "");
  }
  return out.filter(classLike);
}

/** Problems in one page-code file, as `path:line  rule  "match" is why` strings. */
export function lintSource(rel, text) {
  if (EXEMPT.some((re) => re.test(rel))) return [];
  const asset = ASSETS.some((re) => re.test(rel));
  const problems = [];
  text.split("\n").forEach((line, i) => {
    const code = line.trim();
    if (code.startsWith("//") || code.startsWith("*") || code.startsWith("/*") || code.startsWith("{/*")) return;
    for (const rule of LINE_RULES) {
      if (rule.skip?.some((re) => re.test(rel))) continue;
      const m = code.match(rule.re);
      if (m) problems.push(`${rel}:${i + 1}  ${rule.id}  "${m[0]}" is ${rule.why}`);
    }
    if (asset) return;
    for (const str of candidates(code)) {
      for (const rule of CLASS_RULES) {
        const m = str.match(rule.re);
        if (m) problems.push(`${rel}:${i + 1}  ${rule.id}  "${m[0]}" is ${rule.why}`);
      }
    }
  });
  return problems;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(tsx?|css)$/.test(name)) yield path;
  }
}

/** Every page-code problem under `root`. */
export function lintPages(root) {
  const problems = [];
  for (const dir of PAGE_DIRS) {
    for (const path of walk(join(root, dir))) {
      problems.push(...lintSource(relative(root, path), readFileSync(path, "utf8")));
    }
  }
  return problems;
}
