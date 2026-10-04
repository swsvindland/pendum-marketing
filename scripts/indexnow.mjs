#!/usr/bin/env node
// Submits every sitemap URL to IndexNow, so Bing (the index behind Copilot and ChatGPT search's third-party
// results), Yandex, Naver, Seznam, Yep and Amazon pick up changes within hours instead of waiting for a crawl.
// Protocol: https://www.indexnow.org/documentation (a key file at the site root proves control of the host; one
// POST of up to 10,000 URLs; the api.indexnow.org endpoint shares with every participant).
//
//   pnpm indexnow              submits (needs NEXT_PUBLIC_SITE_URL and INDEXNOW_KEY)
//   pnpm indexnow --dry-run    reads the sitemap and prints the request without sending it
//
// Without both variables the script is a dry run, so a build pipeline can call it before the owner has set them.
// Run it after the production deploy is live, not during `next build`: the sitemap and the key file must be served.
//
// Setup (owner):
// 1. The key is public/<key>.txt, 32 hex characters, its content exactly the key. It is public by design. To rotate
//    it: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`, save the new file, delete the
//    old one, and set INDEXNOW_KEY to the new value in the deployment environment.
// 2. Verify the site in Bing Webmaster Tools (import from Search Console works) and read its AI Performance report
//    for Copilot citations and the grounding queries behind them.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

const site = process.env.NEXT_PUBLIC_SITE_URL;
const key = process.env.INDEXNOW_KEY;
const dryRun = process.argv.includes("--dry-run") || !site || !key;

/** The key files in public/ (<32 hex>.txt), each read and trimmed. */
function localKeys() {
  return readdirSync(publicDir)
    .filter((name) => /^[0-9a-f]{8,128}\.txt$/.test(name))
    .map((name) => ({ name, key: readFileSync(join(publicDir, name), "utf8").trim() }));
}

async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

if (!site) {
  console.log("Dry run: NEXT_PUBLIC_SITE_URL is not set, so there is no sitemap to read. Set it and INDEXNOW_KEY to submit.");
  process.exit(0);
}

const origin = new URL(site);
const sitemapUrl = new URL("/sitemap.xml", origin).toString();
let sitemap;
try {
  sitemap = await fetchText(sitemapUrl);
} catch (error) {
  console.error(`Could not read ${sitemapUrl}: ${error?.cause?.message ?? error?.message ?? error}. Is the site deployed?`);
  process.exit(1);
}
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
if (!urlList.length) {
  console.error(`No URLs in ${sitemapUrl}`);
  process.exit(1);
}

const keys = localKeys();
const effectiveKey = key ?? keys[0]?.key ?? "<INDEXNOW_KEY>";
const keyLocation = new URL(`/${effectiveKey}.txt`, origin).toString();
const body = { host: origin.host, key: effectiveKey, keyLocation, urlList };

if (key && !keys.some((k) => k.key === key)) {
  console.warn(`Warning: no public/${key}.txt holds INDEXNOW_KEY; IndexNow verifies ${keyLocation} and rejects the request without it.`);
}

if (dryRun) {
  console.log(`Dry run: ${urlList.length} URLs from ${sitemapUrl} would be submitted to ${ENDPOINT}.`);
  if (!key) console.log("INDEXNOW_KEY is not set; nothing is sent.");
  console.log(JSON.stringify({ ...body, urlList: urlList.slice(0, 5).concat(urlList.length > 5 ? [`… ${urlList.length - 5} more`] : []) }, null, 2));
  process.exit(0);
}

// The key file must be served before IndexNow accepts the request.
const served = (await fetchText(keyLocation).catch(() => "")).trim();
if (served !== key) {
  console.error(`${keyLocation} does not serve the key (got ${served ? `"${served.slice(0, 16)}…"` : "nothing"}). Deploy public/${key}.txt first.`);
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
  signal: AbortSignal.timeout(30_000),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs on ${origin.host}`); // 200 and 202 are success
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
