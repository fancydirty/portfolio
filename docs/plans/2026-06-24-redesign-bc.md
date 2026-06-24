# B (chat recognizability) + C (flow-diagram redesign) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the agent panel unmistakably read as a live chat (B), and replace the 4 ported hand-drawn SVG diagrams with a data-driven `FlowDiagram` primitive that has refined nodes and Framer-motion flow (C).

**Architecture:** B restyles `agent-thread.tsx` (assistant-ui primitives stay) into a fixed-height box-in-box with a live header, left/right bubbles, and preset chips. C adds a `FlowDiagram` client primitive driven by `diagrams-data.ts` node/edge specs, animated with `motion` (staggered `whileInView` entrance + a looping accent pulse per edge), retiring the CSS-stroke `AnimatedDiagram`.

**Tech Stack:** Next.js 16, React 19, TS strict, `@assistant-ui/react`, `motion` (Framer Motion) 12.41, Vitest, Playwright.

**Spec:** `docs/specs/2026-06-24-acceptance-redesign-bc.md`

**Site tokens (inline hex when SVG needs literal colors):** canvas `#0a0a0b`, surface-1 `#141416`, surface-2 `#1a1a1d`, hairline `#232327`, ink `#ededed`, ink-muted `#a0a0a6`, ink-subtle `#6c6c72`, accent `#e0a878`. In Tailwind classes prefer the tokens (`bg-surface-2`, `border-hairline`, `text-ink`, `text-accent`). User-bubble accent tint: bg `#3a2a18`, border `#5a4127`, text `#f0d9bf` (dark mode).

---

## File Structure

| File | Responsibility |
|---|---|
| `components/agent/agent-thread.tsx` | (modify) box-in-box chat: live header, left/right bubbles, preset chips, fixed height. |
| `components/diagrams/flow-diagram.tsx` | (create) data-driven animated SVG primitive: nodes + edges + motion. Client. |
| `components/diagrams/diagrams-data.ts` | (create) node/edge/viewBox specs for the 4 diagrams. |
| `components/diagrams/registry.tsx` | (modify) render `<FlowDiagram spec={...}/>` from data. |
| `components/diagrams/{adk-agent,mediary-scout,enterprise-flow,content-pipeline}-diagram.tsx` | (delete) replaced by data. |
| `components/diagrams/animated-diagram.tsx` | (delete) motion now lives in FlowDiagram. |
| `tests/unit/flow-diagram.test.tsx` | (create) renders nodes/edges, accent marker, reduced-motion. |
| `tests/unit/diagrams-data.test.ts` | (create) data integrity: unique ids, edge endpoints exist, 4 specs present. |

---

## PART B — Chat recognizability

### Task B1: Box-in-box chat with live header, bubbles, chips

**Files:**
- Modify: `components/agent/agent-thread.tsx`

- [ ] **Step 1: Rewrite AgentThread**

Replace the component body with the structure below. Keep imports (`ComposerPrimitive`, `MessagePrimitive`, `ThreadPrimitive`, `Dictionary`, `MarkdownText`). The `.agent-md` markdown class stays on the assistant text.

```tsx
export function AgentThread({ dict }: { dict: Dictionary }) {
  return (
    <ThreadPrimitive.Root className="flex h-[460px] flex-col overflow-hidden rounded-xl border border-hairline bg-surface-1">
      {/* live header — the at-a-glance "this is a chat" signal */}
      <div className="flex items-center gap-2 border-b border-hairline bg-surface-2 px-4 py-3">
        <span className="agent-live-dot h-2 w-2 rounded-full bg-[#5DCAA5]" />
        <span className="font-mono text-xs text-ink">adk-agent</span>
        <span className="rounded border border-[#0F6E56] px-1.5 py-px font-mono text-[10px] tracking-wider text-[#5DCAA5]">
          LIVE
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-subtle">
          {dict.agent.headerNote}
        </span>
      </div>

      <ThreadPrimitive.Viewport className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <ThreadPrimitive.Empty>
          <div className="max-w-[85%] self-start rounded-xl rounded-bl-[3px] border border-hairline bg-surface-2 px-3.5 py-2.5 leading-relaxed text-ink-muted">
            {dict.agent.intro}
          </div>
          <div className="mt-2">
            <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-ink-subtle">
              {dict.agent.tryAsking}
            </p>
            <div className="flex flex-wrap gap-2">
              {dict.agent.presets.map((q) => (
                <ThreadPrimitive.Suggestion
                  key={q}
                  prompt={q}
                  send
                  className="rounded-full border border-hairline bg-surface-1 px-3 py-1.5 text-left text-[13px] text-ink-muted transition-colors hover:border-accent hover:text-ink"
                >
                  {q}
                </ThreadPrimitive.Suggestion>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="max-w-[82%] self-end whitespace-pre-wrap rounded-xl rounded-br-[3px] border border-[#5a4127] bg-[#3a2a18] px-3.5 py-2.5 text-[#f0d9bf]">
                <MessagePrimitive.Parts />
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="max-w-[88%] self-start rounded-xl rounded-bl-[3px] border border-hairline bg-surface-2 px-3.5 py-2.5 text-ink-muted">
                <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="flex items-end gap-2 border-t border-hairline bg-surface-2 px-3 py-2.5">
        <ComposerPrimitive.Input
          rows={1}
          placeholder={dict.agent.inputPlaceholder}
          className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 text-ink outline-none placeholder:text-ink-subtle"
        />
        <ComposerPrimitive.Send
          aria-label={dict.agent.sendLabel}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
```

