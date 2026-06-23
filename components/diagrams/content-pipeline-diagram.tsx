import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";

const mono = "'JetBrains Mono', monospace";

/**
 * Anonymized content pipeline: inventory -> direction -> writing -> QA ->
 * distribution -> hero -> verify -> schedule -> index.
 */
export function ContentPipelineDiagram() {
  return (
    <AnimatedDiagram title="private content pipeline">
      <svg
        viewBox="0 0 800 520"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", maxWidth: "100%" }}
      >
        <rect x="0" y="0" width="800" height="520" fill="var(--surface-1)" rx="4" />

        <text
          x="400"
          y="28"
          textAnchor="middle"
          style={{ fontFamily: mono, fontSize: "12px", fontWeight: 600, fill: "var(--accent)", letterSpacing: "0.05em" }}
        >
          private content pipeline
        </text>

        {/* Nodes */}

        {/* Inventory Scan */}
        <rect x="60" y="55" width="120" height="40" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="120" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Inventory Scan</text>

        {/* Direction Selection */}
        <rect x="220" y="55" width="130" height="40" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="285" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Direction Select</text>

        {/* Writing Subagent */}
        <rect x="390" y="55" width="130" height="40" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="455" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Writing Subagent</text>

        {/* Content QA */}
        <rect x="560" y="55" width="100" height="40" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="610" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Content QA</text>

        {/* Acceptance */}
        <rect x="700" y="55" width="90" height="40" rx="20" fill="var(--surface-1)" stroke="var(--ink)" strokeWidth="2" />
        <text x="745" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Accept</text>

        {/* Ledger Update */}
        <rect x="220" y="150" width="130" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="285" y="172" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Ledger Update</text>

        {/* Distribution Subagent */}
        <rect x="390" y="150" width="150" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="465" y="172" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Distribution Subagent</text>

        {/* Distribution QA */}
        <rect x="575" y="150" width="120" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="635" y="172" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Distribution QA</text>

        {/* Hero Generation */}
        <rect x="60" y="240" width="130" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="125" y="262" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Hero Generation</text>

        {/* Final Verification */}
        <rect x="240" y="240" width="130" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="305" y="262" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Final Verification</text>

        {/* Social scheduler */}
        <rect x="420" y="240" width="120" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="480" y="262" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Social scheduler</text>

        {/* IndexNow Submit */}
        <rect x="580" y="240" width="120" height="36" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="640" y="262" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>IndexNow Submit</text>

        {/* Arrows */}

        {/* Inventory -> Direction */}
        <path data-flow d="M180 75 L220 75" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="220,75 214,71 214,79" fill="var(--ink)" />

        {/* Direction -> Writing */}
        <path data-flow d="M350 75 L390 75" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="390,75 384,71 384,79" fill="var(--ink)" />

        {/* Writing -> Content QA */}
        <path data-flow d="M520 75 L560 75" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="560,75 554,71 554,79" fill="var(--ink)" />

        {/* Content QA -> Acceptance */}
        <path data-flow d="M660 75 L700 75" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="700,75 694,71 694,79" fill="var(--ink)" />

        {/* Acceptance down to middle row */}
        <path data-flow d="M745 95 L745 125 L465 125 L465 150" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="465,150 461,144 469,144" fill="var(--ink)" />

        {/* Ledger Update -> Distribution */}
        <path data-flow d="M350 168 L390 168" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="390,168 384,164 384,172" fill="var(--ink)" />

        {/* Distribution -> Distribution QA */}
        <path data-flow d="M540 168 L575 168" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="575,168 569,164 569,172" fill="var(--ink)" />

        {/* Distribution QA down to bottom row */}
        <path data-flow d="M635 186 L635 215 L480 215 L480 240" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="480,240 476,234 484,234" fill="var(--ink)" />

        {/* Hero Generation -> Final Verification */}
        <path data-flow d="M190 258 L240 258" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="240,258 234,254 234,262" fill="var(--ink)" />

        {/* Final Verification -> Social scheduler */}
        <path data-flow d="M370 258 L420 258" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="420,258 414,254 414,262" fill="var(--ink)" />

        {/* Social scheduler -> IndexNow */}
        <path data-flow d="M540 258 L580 258" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="580,258 574,254 574,262" fill="var(--ink)" />
      </svg>
    </AnimatedDiagram>
  );
}
