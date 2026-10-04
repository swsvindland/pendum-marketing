import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { hasWatch, modelLabel } from "@/components/apps/model";
import { MarkImage, brand, imageFonts, publicImageDataUrl } from "@/components/site/brand";
import { apps, getApp } from "@/content/apps";
import { listFormat, sentenceCase } from "@/content/format";
import { site } from "@/content/site";
import { shippedFeatures } from "@/content/structured-data";

export const alt = `An app from ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}

const fonts = await imageFonts();

// The label role at card scale: Plex Mono, +0.08em, uppercased here as CSS does on the site.
const label = {
  fontFamily: "Plex Mono",
  fontSize: 18,
  lineHeight: "24px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: brand.muted,
} as const;

/**
 * The per-app card (SEO-10): the white canvas and 1px rules of the shared card, the app icon under the system
 * mask beside its name, the category line, and a readout strip of facts that are true today: how it is sold,
 * how many platforms and languages, and how many shipped features. Cyan appears only as the family mark's fill.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();
  const icon = await publicImageDataUrl(app.icon.light);
  const platforms = listFormat.format(app.platforms);
  const category = app.category ? `${sentenceCase(app.category)} for ${platforms}` : platforms;
  // The model is in the top-right label; the strip holds counts only, so nothing wraps at card scale.
  const readouts = [
    { label: hasWatch(app) ? "Platforms / Watch" : "Platforms", value: String(app.platforms.length), unit: app.platforms.length === 1 ? "platform" : "platforms" },
    { label: "Languages", value: String(app.languages.length), unit: app.languages.length === 1 ? "language" : "languages" },
    { label: "Features", value: String(shippedFeatures(app).length), unit: "shipped" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: brand.canvas,
          color: brand.foreground,
          fontFamily: "Sans",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 120,
            padding: "0 72px",
            borderBottom: `1px solid ${brand.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <MarkImage size={48} />
            <div style={{ fontSize: 44, letterSpacing: "-0.02em" }}>{site.name}</div>
          </div>
          {/* One text node: Satori wants display flex on any element with several children. */}
          <div style={label}>{`Apps / ${modelLabel(app)}`}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            padding: "0 72px",
            gap: 48,
          }}
        >
          {/* The icon keeps the system's mask (§4.4) with a 1px keyline, as AppIcon draws it on the site. */}
          <img
            src={icon}
            width={160}
            height={160}
            alt=""
            style={{ borderRadius: 36, border: `1px solid ${brand.border}`, flexShrink: 0 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
            <div style={{ fontSize: 72, lineHeight: "80px", letterSpacing: "-0.03em" }}>{app.name}</div>
            <div style={{ fontSize: 32, lineHeight: "44px", color: brand.secondary, maxWidth: 820 }}>{category}</div>
          </div>
        </div>

        <div style={{ display: "flex", height: 156, borderTop: `1px solid ${brand.border}` }}>
          {readouts.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                gap: 10,
                paddingLeft: i === 0 ? 72 : 40,
                paddingRight: i === readouts.length - 1 ? 72 : 40,
                borderLeft: i === 0 ? "none" : `1px solid ${brand.border}`,
              }}
            >
              <div style={label}>{r.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={{ fontFamily: "Plex Mono", fontSize: 56, lineHeight: "60px", letterSpacing: "-0.02em" }}>
                  {r.value}
                </div>
                <div style={{ fontSize: 26, color: brand.muted }}>{r.unit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
