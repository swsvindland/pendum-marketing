import { readFile } from "node:fs/promises";
import { join } from "node:path";
import tokens from "@/vector/tokens.json";

/**
 * Light-mode token values as hex, for the generated image assets (Open Graph card, Apple touch icon) and the web
 * manifest, which cannot read CSS variables. Read from the kit snapshot so the images follow a token change.
 */
export const brand = {
  canvas: tokens.color.background.light,
  foreground: tokens.color.foreground.light,
  secondary: tokens.color["foreground-secondary"].light,
  muted: tokens.color.muted.light,
  border: tokens.color.border.light,
  signal: tokens.color.accent.light,
  signalInk: tokens.color["accent-foreground"].light,
} as const;

/**
 * The family mark for generated images: the 20×20 signal square (rx 4) with its ink vector, as in
 * components/wordmark.tsx. The stem is split from the head so the mark stays clean at large sizes: a square cap at
 * the corner pokes past the head, so the stem takes a butt cap and starts half a cap further out, which keeps its
 * tail where the square-capped original ends. `square={false}` draws the vector alone, for a full-bleed icon.
 */
export function MarkImage({ size, square = true }: { size: number; square?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      {square ? <rect width="20" height="20" rx="4" fill={brand.signal} /> : null}
      <path d="M4.88 15.12 14.5 5.5" fill="none" stroke={brand.signalInk} strokeWidth="1.75" strokeLinecap="butt" />
      <path d="M8 5.5h6.5V12" fill="none" stroke={brand.signalInk} strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}

/**
 * Fonts for ImageResponse (Satori), read from the project root. Plex Mono is the kit's own file. Satori cannot
 * parse the variable Inter (its fvar table throws), so sans text uses the Geist Regular that next/og ships until a
 * static Inter face (the kit's optional Inter-SemiBold.ttf) is added to src/fonts.
 */
export async function imageFonts() {
  const [mono, sans] = await Promise.all([
    readFile(join(process.cwd(), "src/fonts/IBMPlexMono-Regular.ttf")),
    readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf")),
  ]);
  return [
    { name: "Sans", data: sans, style: "normal" as const, weight: 400 as const },
    { name: "Plex Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}
