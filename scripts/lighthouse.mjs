#!/usr/bin/env node
/**
 * Lighthouse over every public route, with the toolchain installed on demand under .work/lighthouse (gitignored):
 * Lighthouse and Chrome for Testing, since this machine has no Chrome. The site must already be built with a real
 * NEXT_PUBLIC_SITE_URL (a localhost fallback build is noindex and fails the SEO audit) and be running:
 *
 *   NEXT_PUBLIC_SITE_URL=https://example.test pnpm build && PORT=3100 pnpm start
 *   pnpm lighthouse                       # mobile, every route in the sitemap, scores and failing audits
 *   pnpm lighthouse -- --desktop          # the desktop preset
 *   pnpm lighthouse -- --routes /,/pricing --categories accessibility,seo
 *   pnpm lighthouse -- --base http://localhost:3000
 *
 * Mobile is the strict one. Scores vary by about ±1 between runs: the h1 is the LCP, and Lighthouse's simulated
 * load charges every request that finishes before it, so run twice before believing a single point.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = join(root, ".work", "lighthouse");
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const desktop = args.includes("--desktop");
const base = flag("--base") ?? "http://localhost:3100";
const categories = flag("--categories") ?? "performance,accessibility,best-practices,seo";
const only = flag("--routes")?.split(",").map((s) => s.trim()).filter(Boolean);

function ensureTooling() {
  mkdirSync(work, { recursive: true });
  const pkg = join(work, "package.json");
  if (!existsSync(pkg)) writeFileSync(pkg, JSON.stringify({ name: "lighthouse-work", private: true }, null, 2));
  const bin = join(work, "node_modules", ".bin", "lighthouse");
  if (!existsSync(bin)) {
    console.log("Installing Lighthouse under .work/lighthouse …");
    execFileSync("npm", ["install", "lighthouse@13", "@puppeteer/browsers@3", "--no-audit", "--no-fund", "--loglevel=error"], {
      cwd: work,
      stdio: "inherit",
      env: { ...process.env, npm_config_cache: join(work, ".npm-cache") },
    });
  }
  const chrome = findChrome();
  if (chrome) return { bin, chrome };
  console.log("Installing Chrome for Testing under .work/lighthouse/browsers …");
  execFileSync("npx", ["@puppeteer/browsers", "install", "chrome@stable", "--path", join(work, "browsers")], {
    cwd: work,
    stdio: "inherit",
    env: { ...process.env, npm_config_cache: join(work, ".npm-cache") },
  });
  const found = findChrome();
  if (!found) throw new Error("Chrome for Testing did not install; see the output above.");
  return { bin, chrome: found };
}

function findChrome() {
  const dir = join(work, "browsers", "chrome");
  if (!existsSync(dir)) return null;
  for (const version of readdirSync(dir)) {
    const candidates = [
      join(dir, version, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      join(dir, version, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      join(dir, version, "chrome-linux64", "chrome"),
    ];
    for (const c of candidates) if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

async function routes() {
  if (only) return only;
  const xml = await (await fetch(new URL("/sitemap.xml", base))).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (!paths.length) throw new Error(`No routes in ${base}/sitemap.xml. Is the site built with NEXT_PUBLIC_SITE_URL and running?`);
  return paths;
}

function run(bin, chrome, path) {
  const out = join(work, "out");
  mkdirSync(out, { recursive: true });
  const file = join(out, `${(path.replace(/\//g, "_") || "_")}-${desktop ? "desktop" : "mobile"}.json`);
  const lhArgs = [
    new URL(path, base).toString(),
    "--output=json",
    `--output-path=${file}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
    `--only-categories=${categories}`,
  ];
  if (desktop) lhArgs.push("--preset=desktop");
  const r = spawnSync(bin, lhArgs, { env: { ...process.env, CHROME_PATH: chrome }, stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0) return { path, error: `lighthouse exited ${r.status}` };
  const lhr = JSON.parse(readFileSync(file, "utf8"));
  const scores = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  const failing = [];
  for (const cat of Object.values(lhr.categories))
    for (const ref of cat.auditRefs) {
      const a = lhr.audits[ref.id];
      if (a && a.score !== null && a.score < 1 && ref.weight > 0) failing.push(`${ref.id} (${a.score}${a.displayValue ? `, ${a.displayValue}` : ""})`);
    }
  const metric = (id) => lhr.audits[id]?.displayValue ?? "";
  return { path, scores, metrics: `FCP ${metric("first-contentful-paint")} LCP ${metric("largest-contentful-paint")} TBT ${metric("total-blocking-time")} CLS ${metric("cumulative-layout-shift")}`, failing };
}

const { bin, chrome } = ensureTooling();
const list = await routes();
console.log(`${desktop ? "Desktop" : "Mobile"} Lighthouse on ${list.length} routes at ${base}\n`);
let allPerfect = true;
for (const path of list) {
  const r = run(bin, chrome, path);
  if (r.error) {
    allPerfect = false;
    console.log(`${path.padEnd(34)} ${r.error}`);
    continue;
  }
  const s = r.scores;
  const line = Object.entries(s).map(([k, v]) => `${k === "best-practices" ? "bp" : k.slice(0, 4)} ${String(v).padStart(3)}`).join("  ");
  console.log(`${path.padEnd(34)} ${line}   ${r.metrics}`);
  for (const f of r.failing) console.log(`${"".padEnd(34)}   - ${f}`);
  if (Object.values(s).some((v) => v < 100)) allPerfect = false;
}
console.log(allPerfect ? "\nEvery category is 100 on every route." : "\nAt least one route is under 100; the lines above say which audit.");
