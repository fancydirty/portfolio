"use client";

import { motion, useReducedMotion } from "motion/react";
import type { FlowSpec, FlowNode } from "@/components/diagrams/diagrams-data";

const MONO = "var(--font-mono), ui-monospace, monospace";
const DEFAULT_W = 150;
const DEFAULT_H = 54;

function center(n: FlowNode) {
  return {
    cx: n.x + (n.w ?? DEFAULT_W) / 2,
    cy: n.y + (n.h ?? DEFAULT_H) / 2,
  };
}

/**
 * Data-driven architecture diagram. Renders a refined node-and-edge flow from a
 * FlowSpec and animates it with Framer Motion: nodes stagger in along the flow
 * order as the diagram scrolls into view, and an accent pulse travels each edge
 * to show data moving through the pipeline. Honors prefers-reduced-motion by
 * rendering the full diagram statically with no pulses.
 */
export function FlowDiagram({ spec }: { spec: FlowSpec }) {
  const reduce = useReducedMotion();
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
        fill="#141416"
        rx="6"
      />
      <text
        x="50%"
        y="26"
        textAnchor="middle"
        style={{ fontFamily: MONO, fontSize: 12, fill: "#e0a878", letterSpacing: "0.04em" }}
      >
        {spec.title}
      </text>

      {spec.edges.map((e, i) => {
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
              stroke="#232327"
              strokeWidth={1}
              strokeDasharray={e.dashed ? "4 5" : undefined}
            />
            {reduce ? null : (
              <motion.circle
                r={3.5}
                fill="#e0a878"
                initial={{ cx: p1.cx, cy: p1.cy, opacity: 0 }}
                animate={{
                  cx: [p1.cx, p2.cx],
                  cy: [p1.cy, p2.cy],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.25,
                }}
              />
            )}
          </g>
        );
      })}

      {spec.nodes.map((n, i) => {
        const w = n.w ?? DEFAULT_W;
        const h = n.h ?? DEFAULT_H;
        const { cx, cy } = center(n);
        return (
          <motion.g
            key={n.id}
            data-accent={String(!!n.accent)}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <rect
              x={n.x}
              y={n.y}
              width={w}
              height={h}
              rx={9}
              fill={n.accent ? "#241a0e" : "#1a1a1d"}
              stroke={n.accent ? "#e0a878" : "#232327"}
              strokeWidth={1}
            />
            <text
              x={cx}
              y={n.sub ? cy - 3 : cy + 4}
              textAnchor="middle"
              style={{ fontFamily: MONO, fontSize: 12.5, fill: n.accent ? "#e0a878" : "#ededed" }}
            >
              {n.label}
            </text>
            {n.sub ? (
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                style={{ fontFamily: MONO, fontSize: 10, fill: "#6c6c72" }}
              >
                {n.sub}
              </text>
            ) : null}
          </motion.g>
        );
      })}
    </svg>
  );
}
