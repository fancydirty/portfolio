"use client";

import { useEffect, useState } from "react";

/**
 * Click-to-enlarge wrapper for the architecture diagrams. The diagram stays
 * inline and is fully clickable (zoom-in cursor + hover hint); clicking opens a
 * dark lightbox that scales the same diagram up to fill the viewport. Closes on
 * Escape, backdrop click, or the close button. No external zoom library — the
 * SVGs are inline and scale to their container via viewBox.
 */
export function DiagramZoom({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Enlarge ${label}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group relative block w-full cursor-zoom-in"
      >
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 rounded-md border border-hairline bg-surface-1/80 px-2 py-1 font-mono text-[11px] tracking-wide text-ink-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
        >
          ⤢ expand
        </span>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 p-4 backdrop-blur-sm md:p-10"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
          >
            Close ✕
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-5xl overflow-auto"
          >
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
