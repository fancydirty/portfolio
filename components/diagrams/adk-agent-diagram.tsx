import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";

const mono = "'JetBrains Mono', monospace";

/**
 * adk-agent system architecture (public, owned project).
 * Colors mapped to theme tokens so it reads on both dark and light canvases.
 */
export function AdkAgentDiagram() {
  return (
    <AnimatedDiagram title="adk-agent system">
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
          style={{
            fontFamily: mono,
            fontSize: "12px",
            fontWeight: 600,
            fill: "var(--accent)",
            letterSpacing: "0.05em",
          }}
        >
          adk-agent system
        </text>

        {/* Recruiter Browser */}
        <rect x="55" y="70" width="160" height="54" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="135" y="92" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 600, fill: "var(--ink)" }}>Recruiter Browser</text>
        <text x="135" y="108" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>chat / upload / resume</text>

        {/* Next.js Frontend */}
        <rect x="300" y="70" width="170" height="54" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="385" y="92" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 600, fill: "var(--ink)" }}>Next.js Frontend</text>
        <text x="385" y="108" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>assistant-ui surface</text>

        {/* FastAPI Gateway */}
        <rect x="585" y="70" width="160" height="54" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="665" y="92" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 600, fill: "var(--ink)" }}>FastAPI Gateway</text>
        <text x="665" y="108" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>auth / limits / files</text>

        {/* ADK Root Agent */}
        <rect x="300" y="185" width="200" height="64" rx="12" fill="var(--surface-1)" stroke="var(--ink)" strokeWidth="2" />
        <text x="400" y="210" textAnchor="middle" style={{ fontFamily: mono, fontSize: "11px", fontWeight: 600, fill: "var(--ink)" }}>ADK Root Agent</text>
        <text x="400" y="228" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>representative reasoning layer</text>

        {/* Tool boxes */}
        <rect x="60" y="300" width="150" height="48" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.25" />
        <text x="135" y="320" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 600, fill: "var(--ink)" }}>Profile + Resume</text>
        <text x="135" y="334" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>candidate facts</text>

        <rect x="240" y="300" width="150" height="48" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.25" />
        <text x="315" y="320" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 600, fill: "var(--ink)" }}>GitNexus + MCP</text>
        <text x="315" y="334" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>repo evidence</text>

        <rect x="420" y="300" width="150" height="48" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.25" />
        <text x="495" y="320" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 600, fill: "var(--ink)" }}>Document Tools</text>
        <text x="495" y="334" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>PDF / DOCX / vision</text>

        <rect x="600" y="300" width="150" height="48" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.25" />
        <text x="675" y="320" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 600, fill: "var(--ink)" }}>Skill Toolsets</text>
        <text x="675" y="334" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink-muted)" }}>recruit / strategy</text>

        {/* State boxes (dashed) */}
        <rect x="210" y="415" width="180" height="54" rx="10" fill="var(--surface-1)" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5,4" />
        <text x="300" y="437" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 600, fill: "var(--accent)" }}>Business State</text>
        <text x="300" y="452" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink)" }}>sessions / quotas / uploads</text>

        <rect x="430" y="415" width="180" height="54" rx="10" fill="var(--surface-1)" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5,4" />
        <text x="520" y="437" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 600, fill: "var(--accent)" }}>Stream Replay</text>
        <text x="520" y="452" textAnchor="middle" style={{ fontFamily: mono, fontSize: "8px", fill: "var(--ink)" }}>event ids / recovery</text>

        {/* Arrows */}
        <path data-flow d="M215 97 L300 97" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="300,97 294,93 294,101" fill="var(--ink)" />

        <path data-flow d="M470 97 L585 97" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="585,97 579,93 579,101" fill="var(--ink)" />

        <path data-flow d="M665 124 L665 160 L400 160 L400 185" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="400,185 396,179 404,179" fill="var(--ink)" />

        <path data-flow d="M400 249 L400 282" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="400,282 396,276 404,276" fill="var(--ink)" />

        <path data-flow d="M400 282 L135 282 L135 300" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="135,300 131,294 139,294" fill="var(--ink)" />

        <path data-flow d="M400 282 L315 282 L315 300" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="315,300 311,294 319,294" fill="var(--ink)" />

        <path data-flow d="M400 282 L495 282 L495 300" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="495,300 491,294 499,294" fill="var(--ink)" />

        <path data-flow d="M400 282 L675 282 L675 300" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="675,300 671,294 679,294" fill="var(--ink)" />

        <path data-flow d="M665 124 L665 390 L300 390 L300 415" fill="none" stroke="var(--hairline)" strokeWidth="1.4" strokeDasharray="4,3" />
        <polygon points="300,415 296,409 304,409" fill="var(--hairline)" />

        <path data-flow d="M665 124 L665 390 L520 390 L520 415" fill="none" stroke="var(--hairline)" strokeWidth="1.4" strokeDasharray="4,3" />
        <polygon points="520,415 516,409 524,409" fill="var(--hairline)" />
      </svg>
    </AnimatedDiagram>
  );
}
