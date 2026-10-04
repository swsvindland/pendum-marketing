"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  appliedAppearance,
  applyAppearance,
  setAppearance,
  storedAppearance,
  subscribeAppearance,
  type Appearance,
} from "@/vector/appearance";
import { NativeChoices } from "@/vector/form/choices-native";

/**
 * Appearance: System / Light / Dark (glossary, §10). The control shows what is applied on <html> (data-theme), not
 * what storage says, so it agrees with the page when storage is blocked, after a choice in another tab, and once
 * the head script has run. Before hydration the server's System shows; the page itself is already right. On the
 * kit's native segmented control, so this island, which every page carries, ships no HeroUI.
 */
export function AppearanceChoice() {
  const value = useSyncExternalStore(subscribeAppearance, appliedAppearance, () => "system" as Appearance);

  // In development React's Strict Mode remount clears the attribute the head script set; put the stored choice
  // back before paint (a no-op in production, where nothing clears it).
  useLayoutEffect(() => {
    const stored = storedAppearance();
    if (stored !== "system" && appliedAppearance() !== stored) applyAppearance(stored);
  }, []);

  return (
    <NativeChoices
      label="Appearance"
      name="appearance"
      value={value}
      onChange={setAppearance}
      values={[
        { value: "system", label: "System" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
    />
  );
}
