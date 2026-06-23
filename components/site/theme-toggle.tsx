"use client";

import { useState } from "react";

type Labels = { toLight: string; toDark: string };

export function ThemeToggle({ labels }: { labels: Labels }) {
  const [isLight, setIsLight] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("light")
  );

  function toggle() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    setIsLight(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      className="font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
    >
      {isLight ? labels.toDark : labels.toLight}
    </button>
  );
}
