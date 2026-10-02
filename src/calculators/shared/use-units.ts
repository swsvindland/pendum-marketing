"use client";

import { useSyncExternalStore } from "react";

export type UnitSystem = "metric" | "imperial";

const KEY = "vector-units";
const listeners = new Set<() => void>();
/** This page's choice when storage is blocked. */
let memory: UnitSystem | null = null;

function read(): UnitSystem {
  if (memory) return memory;
  try {
    const v = localStorage.getItem(KEY);
    if (v === "metric" || v === "imperial") return v;
  } catch {
    // Storage blocked: fall through to the locale.
  }
  // First visit: US English browsers start in imperial, everyone else in metric.
  return /^en-US$/i.test(navigator.language) ? "imperial" : "metric";
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      memory = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function write(u: UnitSystem) {
  memory = u;
  try {
    localStorage.setItem(KEY, u);
  } catch {
    // Not remembered beyond this page.
  }
  listeners.forEach((fn) => fn());
}

/**
 * The visitor's unit system, shared by every calculator and remembered in this browser. The server renders
 * metric; the browser switches to the stored or locale choice as it hydrates.
 */
export function useUnits(): [UnitSystem, (u: UnitSystem) => void] {
  return [useSyncExternalStore(subscribe, read, () => "metric" as UnitSystem), write];
}