- [ ] **Step 2: Add the live-dot pulse to `app/globals.css`**

Append (reduced-motion already globally disables animations via the existing media query):

```css
.agent-live-dot { box-shadow: 0 0 0 0 rgba(93, 202, 165, 0.5); animation: agent-pulse 2s infinite; }
@keyframes agent-pulse {
  0% { box-shadow: 0 0 0 0 rgba(93, 202, 165, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(93, 202, 165, 0); }
  100% { box-shadow: 0 0 0 0 rgba(93, 202, 165, 0); }
}
```

- [ ] **Step 3: Add the new dict keys (`headerNote`, `tryAsking`) to en + zh**

In `lib/i18n/dictionaries/en.ts` `agent:` add `headerNote: "my representative",` and `tryAsking: "TRY ASKING",`. In `zh.ts` add `headerNote: "我的代表",` and `tryAsking: "试着问",`. (Remove now-unused `userRole`/`assistantRole`? Keep them — harmless — to avoid touching the deep-key i18n test; OR remove from both + the thread. Decision: keep them, the bubble layout no longer renders them but they stay in the dict.)

- [ ] **Step 4: Typecheck + unit + lint**

Run: `npx tsc --noEmit && npx vitest run tests/unit/i18n.test.ts tests/unit/agent-section.test.tsx && npx eslint components/agent app/globals.css`
Expected: PASS (i18n deep-key test still green since en/zh both got the 2 new keys).

- [ ] **Step 5: Commit**

```bash
git add components/agent/agent-thread.tsx app/globals.css lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/zh.ts
git commit -m "feat(agent): recognizable chat — live header, left/right bubbles, preset chips, fixed height"
```

---

## PART C — Flow diagram redesign

### Task C1: `diagrams-data.ts` — node/edge specs for the 4 diagrams

**Files:**
- Create: `components/diagrams/diagrams-data.ts`
- Test: `tests/unit/diagrams-data.test.ts`

Node coordinates are on each diagram's existing viewBox (mostly `0 0 800 520`; enterprise `0 0 800 360`). Place nodes on a grid; `w`/`h` default 150×54. `accent:true` marks the one signature node. Edges reference node ids; `dashed` for secondary/recovery links. Content is faithful to the current diagrams (see spec §C). Redline-safe: private projects describe only system shape.

- [ ] **Step 1: Write the data-integrity test**

```tsx
import { describe, expect, it } from "vitest";
import { DIAGRAMS } from "@/components/diagrams/diagrams-data";

describe("DIAGRAMS data", () => {
  it("has the 4 expected specs", () => {
    expect(Object.keys(DIAGRAMS).sort()).toEqual(
      ["adk-agent", "content-pipeline", "enterprise-workflow", "mediary-scout"].sort(),
    );
  });
  it("each spec has unique node ids and edges that reference existing nodes", () => {
    for (const [id, spec] of Object.entries(DIAGRAMS)) {
      const ids = spec.nodes.map((n) => n.id);
      expect(new Set(ids).size, `${id} unique ids`).toBe(ids.length);
      for (const e of spec.edges) {
        expect(ids, `${id} edge.from ${e.from}`).toContain(e.from);
        expect(ids, `${id} edge.to ${e.to}`).toContain(e.to);
      }
    }
  });
  it("each spec marks exactly one accent (signature) node", () => {
    for (const [id, spec] of Object.entries(DIAGRAMS)) {
      expect(spec.nodes.filter((n) => n.accent).length, `${id} accent count`).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Run → fail (module missing).**

Run: `npx vitest run tests/unit/diagrams-data.test.ts` → FAIL.

- [ ] **Step 3: Implement `diagrams-data.ts`**

Define the types and the 4 specs. Use the node content extracted from the current diagrams (faithful). Coordinates: lay nodes left→right / top→bottom on the viewBox grid (compute during implementation; keep ≥24px gaps). Signature nodes: mediary-scout=`sandbox` (Sandbox agent), adk-agent=`gateway` (FastAPI Gateway), enterprise-workflow=`review` (AI Review), content-pipeline=`writer` (Writing Subagent).

```ts
export type FlowNode = {
  id: string; label: string; sub?: string;
  x: number; y: number; w?: number; h?: number; accent?: boolean;
};
export type FlowEdge = { from: string; to: string; dashed?: boolean };
export type FlowSpec = {
  title: string; viewBox: string; nodes: FlowNode[]; edges: FlowEdge[];
};

