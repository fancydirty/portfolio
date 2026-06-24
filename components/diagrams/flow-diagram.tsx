"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FlowSpec, FlowNode } from "@/components/diagrams/diagrams-data";

const MONO = "var(--font-mono), ui-monospace, monospace";
const DEFAULT_W = 150;
const DEFAULT_H = 54;

const emptySubscribe = () => () => {};
/** False during SSR / before hydration, true on the client — lint-clean. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function center(n: FlowNode) {
  return {
    cx: n.x + (n.w ?? DEFAULT_W) / 2,
    cy: n.y + (n.h ?? DEFAULT_H) / 2,
  };
}

function NodeBody({ n }: { n: FlowNode }) {
  const w = n.w ?? DEFAULT_W;
  const h = n.h ?? DEFAULT_H;
  const { cx, cy } = center(n);
  return (
    <>
      <rect
        x={n.x}
        y={n.y}
        width={w}
        height={h}
        rx={9}
        strokeWidth={1}
        style={{
          fill: n.accent
            ? "color-mix(in srgb, var(--accent) 14%, var(--surface-2))"
            : "var(--surface-2)",
          stroke: n.accent ? "var(--accent)" : "var(--hairline)",
        }}
      />
      <text
        x={cx}
        y={n.sub ? cy - 3 : cy + 4}
        textAnchor="middle"
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          fill: n.accent ? "var(--accent)" : "var(--ink)",
        }}
      >
        {n.label}
      </text>
      {n.sub ? (
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          style={{ fontFamily: MONO, fontSize: 10, fill: "var(--ink-subtle)" }}
        >
          {n.sub}
        </text>
      ) : null}
    </>
  );
}

/**
 * Data-driven architecture diagram. Renders a refined node-and-edge flow from a
 * FlowSpec and animates it with Framer Motion: once the diagram scrolls into
 * view the nodes stagger in along the flow order, and an accent pulse travels
 * each edge to show data moving through the pipeline.
 *
 * Robustness:
 * - The stagger entrance plays once after hydration (not gated on viewport
 *   detection, which proved flaky for large inline SVGs and could leave nodes
 *   stuck hidden). The continuous pulse carries the "alive" feel while viewing.
 * - Before hydration (SSR / no-JS) the nodes render statically visible, so the
 *   diagram is never blank without JS. Motion takes over after mount.
 * - prefers-reduced-motion → fully static, no pulses.
 */
export function FlowDiagram({ spec }: { spec: FlowSpec }) {
  const reduce = useReducedMotion();
  const mounted = useHydrated();

  const motionOn = mounted && !reduce;
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));

  return (
    <svg
      role="img"
      aria-label={spec.title}
      viewBox={spec.viewBox}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", maxWidth: "100%" }}
    >
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="6"
        strokeWidth={1}
        style={{ fill: "var(--surface-1)", stroke: "var(--hairline)" }}
      />
      <text
        x="50%"
        y="26"
        textAnchor="middle"
        style={{ fontFamily: MONO, fontSize: 12, fill: "var(--accent)", letterSpacing: "0.04em" }}
      >
        {spec.title}
      </text>

      {spec.edges.map((e) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const p1 = center(a);
        const p2 = center(b);
        return (
          <g key={`e-${e.from}-${e.to}`}>
            <line
              data-edge
              x1={p1.cx}
              y1={p1.cy}
              x2={p2.cx}
              y2={p2.cy}
              strokeWidth={1}
              strokeDasharray={e.dashed ? "4 5" : undefined}
              style={{ stroke: "var(--hairline)" }}
            />
            <line
              x1={p1.cx}
              y1={p1.cy}
              x2={p2.cx}
              y2={p2.cy}
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeDasharray={e.dashed ? "3 13" : "7 11"}
              opacity={0.9}
              className="flow-edge"
              style={{ stroke: "var(--accent)" }}
            />
          </g>
        );
      })}

      {motionOn
        ? spec.nodes.map((n, i) => (
            <motion.g
              key={n.id}
              data-accent={String(!!n.accent)}
              initial={{ y: 9 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
            >
              <NodeBody n={n} />
            </motion.g>
          ))
        : spec.nodes.map((n) => (
            <g key={n.id} data-accent={String(!!n.accent)}>
              <NodeBody n={n} />
            </g>
          ))}
    </svg>
  );
}
