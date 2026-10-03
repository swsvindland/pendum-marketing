import localFont from "next/font/local";

// The kit's two bundled faces (design-system §3.1) as the web serves them: WOFF2 subsets of the TTFs beside this
// file, written by `pnpm fonts` (scripts/fonts.mjs). Inter is variable (wght 400–700, opsz kept), Plex Mono is
// Regular only. One definition for the root layout and the global error page.

export const inter = localFont({
  src: "./Inter.subset.woff2",
  variable: "--font-inter",
  weight: "400 700",
  display: "swap",
});

export const plexMono = localFont({
  src: "./IBMPlexMono-Regular.subset.woff2",
  variable: "--font-plex-mono",
  weight: "400",
  display: "swap",
});

/** Both faces' CSS variables, for the <html> class. */
export const fontVariables = `${inter.variable} ${plexMono.variable}`;
