import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";

const mono = "var(--font-mono), ui-monospace, monospace";

type NodeProps = {
  x: number;
  y: number;
  label: string;
  sub: string;
  accent?: boolean;
};

function Node({ x, y, label, sub, accent }: NodeProps) {
  const stroke = accent ? "var(--accent)" : "var(--hairline)";
  const labelFill = accent ? "var(--accent)" : "var(--ink)";
  return (
    <>
      <rect
        x={x}
        y={y}
        width="150"
        height="58"
        rx="10"
        fill="var(--surface-1)"
        stroke={stroke}
        strokeWidth={accent ? 1.75 : 1.25}
      />
      <text x={x + 75} y={y + 26} textAnchor="middle" style={{ fontFamily: mono, fontSize: "11px", fontWeight: 600, fill: labelFill }}>
        {label}
      </text>
      <text x={x + 75} y={y + 42} textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>
        {sub}
      </text>
    </>
  );
}

/**
 * Flagship editorial diagram of the Mediary Scout acquisition flow:
 * request -> queue -> worker -> sandbox agent -> search -> transfer -> verify -> notify.
 * Two wrapped rows of four nodes. Accent highlights the sandbox agent.
 */
export function MediaryScoutDiagram() {
  return (
    <AnimatedDiagram title="Mediary Scout — acquisition flow">
      <svg
        viewBox="0 0 800 360"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", maxWidth: "100%" }}
      >
        <rect x="0" y="0" width="800" height="360" fill="var(--surface-1)" rx="4" />

        <text
          x="400"
          y="30"
          textAnchor="middle"
          style={{ fontFamily: mono, fontSize: "12px", fontWeight: 600, fill: "var(--accent)", letterSpacing: "0.05em" }}
        >
          Mediary Scout — acquisition flow
        </text>

        {/* Row 1 */}
        <Node x={30} y={70} label="Request" sub="acquisition order" />
        <Node x={225} y={70} label="Queue" sub="Postgres" />
        <Node x={420} y={70} label="Worker" sub="dequeue / lease" />
        <Node x={615} y={70} label="Sandbox agent" sub="isolated runtime" accent />

        {/* Row 2 */}
        <Node x={615} y={230} label="Search" sub="locate source" />
        <Node x={420} y={230} label="Transfer" sub="cloud drive" />
        <Node x={225} y={230} label="Verify" sub="re-read" />
        <Node x={30} y={230} label="Notify" sub="report out" />

        {/* Arrows row 1 (left to right) */}
        <path data-flow d="M180 99 L225 99" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="225,99 219,95 219,103" fill="var(--ink)" />

        <path data-flow d="M375 99 L420 99" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="420,99 414,95 414,103" fill="var(--ink)" />

        <path data-flow d="M570 99 L615 99" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="615,99 609,95 609,103" fill="var(--ink)" />

        {/* Wrap: sandbox agent (row 1) down to search (row 2) */}
        <path data-flow d="M690 128 L690 230" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <polygon points="690,230 686,224 694,224" fill="var(--accent)" />

        {/* Arrows row 2 (right to left) */}
        <path data-flow d="M615 259 L570 259" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="570,259 576,255 576,263" fill="var(--ink)" />

        <path data-flow d="M420 259 L375 259" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="375,259 381,255 381,263" fill="var(--ink)" />

        <path data-flow d="M225 259 L180 259" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="180,259 186,255 186,263" fill="var(--ink)" />
      </svg>
    </AnimatedDiagram>
  );
}
