"use client";

import { useEffect, useState } from "react";

/** How long a text must hold still before it is announced: past a pause in typing, not between digits. */
const SETTLE_MS = 800;

/**
 * A polite live region that speaks `text` only once it has held for SETTLE_MS. Typing 100 into a field whose
 * minimum is 1 gives three valid results in a row; only the last is announced. A field's error works the same
 * way: "5" on the way to "50" is never spoken, an error that stays is spoken once.
 */
export function SettledAnnouncement({ text }: { text: string }) {
  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSpoken(text), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [text]);
  return (
    <p className="sr-only" aria-live="polite">
      {spoken}
    </p>
  );
}
