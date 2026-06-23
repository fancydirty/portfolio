import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";

const mono = "var(--font-mono), ui-monospace, monospace";

/**
 * Anonymized enterprise email-processing workflow. Labels kept generic:
 * poll -> fetch -> attachment check -> AI review -> notify.
 */
export function EnterpriseFlowDiagram() {
  return (
    <AnimatedDiagram title="private enterprise workflow">
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
          private enterprise workflow
        </text>

        {/* Nodes */}

        {/* Step 1: Mailbox Poll */}
        <rect x="70" y="60" width="140" height="44" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="140" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Mailbox Poll</text>
        <text x="140" y="94" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>Step 1</text>

        {/* Step 2: Detail Fetch */}
        <rect x="260" y="60" width="140" height="44" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="330" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Detail Fetch</text>
        <text x="330" y="94" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>Step 2</text>

        {/* Decision: Has Attachment? */}
        <polygon points="475,60 525,82 475,104 425,82" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="2" />
        <text x="475" y="79" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 500, fill: "var(--ink)" }}>Has</text>
        <text x="475" y="91" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 500, fill: "var(--ink)" }}>Attachment?</text>

        {/* Discarded (no) */}
        <rect x="410" y="150" width="130" height="36" rx="8" fill="var(--surface-1)" stroke="var(--ink)" strokeWidth="1.5" />
        <text x="475" y="172" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Discarded</text>

        {/* Step 2.5: Attachment Fetch */}
        <rect x="590" y="60" width="150" height="44" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="665" y="80" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Attachment Fetch</text>
        <text x="665" y="94" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>Step 2.5</text>

        {/* Step 3: AI Review */}
        <rect x="330" y="240" width="140" height="44" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="400" y="260" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>AI Review</text>
        <text x="400" y="274" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>Step 3</text>

        {/* Decision: Has Suggestions? */}
        <polygon points="400,340 450,362 400,384 350,362" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="2" />
        <text x="400" y="359" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 500, fill: "var(--ink)" }}>Has</text>
        <text x="400" y="371" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fontWeight: 500, fill: "var(--ink)" }}>Suggestions?</text>

        {/* No Suggestions */}
        <rect x="520" y="344" width="130" height="36" rx="8" fill="var(--surface-1)" stroke="var(--ink)" strokeWidth="1.5" />
        <text x="585" y="366" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>No Suggestions</text>

        {/* Step 4: Notify */}
        <rect x="330" y="430" width="140" height="44" rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="400" y="450" textAnchor="middle" style={{ fontFamily: mono, fontSize: "10px", fontWeight: 500, fill: "var(--ink)" }}>Notify</text>
        <text x="400" y="464" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>Step 4</text>

        {/* End marker (hidden) */}
        <rect x="330" y="430" width="140" height="44" rx="20" fill="var(--surface-1)" stroke="var(--ink)" strokeWidth="2" style={{ display: "none" }} />

        {/* Arrows */}

        {/* 1 -> 2 */}
        <path data-flow d="M210 82 L260 82" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="260,82 254,78 254,86" fill="var(--ink)" />

        {/* 2 -> decision */}
        <path data-flow d="M400 82 L425 82" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="425,82 419,78 419,86" fill="var(--ink)" />

        {/* decision yes -> 2.5 */}
        <path data-flow d="M525 82 L590 82" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="590,82 584,78 584,86" fill="var(--ink)" />
        <text x="558" y="76" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>yes</text>

        {/* decision no -> discarded */}
        <path data-flow d="M475 104 L475 150" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="475,150 471,144 479,144" fill="var(--ink)" />
        <text x="485" y="130" textAnchor="start" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>no</text>

        {/* 2.5 -> 3 (down and left) */}
        <path data-flow d="M665 104 L665 180 L400 180 L400 240" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="400,240 396,234 404,234" fill="var(--ink)" />

        {/* 3 -> decision */}
        <path data-flow d="M400 284 L400 340" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="400,340 396,334 404,334" fill="var(--ink)" />

        {/* decision yes -> notify */}
        <path data-flow d="M400 384 L400 430" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="400,430 396,424 404,424" fill="var(--ink)" />
        <text x="412" y="410" textAnchor="start" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>yes</text>

        {/* decision no -> no suggestions */}
        <path data-flow d="M450 362 L520 362" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <polygon points="520,362 514,358 514,366" fill="var(--ink)" />
        <text x="485" y="354" textAnchor="middle" style={{ fontFamily: mono, fontSize: "9px", fill: "var(--accent)" }}>no</text>
      </svg>
    </AnimatedDiagram>
  );
}
