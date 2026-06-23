"use client";

import { useSyncExternalStore } from "react";

type Labels = { toLight: string; toDark: string };

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("light");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({ labels }: { labels: Labels }) {
  const isLight = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !isLight;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    for (const listener of listeners) listener();
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
