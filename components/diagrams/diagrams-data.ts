/**
 * Node/edge specs for the four architecture flow diagrams. Coordinates are laid
 * out by hand on each diagram's viewBox (no auto-layout). One node per flow is
 * marked `accent` — the signature component that best shows the project's
 * engineering craft. Content mirrors the real systems; the two private projects
 * describe only system shape (no brand/subject), per the anonymization rules.
 */

export type FlowNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  accent?: boolean;
};

export type FlowEdge = { from: string; to: string; dashed?: boolean };

export type FlowSpec = {
  title: string;
  viewBox: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export const DIAGRAMS: Record<string, FlowSpec> = {
  "mediary-scout": {
    title: "mediary scout · acquisition flow",
    viewBox: "0 0 800 520",
    nodes: [
      { id: "request", label: "Request", sub: "acquisition order", x: 40, y: 140 },
      { id: "queue", label: "Queue", sub: "postgres", x: 235, y: 140 },
      { id: "worker", label: "Worker", sub: "dequeue · lease", x: 430, y: 140 },
      { id: "sandbox", label: "Sandbox agent", sub: "isolated runtime", x: 610, y: 140, accent: true },
      { id: "search", label: "Search", sub: "locate source", x: 610, y: 330 },
      { id: "transfer", label: "Transfer", sub: "cloud drive", x: 430, y: 330 },
      { id: "verify", label: "Verify", sub: "re-read", x: 235, y: 330 },
      { id: "notify", label: "Notify", sub: "report out", x: 40, y: 330 },
    ],
    edges: [
      { from: "request", to: "queue" },
      { from: "queue", to: "worker" },
      { from: "worker", to: "sandbox" },
      { from: "sandbox", to: "search" },
      { from: "search", to: "transfer" },
      { from: "transfer", to: "verify" },
      { from: "verify", to: "notify" },
    ],
  },

  "adk-agent": {
    title: "adk-agent system",
    viewBox: "0 0 800 520",
    nodes: [
      { id: "recruiter", label: "Recruiter Browser", sub: "chat · upload", x: 60, y: 40, w: 170 },
      { id: "frontend", label: "Next.js Frontend", sub: "assistant-ui", x: 315, y: 40, w: 170 },
      { id: "gateway", label: "FastAPI Gateway", sub: "auth · limits · files", x: 570, y: 40, w: 170, accent: true },
      { id: "adk", label: "ADK Root Agent", sub: "reasoning layer", x: 315, y: 175, w: 170 },
      { id: "profile", label: "Profile + Resume", sub: "candidate facts", x: 30, y: 300, w: 175 },
      { id: "gitnexus", label: "GitNexus + MCP", sub: "repo evidence", x: 215, y: 300, w: 175 },
      { id: "doctools", label: "Document Tools", sub: "PDF · vision", x: 400, y: 300, w: 175 },
      { id: "skills", label: "Skill Toolsets", sub: "recruit · strategy", x: 585, y: 300, w: 175 },
      { id: "state", label: "Business State", sub: "sessions · quotas", x: 215, y: 430, w: 175 },
      { id: "replay", label: "Stream Replay", sub: "recovery", x: 410, y: 430, w: 175 },
    ],
    edges: [
      { from: "recruiter", to: "frontend" },
      { from: "frontend", to: "gateway" },
      { from: "gateway", to: "adk" },
      { from: "adk", to: "profile" },
      { from: "adk", to: "gitnexus" },
      { from: "adk", to: "doctools" },
      { from: "adk", to: "skills" },
      { from: "gateway", to: "state", dashed: true },
      { from: "gateway", to: "replay", dashed: true },
    ],
  },

  "enterprise-workflow": {
    title: "enterprise workflow · unattended pipeline",
    viewBox: "0 0 800 360",
    nodes: [
      { id: "poll", label: "Mailbox Poll", sub: "step 1", x: 20, y: 70, w: 140 },
      { id: "detail", label: "Detail Fetch", sub: "step 2", x: 180, y: 70, w: 140 },
      { id: "attachment", label: "Attachment Fetch", sub: "step 2.5", x: 340, y: 70, w: 140 },
      { id: "review", label: "AI Review", sub: "step 3", x: 500, y: 70, w: 140, accent: true },
      { id: "notify", label: "Notify", sub: "step 4", x: 660, y: 70, w: 130 },
      { id: "discarded", label: "Discarded", sub: "no match", x: 180, y: 210, w: 140 },
      { id: "nosuggest", label: "No Suggestions", sub: "skip", x: 500, y: 210, w: 140 },
    ],
    edges: [
      { from: "poll", to: "detail" },
      { from: "detail", to: "attachment" },
      { from: "attachment", to: "review" },
      { from: "review", to: "notify" },
      { from: "detail", to: "discarded", dashed: true },
      { from: "review", to: "nosuggest", dashed: true },
    ],
  },

  "content-pipeline": {
    title: "content pipeline · generate & distribute",
    viewBox: "0 0 800 520",
    nodes: [
      { id: "inventory", label: "Inventory Scan", sub: "sources", x: 20, y: 50, w: 165 },
      { id: "direction", label: "Direction Select", sub: "topic", x: 215, y: 50, w: 165 },
      { id: "writer", label: "Writing Subagent", sub: "draft", x: 410, y: 50, w: 165, accent: true },
      { id: "contentqa", label: "Content QA", sub: "gate", x: 605, y: 50, w: 165 },
      { id: "ledger", label: "Ledger Update", sub: "state", x: 605, y: 235, w: 165 },
      { id: "dist", label: "Distribution Subagent", sub: "format", x: 410, y: 235, w: 165 },
      { id: "distqa", label: "Distribution QA", sub: "gate", x: 215, y: 235, w: 165 },
      { id: "hero", label: "Hero Generation", sub: "image", x: 20, y: 235, w: 165 },
      { id: "finalverify", label: "Final Verification", sub: "gate", x: 20, y: 420, w: 165 },
      { id: "social", label: "Social scheduler", sub: "queue", x: 215, y: 420, w: 165 },
      { id: "indexnow", label: "IndexNow Submit", sub: "ping", x: 410, y: 420, w: 165 },
    ],
    edges: [
      { from: "inventory", to: "direction" },
      { from: "direction", to: "writer" },
      { from: "writer", to: "contentqa" },
      { from: "contentqa", to: "ledger" },
      { from: "ledger", to: "dist" },
      { from: "dist", to: "distqa" },
      { from: "distqa", to: "hero" },
      { from: "hero", to: "finalverify" },
      { from: "finalverify", to: "social" },
      { from: "social", to: "indexnow" },
    ],
  },
};
