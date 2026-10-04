import type { NextConfig } from "next";

/**
 * Headers every response carries. The CSP is frame-ancestors only: a script-src policy needs a nonce for the inline
 * appearance script in src/app/layout.tsx. HSTS is ignored over plain HTTP, so it is harmless locally; drop it if
 * the host sets its own.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // The stylesheet stays an external 18 KB (gzip) file. `experimental.inlineCss` was measured on 2026-10-03: Next
  // writes the CSS into the document three times (the <style>, then once per globals.css import in the RSC
  // payload, for the root layout and for global-error), and copies of 142 KB are beyond gzip's window, so the home
  // HTML grew from 31 KB to 87 KB gzip while mobile Lighthouse stayed within run-to-run noise (FCP 1.0–1.1 s
  // against 1.1–1.2 s, LCP 2.5–3.0 s against 2.3–2.8 s on /). Turn it on again only with a measurement that says
  // otherwise.
  poweredByHeader: false,
  // The app icons under public/apps only change with a new file name, so their optimized variants can stay cached
  // for 30 days instead of Next's 4-hour default.
  images: { minimumCacheTTL: 2592000 },
  // Pendum One was OmegaFyt (renamed 2026-10-04, before launch): its old page address keeps working.
  async redirects() {
    return [{ source: "/apps/omegafyt", destination: "/apps/one", permanent: true }];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The font files carry a content hash in their name (scripts/fonts.mjs), so they can be cached like
      // /_next/static.
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
