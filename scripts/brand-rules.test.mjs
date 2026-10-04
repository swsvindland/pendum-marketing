import { describe, expect, it } from "vitest";
import { ALLOW, lintBrandSource, stripComments } from "./brand-rules.mjs";

/** The rule ids a piece of page code trips. */
const rules = (text, path = "src/components/example.tsx") =>
  lintBrandSource(path, text).map((problem) => problem.split(/\s+/)[1]);

describe("brand-name rules", () => {
  it.each([
    ["<p>Pendum Lift saves a backup file.</p>", ["product-name"]],
    ['const note = "Pendum One, billed by the store.";', ["product-name"]],
    ["const intro = `Each of the Pendum apps is bought once.`;", ["product-name"]],
    ["<h2>The Pendum apps</h2>", ["product-name"]],
    ['alt: "Pendum Body"', ["product-name"]],
    ["<title>Error · Vector</title>", ["family-name"]],
    ['aria-label="Vector home"', ["family-name"]],
    ["            More from Vector", ["family-name"]],
    ['title="Each Vector app"', ["family-name"]],
    ['<p>Pendum Macros, by Vector</p>', ["product-name", "family-name"]],
  ])("flags %s", (line, expected) => {
    expect(rules(line)).toEqual(expected);
  });

  it.each([
    "<p>{names.lift} saves a backup file.</p>",
    "const plan = `${app.plan}, billed by the store.`;",
    "<h2>More from {site.family}</h2>",
    'import { VectorProvider } from "@/vector/provider";',
    "<VectorProvider>{tool}</VectorProvider>",
    'localStorage.getItem("vector-units")',
    'const slug: AppSlug = "one";',
    'const href = "https://example.test/apps/one";',
    "// Pendum Lift: a comment may say it",
    "/** Pendum One, as the content names it */",
    "{/* Pendum Body keeps photos in the app */}",
    'const PENDUM_ONE_STRENGTH = { feature: "Body and strength reports" };',
  ])("allows %s", (line) => {
    expect(rules(line)).toEqual([]);
  });

  it("reports the right line after a block comment and a string holding a slash pair", () => {
    const text = [
      "/*",
      " * Pendum Lift in a comment",
      " */",
      'const a = "https://example.test"; // Pendum Lift',
      'const b = "Pendum Lift";',
    ].join("\n");
    expect(lintBrandSource("src/app/x.tsx", text)).toEqual([
      'src/app/x.tsx:5  product-name  "Pendum Lift" is a product name; read it from src/content (app.name, app.plan, site.series, names, seriesNames)',
    ]);
  });

  it("keeps the allowlisted lines, and only there", () => {
    for (const entry of ALLOW) {
      expect(rules(`<p>${entry.text}</p>`, entry.file)).toEqual([]);
      expect(rules(`<p>${entry.text}</p>`, "src/app/other.tsx")).not.toEqual([]);
    }
    expect(rules('title="Vector kit, web edition"', "src/app/kit/page.tsx")).toEqual([]);
  });

  it("skips test files", () => {
    expect(rules('expect(label).toBe("Pendum Lift, once")', "src/components/pricing/models.test.ts")).toEqual([]);
  });

  it("blanks comments and leaves strings whole", () => {
    expect(stripComments("a // Vector\nb")).toBe("a \nb");
    expect(stripComments('"https://x" // c')).toBe('"https://x" ');
    expect(stripComments("a /* b\nc */ d")).toBe("a     \n     d");
  });
});
