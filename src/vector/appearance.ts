// The Appearance setting (System / Light / Dark, §10), web edition. Server-safe: plain functions and a string, no
// React, no browser globals at import time, so the root layout can import the head script and the footer control
// can import the store. tokens.css reads `data-theme` on <html>; without it the system scheme applies.

export type Appearance = "system" | "light" | "dark";

export const APPEARANCE_KEY = "vector-appearance";

/**
 * Applies an appearance to the document: `data-theme` on <html>, and for a manual choice a theme-color meta in
 * the canvas colour, placed before the layout's media-based ones (the first match wins), so the browser bar follows
 * a manual Dark on a light system. Self-contained (no imports, no outer variables): the head script embeds it.
 */
export function applyAppearance(value: Appearance) {
  const root = document.documentElement;
  let meta = document.querySelector('meta[name="theme-color"][data-appearance]');
  if (value !== "light" && value !== "dark") {
    root.removeAttribute("data-theme");
    if (meta) meta.remove();
    return;
  }
  root.setAttribute("data-theme", value);
  const color = getComputedStyle(root).getPropertyValue("--background").trim();
  if (!color) return;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("data-appearance", "");
    document.head.insertBefore(meta, document.querySelector('meta[name="theme-color"]'));
  }
  meta.setAttribute("content", color);
}

/**
 * Runs in <head> while the HTML parses, after the stylesheet and before first paint, so a stored appearance never
 * flashes (Next 16 guide: preventing flash before hydration). Storage can be blocked; then the system scheme stays.
 */
export const appearanceScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(APPEARANCE_KEY)});if(t==="light"||t==="dark")(${applyAppearance.toString()})(t)}catch(e){}})()`;

/** The stored choice: "system" when there is none or storage is blocked. */
export function storedAppearance(): Appearance {
  try {
    const v = localStorage.getItem(APPEARANCE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/** The applied appearance, read from <html>: what the visitor sees, whatever storage allows. */
export function appliedAppearance(): Appearance {
  const v = document.documentElement.getAttribute("data-theme");
  return v === "light" || v === "dark" ? v : "system";
}

/** Stores the choice where storage allows (otherwise it lasts for this visit only) and applies it. */
export function setAppearance(value: Appearance) {
  try {
    if (value === "system") localStorage.removeItem(APPEARANCE_KEY);
    else localStorage.setItem(APPEARANCE_KEY, value);
  } catch {
    // Storage blocked: data-theme still carries the choice until the next full load.
  }
  applyAppearance(value);
}

/**
 * Calls `onChange` whenever the applied appearance changes: a choice here, the head script, React clearing <html>
 * attributes on a development remount, or a choice made in another tab (applied here from its storage event).
 */
export function subscribeAppearance(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const onStorage = (e: StorageEvent) => {
    if (e.key === APPEARANCE_KEY || e.key === null) applyAppearance(storedAppearance());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
  };
}
