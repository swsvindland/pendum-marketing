"use client";

import { useMemo, useSyncExternalStore } from "react";

// Today's date for the goal date, read as an external store: the same "y-m-d" string all day, so the tool re-renders
// only when the day turns. A tab left open past midnight moves its dates on by itself.

const dayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const check = () => {
    onChange();
    arm();
  };
  // One second past the next local midnight.
  function arm() {
    clearTimeout(timer);
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(check, midnight.getTime() - now.getTime() + 1000);
  }
  arm();
  // A sleeping computer or a background tab can hold the timer past midnight; coming back reads the day again.
  document.addEventListener("visibilitychange", check);
  window.addEventListener("focus", check);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", check);
    window.removeEventListener("focus", check);
  };
}

/**
 * The local date today, at midnight. null on the server and while hydrating, so the server (which renders the empty
 * result) and the browser never disagree about a date.
 */
export function useToday(): Date | null {
  const key = useSyncExternalStore(subscribe, dayKey, () => null);
  return useMemo(() => {
    if (!key) return null;
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m, d);
  }, [key]);
}
