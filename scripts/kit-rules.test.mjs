import { describe, expect, it } from "vitest";
import { lintSource } from "./kit-rules.mjs";

/** The rule ids a single line of page code trips. */
const rules = (line, path = "src/components/example.tsx") =>
  lintSource(path, line).map((problem) => problem.split(/\s+/)[1]);

describe("page-code rules", () => {
  it.each([
    ['<p className="text-[13px] leading-tight">', ["arbitrary-text", "leading"]],
    ['<p className="font-[600]">', ["weight"]],
    ['<p className="font-semibold">', ["weight"]],
    ['<div className="shadow-xs">', ["shadow"]],
    ['<div className="drop-shadow-md">', ["shadow"]],
    ['<div className="shadow-[0_1px_2px_rgba(0,0,0,0.1)]">', ["colour-function", "shadow"]],
    ['<div className="rounded-[8px]">', ["radius"]],
    ['<div className="rounded-lg">', ["radius"]],
    ['<div className="bg-white text-white">', ["palette"]],
    ['<div className="text-slate-500">', ["palette"]],
    ["<div className={`text-lg ${x}`}>", ["size"]],
    ['<div className="bg-[linear-gradient(90deg,var(--tint),var(--accent))]">', ["gradient"]],
    ['<div className="bg-linear-to-r">', ["gradient"]],
    ['const c = "#22D3EEAA";', ["hex"]],
    ['const c = "#22D3EE";', ["hex"]],
    ['const c = "#fff";', ["hex"]],
    ['const c = "rgb(34 211 238)";', ["colour-function"]],
    ['const c = "oklch(0.8 0.1 200)";', ["colour-function"]],
    ['import { Button } from "@heroui/react/button";', ["raw-heroui"]],
    ['import { Button } from "@heroui/react";', ["raw-heroui"]],
    ['import { buttonVariants } from "@heroui/styles";', ["raw-heroui"]],
    ['import "@heroui/styles";', ["raw-heroui"]],
  ])("flags %s", (line, expected) => {
    expect(rules(line).sort()).toEqual([...expected].sort());
  });

  it.each([
    '<a href="#add">Add</a>',
    '<Link href="/support#add">Support</Link>',
    "<a href={`#${id}`}>Jump</a>",
    '<div className="rounded-control border border-border-strong bg-surface text-foreground">',
    '<span className="size-1.5 rounded-full bg-accent shadow-none">',
    '<p className="type-small text-muted [font-weight:500]">',
    '<p className="text-tint underline-offset-4">',
    'const label = "Text shadow and leading questions are prose, not classes.";',
    "const path = `/apps/${slug}`;",
    'import { Button } from "@/vector/button";',
  ])("allows %s", (line) => {
    expect(rules(line)).toEqual([]);
  });

  it("lets the raster and meta routes write colours", () => {
    expect(rules('const ink = "#071017";', "src/app/opengraph-image.tsx")).toEqual([]);
    expect(rules('const ink = "#071017";', "src/app/layout.tsx")).toEqual([]);
  });

  it("skips comments", () => {
    expect(rules("// text-lg #22D3EE is how it used to look")).toEqual([]);
  });
});
