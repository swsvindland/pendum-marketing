import { ImageResponse } from "next/og";
import { apps } from "@/content/apps";
import { calculators } from "@/content/calculators";
import { MarkImage, brand, imageFonts } from "@/components/site/brand";
import { ogCard } from "@/components/site/metadata";

export const alt = ogCard.alt;
export const size = { width: ogCard.width, height: ogCard.height };
export const contentType = "image/png";

const fonts = await imageFonts();

const readout = (label: string, n: number, one: string, many: string) => ({
  label,
  value: new Intl.NumberFormat("en").format(n),
  unit: n === 1 ? one : many,
});

// The strip at the foot of the card: true counts from the content, never example data.
const readouts = [
  readout("Subscription", apps.filter((a) => a.model === "subscription").length, "app", "apps"),
  readout("One-time purchase", apps.filter((a) => a.model === "purchase").length, "app", "apps"),
  readout("Calculators / Free", calculators.length, "tool", "tools"),
];

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
 * The shared card: the white canvas, 1px border rules, the family mark and name, one line of copy and a readout
 * strip in Plex Mono. Cyan appears only as the mark's fill, with its ink vector on it.
 */
export default function OpengraphImage() {
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
            <div style={{ fontSize: 44, letterSpacing: "-0.02em" }}>Vector</div>
          </div>
          <div style={label}>Fitness apps / Calculators</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "0 72px",
            gap: 24,
          }}
        >
          <div style={{ fontSize: 72, lineHeight: "80px", letterSpacing: "-0.03em" }}>Fitness apps, precise by design</div>
          <div style={{ fontSize: 32, lineHeight: "44px", color: brand.secondary, maxWidth: 940 }}>
            A subscription that syncs, or one-time purchases that keep their records on your phone.
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
