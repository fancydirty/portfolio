"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedDiagramProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Client wrapper that animates "flow" along the arrows of an inline SVG when it
 * scrolls into view. Degrades gracefully: with no JS, reduced motion, or before
 * entering the viewport, the diagram renders fully drawn and static.
 */
export function AnimatedDiagram({ title, children, className }: AnimatedDiagramProps) {
  const ref = useRef<HTMLElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const figure = ref.current;
    if (!figure) return;

    // Reduced-motion check. Default to static when the API is unavailable.
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Without IntersectionObserver, leave the diagram in its static full state.
    if (typeof IntersectionObserver !== "function") return;

    // Normalize the draw length per flow path so the animation works regardless
    // of each path's actual geometry.
    const paths = figure.querySelectorAll<SVGPathElement>("path[data-flow]");
    for (const path of paths) {
      let len = 200;
      try {
        const measured = path.getTotalLength();
        if (Number.isFinite(measured) && measured > 0) len = measured;
      } catch {
        // jsdom / unsupported engines fall back to the default length.
      }
      path.style.setProperty("--len", String(len));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAnimate(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(figure);

    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      role="img"
      aria-label={title}
      data-animate={animate ? "true" : undefined}
      className={className}
    >
      <style>{`
        figure[data-animate="true"] path[data-flow] {
          stroke-dasharray: var(--len, 200);
          stroke-dashoffset: var(--len, 200);
          animation: pf-draw 1.2s ease forwards;
        }
        @keyframes pf-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      {children}
    </figure>
  );
}
