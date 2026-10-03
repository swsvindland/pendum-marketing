import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { calculators } from "@/content/calculators";

// Every calculator in the content has its own static route, and every route belongs to a listed calculator: a
// missing route would leave a dead link in the lists and the sitemap.

const dir = fileURLToPath(new URL(".", import.meta.url));
const routes = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

describe("calculator routes", () => {
  it("has one route per calculator, and no others", () => {
    expect([...routes].sort()).toEqual(calculators.map((c) => c.slug).sort());
  });

  it("renders each calculator's own page with its own metadata", () => {
    for (const { slug } of calculators) {
      const file = `${dir}${slug}/page.tsx`;
      expect(existsSync(file), slug).toBe(true);
      const source = readFileSync(file, "utf8");
      expect(source, slug).toContain(`from "@/calculators/${slug}/page"`);
      expect(source, slug).toContain(`calculatorMeta("${slug}")`);
    }
  });
});