export const DIAGRAMS: Record<string, FlowSpec> = {
  "mediary-scout": { title: "mediary scout · acquisition flow", viewBox: "0 0 800 520",
    nodes: [ /* Request, Queue, Worker, Sandbox agent(accent); Notify, Verify, Transfer, Search */ ],
    edges: [ /* request→queue→worker→sandbox→search→transfer→verify→notify */ ] },
  "adk-agent": { title: "adk-agent system", viewBox: "0 0 800 520",
    nodes: [ /* Recruiter Browser, Next.js Frontend, FastAPI Gateway(accent), ADK Root Agent, Profile+Resume, GitNexus+MCP, Document Tools, Skill Toolsets, Business State, Stream Replay */ ],
    edges: [ /* browser→frontend→gateway→adk; adk→tools×4; gateway↔state/replay(dashed) */ ] },
  "enterprise-workflow": { title: "enterprise workflow · unattended pipeline", viewBox: "0 0 800 360",
    nodes: [ /* Mailbox Poll, Detail Fetch, Attachment Fetch, AI Review(accent), Notify; Discarded, No Suggestions(dashed terminals) */ ],
    edges: [ /* poll→detail→attachment→review→notify; detail→discarded(dashed); review→nosuggest(dashed) */ ] },
  "content-pipeline": { title: "content pipeline · generate & distribute", viewBox: "0 0 800 520",
    nodes: [ /* Inventory Scan, Direction Select, Writing Subagent(accent), Content QA, Ledger Update, Distribution Subagent, Distribution QA, Hero Generation, Final Verification, Social scheduler, IndexNow Submit */ ],
    edges: [ /* linear with the QA gates */ ] },
};
```

Fill the `nodes`/`edges` arrays fully with coordinates + subs during implementation (no placeholders in the committed file).

- [ ] **Step 4: Run → pass.** `npx vitest run tests/unit/diagrams-data.test.ts` → PASS.

- [ ] **Step 5: Commit** `git add components/diagrams/diagrams-data.ts tests/unit/diagrams-data.test.ts && git commit -m "feat(diagrams): node/edge data for the 4 architecture flows"`

### Task C2: `FlowDiagram` primitive (render + motion)

**Files:**
- Create: `components/diagrams/flow-diagram.tsx`
- Test: `tests/unit/flow-diagram.test.tsx`

- [ ] **Step 1: Write the render test**

```tsx
import { afterEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlowDiagram } from "@/components/diagrams/flow-diagram";

const spec = {
  title: "demo flow", viewBox: "0 0 400 120",
  nodes: [
    { id: "a", label: "Alpha", sub: "start", x: 20, y: 40 },
    { id: "b", label: "Beta", sub: "end", x: 220, y: 40, accent: true },
  ],
  edges: [{ from: "a", to: "b" }],
};

afterEach(() => vi.restoreAllMocks());

test("renders a node card per node and an edge per edge", () => {
  render(<FlowDiagram spec={spec} />);
  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.getByText("Beta")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /demo flow/i })).toBeInTheDocument();
  // one connector path + one pulse circle per edge
  const root = screen.getByRole("img", { name: /demo flow/i });
  expect(root.querySelectorAll("[data-edge]").length).toBe(1);
});

