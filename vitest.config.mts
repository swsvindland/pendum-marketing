import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// .mts: an ES module whatever package.json says, so Vitest loads it without the CommonJS warning.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    environment: "node",
  },
});
