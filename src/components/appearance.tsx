"use client";

import { useSyncExternalStore } from "react";
import { Choices } from "@/vector/form";

type Appearance = "system" | "light" | "dark";
const KEY = "vector-appearance";

function read(): Appearance {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function write(value: Appearance) {
  try {
    if (value === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
  if (value === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", value);
  listeners.forEach((fn) => fn());
}

/** Runs in <head> before first paint, so a stored appearance never flashes (see layout.tsx). */
export const appearanceScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/** Appearance: System / Light / Dark (glossary, §10). */
export function AppearanceChoice() {
  const value = useSyncExternalStore(subscribe, read, () => "system" as Appearance);
  return (
    <Choices
      label="Appearance"
      size="sm"
      value={value}
      onChange={write}
      values={[
        { value: "system", label: "System" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
    />
  );
}