test("flags the accent (signature) node", () => {
  render(<FlowDiagram spec={spec} />);
  const root = screen.getByRole("img", { name: /demo flow/i });
  expect(root.querySelectorAll("[data-accent='true']").length).toBe(1);
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement `FlowDiagram`**

`"use client"`. Render an `<svg role="img" aria-label={title}>` with surface-1 bg. For each edge: a hairline `<line data-edge>` (or path) between node centers + an accent `<circle>` pulse animated along it. For each node: a `<g data-accent={String(!!n.accent)}>` with a `<rect>` (surface-2 / accent border when accent) + mono `<text>` label + optional sub.

Motion: import `motion`, `useReducedMotion` from `motion/react`. Wrap node groups in `motion.g` with `initial={{opacity:0, y:8}}`, `whileInView={{opacity:1, y:0}}`, `viewport={{once:true, amount:0.3}}`, and `transition={{delay: index * 0.08}}` for the staggered flow entrance. For the pulse: a `motion.circle` animated along the edge by interpolating `cx`/`cy` from source→target with `transition={{duration: 2.4, repeat: Infinity, ease: "linear", delay}}` (or animate `offsetDistance` with `offsetPath`). When `useReducedMotion()` is true: render nodes statically (no initial offset) and omit the pulse circles.

Key implementation notes:
- Node center = `(x + w/2, y + h/2)`, default `w=150,h=54`.
- Edge endpoints: from source node's right/bottom edge to target's left/top — for v1 connect centers and let the node rect sit on top (clip is fine), or trim to node borders. Connect right-center→left-center for horizontal neighbors; center→center otherwise.
- `data-edge` on each edge line; `data-accent` on each node group; literal token hex for SVG fills (`#1a1a1d`, `#232327`, `#e0a878`, `#ededed`, `#a0a0a6`, `#6c6c72`). Accent node: fill `#241a0e`, stroke `#e0a878`, label fill `#e0a878`.

- [ ] **Step 4: Run → pass.** Also `npx tsc --noEmit`.

- [ ] **Step 5: Commit** `git add components/diagrams/flow-diagram.tsx tests/unit/flow-diagram.test.tsx && git commit -m "feat(diagrams): FlowDiagram primitive — refined nodes + motion pulse flow"`

### Task C3: Wire registry to data; delete old diagrams

**Files:**
- Modify: `components/diagrams/registry.tsx`
- Delete: 4 `*-diagram.tsx` + `animated-diagram.tsx`

- [ ] **Step 1: Rewrite `registry.tsx`**

```tsx
import { FlowDiagram } from "@/components/diagrams/flow-diagram";
import { DIAGRAMS } from "@/components/diagrams/diagrams-data";

export function diagramFor(id: string): React.ReactNode | null {
  const spec = DIAGRAMS[id];
  return spec ? <FlowDiagram spec={spec} /> : null;
}
```

- [ ] **Step 2: Delete the obsolete files**

```bash
git rm components/diagrams/adk-agent-diagram.tsx components/diagrams/mediary-scout-diagram.tsx components/diagrams/enterprise-flow-diagram.tsx components/diagrams/content-pipeline-diagram.tsx components/diagrams/animated-diagram.tsx
```

- [ ] **Step 3: Handle the orphaned diagram test**

`tests/unit/diagrams.test.tsx` referenced the old components. Rewrite it to assert `diagramFor(id)` returns a node for each known id and `null` for unknown, OR delete it if `flow-diagram.test.tsx` + `diagrams-data.test.ts` cover it. Decision: replace its body with a `diagramFor` smoke test.

- [ ] **Step 4: Typecheck + full unit + build**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: PASS; no dangling imports to deleted files. Grep guard: `grep -rn "animated-diagram\|adk-agent-diagram\|mediary-scout-diagram" components app` → only matches inside diagrams-data/flow-diagram if any (should be none referencing deleted modules).

- [ ] **Step 5: Commit** `git add -A components/diagrams tests/unit/diagrams.test.tsx && git commit -m "refactor(diagrams): render the 4 flows from data via FlowDiagram; retire hand-drawn SVGs"`

---

## Verify + ship (both parts)

- [ ] **Step V1:** Full gates: `npx tsc --noEmit && npx vitest run && npx eslint app components lib && npm run build && npm run test:e2e` (kill port 3000 first). All green.
- [ ] **Step V2:** `npm run dev`; with the Chrome MCP browser verify on localhost: (B) detail page chat reads as a chat — live header, left/right bubbles, chips, fixed height, internal scroll, send icon; sending a preset streams a styled reply. (C) each of the 4 case studies shows the redesigned diagram with staggered entrance + flowing pulse; reduced-motion (emulate) → static; DiagramZoom lightbox still works on the new diagrams.
- [ ] **Step V3:** Push `master`; poll the Vercel deploy to READY; verify `portfolio.dirtyfancy.sbs` serves the new chat + diagrams.

---

## Self-Review

**Spec coverage:** B live-header/bubbles/chips/fixed-height/send-icon → B1. C FlowDiagram primitive → C2; data-driven 4 diagrams → C1; registry swap + retire AnimatedDiagram → C3; motion (stagger + pulse) + reduced-motion → C2; DiagramZoom coexists → V2. ✓

**Placeholder scan:** C1 Step 3 leaves the node/edge arrays to fill at implementation (coordinates are visual work) — the committed file must be complete (no `/* ... */`); the structure, types, ids, accent nodes, and content are all specified. Everything else carries full code.

**Type consistency:** `FlowSpec{title,viewBox,nodes,edges}`, `FlowNode{id,label,sub?,x,y,w?,h?,accent?}`, `FlowEdge{from,to,dashed?}`, `DIAGRAMS: Record<string,FlowSpec>`, `diagramFor(id)`, `<FlowDiagram spec={...}/>` — consistent across C1/C2/C3. Dict keys `headerNote`/`tryAsking` added in B1 Step 3 and consumed in B1 Step 1.
