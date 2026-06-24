# Chat Session Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On reload, the in-site agent chat rehydrates its visible history from the server session, and gives the user explicit "New" / "Compact" session controls.

**Architecture:** The gateway already persists session history server-side keyed by the anonymous `candidate_user_id` cookie; `GET /api/agent/me` returns `currentSession.messages`. We map those raw messages to `AdkMessage[]` and feed them to `useAdkRuntime` via its `load` callback so the thread mounts already-populated. New/Compact send a `/new` or `/compact` slash-command turn to `/api/agent/chat`, then bump a `runtimeEpoch` key on `AssistantRuntimeProvider` to remount the runtime — which re-runs `load` and refreshes the visible thread.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, `@assistant-ui/react-google-adk` (`useAdkRuntime`, `AdkMessage`), Vitest + Testing Library.

**Source spec:** `docs/specs/2026-06-24-chat-session-persistence.md`

---

## Already-verified facts (do not re-explore)

- `GET /api/agent/me` → `{ userId, anonymous, isAdmin, currentSession: { id, messages: [...], ... } }`. Each message = `{ id, role: "user" | "assistant", content: string }`. Assistant history is already cleaned to plain prose server-side (no reasoning/tool replay).
- `AdkMessage` (from `@assistant-ui/react-google-adk`) is a union; the two we emit are `{ id: string, type: "human", content: string }` and `{ id: string, type: "ai", content: string }`.
- `useAdkRuntime` accepts `load?: (threadId: string) => Promise<{ messages: AdkMessage[] }>`; it runs on runtime mount to hydrate the thread.
- Backend `POST /api/agent/chat` body `{ parts: [{ text: "/new" }] }` (or `/compact`) is parsed as a slash command: `/new` starts a fresh session, `/compact` compacts and starts a summarized session. Both swap the session, so the runtime must remount to clear + reload the thread.
- Remount pattern (from reference `chat.tsx`): `const [runtimeEpoch, setRuntimeEpoch] = useState(0)` + `<AssistantRuntimeProvider key={runtimeEpoch} runtime={runtime}>`; bumping `runtimeEpoch` rebuilds the provider subtree → re-runs `load`.
- `messagesToBody` in `gateway-adk-stream.ts` already turns the latest human turn into `{ parts: [...] }`, so a slash command flows through the normal stream too — but New/Compact use a direct one-shot POST (`session-commands.ts`) so they work regardless of thread state.
- i18n: `tests/unit/i18n.test.ts` asserts en and zh expose identical deep keys. Any new `agent.*` key MUST be added to BOTH `lib/i18n/dictionaries/en.ts` and `zh.ts`.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/agent/history.ts` (new) | Pure mapping `historyToAdkMessages(raw) → AdkMessage[]`. No I/O. |
| `lib/agent/session-commands.ts` (new) | `sendSlashCommand("/new" \| "/compact")` — one-shot POST to the chat proxy, drains the SSE body. |
| `components/agent/agent-panel.tsx` (modify) | Adds `load` to `useAdkRuntime`; owns `runtimeEpoch` state + provider `key`; passes `onNewSession`/`onCompact` to the thread. |
| `components/agent/agent-thread.tsx` (modify) | Header gains two mono New/Compact buttons wired to props. |
| `lib/i18n/dictionaries/en.ts` + `zh.ts` (modify) | Add `agent.newChat` / `agent.compact`. |
| `tests/unit/history.test.ts` (new) | Unit-tests the mapping. |
| `tests/unit/session-commands.test.ts` (new) | Unit-tests the POST body via mocked fetch. |

---

## Task 1: History mapping helper

**Files:**
- Create: `lib/agent/history.ts`
- Test: `tests/unit/history.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/history.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { historyToAdkMessages } from "@/lib/agent/history";

describe("historyToAdkMessages", () => {
  it("maps user → human and assistant → ai with prefixed ids", () => {
    const result = historyToAdkMessages([
      { id: 1, role: "user", content: "hi" },
      { id: 2, role: "assistant", content: "hello" },
    ]);
    expect(result).toEqual([
      { id: "h-1", type: "human", content: "hi" },
      { id: "h-2", type: "ai", content: "hello" },
    ]);
  });

  it("skips empty content and unknown roles", () => {
    const result = historyToAdkMessages([
      { id: 1, role: "user", content: "" },
      { id: 2, role: "system", content: "ignored" } as never,
      { id: 3, role: "assistant", content: "kept" },
    ]);
    expect(result).toEqual([{ id: "h-3", type: "ai", content: "kept" }]);
  });

  it("returns [] for non-array / nullish input", () => {
    expect(historyToAdkMessages(undefined)).toEqual([]);
    expect(historyToAdkMessages(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run tests/unit/history.test.ts`
Expected: FAIL — `Cannot find module '@/lib/agent/history'`.

- [ ] **Step 3: Implement the helper**

Create `lib/agent/history.ts`:

```ts
import type { AdkMessage } from "@assistant-ui/react-google-adk";

/** One message as returned by `GET /api/agent/me` → `currentSession.messages`. */
export type RawHistoryMessage = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
};

/**
 * Map server-side session history into the `AdkMessage[]` shape `useAdkRuntime`'s
 * `load` expects: user → `human`, assistant → `ai`. Ids are prefixed so a
 * rehydrated message never collides with a fresh in-thread one. Empty content
 * and unknown roles are dropped; non-array input yields an empty thread.
 */
export function historyToAdkMessages(messages: unknown): AdkMessage[] {
  if (!Array.isArray(messages)) return [];

  const out: AdkMessage[] = [];
  for (const raw of messages as RawHistoryMessage[]) {
    const content = typeof raw?.content === "string" ? raw.content : "";
    if (!content) continue;
    const id = `h-${raw.id}`;
    if (raw.role === "user") out.push({ id, type: "human", content });
    else if (raw.role === "assistant") out.push({ id, type: "ai", content });
  }
  return out;
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run tests/unit/history.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/agent/history.ts tests/unit/history.test.ts
git commit -m "feat(agent): historyToAdkMessages — map server session history to AdkMessage[]"
```

---

## Task 2: Slash-command sender

**Files:**
- Create: `lib/agent/session-commands.ts`
- Test: `tests/unit/session-commands.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/session-commands.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { sendSlashCommand } from "@/lib/agent/session-commands";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchOk() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    body: null,
  } as unknown as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("sendSlashCommand", () => {
  it("POSTs the command as a text part to the chat proxy", async () => {
    const fetchMock = mockFetchOk();
    await sendSlashCommand("/new");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/agent/chat");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(JSON.parse(init.body as string)).toEqual({
      parts: [{ text: "/new" }],
    });
  });

  it("sends /compact when asked", async () => {
    const fetchMock = mockFetchOk();
    await sendSlashCommand("/compact");
    const init = fetchMock.mock.calls[0][1];
    expect(JSON.parse(init.body as string)).toEqual({
      parts: [{ text: "/compact" }],
    });
  });

  it("resolves even if the request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    await expect(sendSlashCommand("/new")).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run tests/unit/session-commands.test.ts`
Expected: FAIL — `Cannot find module '@/lib/agent/session-commands'`.

- [ ] **Step 3: Implement the sender**

Create `lib/agent/session-commands.ts`:

```ts
"use client";

export type SlashCommand = "/new" | "/compact";

/**
 * Fire a session slash command (`/new` or `/compact`) at the same-origin chat
 * proxy as a one-shot turn, independent of the assistant-ui thread. The backend
 * swaps the session on receipt; the caller is expected to remount the runtime
 * afterwards so the thread reloads. The SSE body is drained and discarded —
 * we only care that the session changed, not the streamed reply. Never throws:
 * a failed command leaves the existing session intact.
 */
export async function sendSlashCommand(command: SlashCommand): Promise<void> {
  try {
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parts: [{ text: command }] }),
      credentials: "include",
    });
    await response.body?.cancel().catch(() => undefined);
  } catch {
    // Swallow — the session is unchanged and the caller stays usable.
  }
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run tests/unit/session-commands.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/agent/session-commands.ts tests/unit/session-commands.test.ts
git commit -m "feat(agent): sendSlashCommand — one-shot /new and /compact to the chat proxy"
```

---

## Task 3: Dictionary keys for New / Compact

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts` (agent slice, after `assistantRole`)
- Modify: `lib/i18n/dictionaries/zh.ts` (agent slice, after `assistantRole`)

- [ ] **Step 1: Add keys to the EN dictionary**

In `lib/i18n/dictionaries/en.ts`, inside the `agent:` object, add two keys right after the `assistantRole: "AGENT",` line:

```ts
    userRole: "YOU",
    assistantRole: "AGENT",
    newChat: "New",
    compact: "Compact",
```

- [ ] **Step 2: Add the same keys to the ZH dictionary**

In `lib/i18n/dictionaries/zh.ts`, inside the `agent:` object, after `assistantRole: "AGENT",`:

```ts
    userRole: "你",
    assistantRole: "AGENT",
    newChat: "新会话",
    compact: "压缩",
```

- [ ] **Step 3: Run the i18n parity test, verify it passes**

Run: `npx vitest run tests/unit/i18n.test.ts`
Expected: PASS — en and zh expose identical deep keys (the new keys exist in both).

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/zh.ts
git commit -m "feat(i18n): agent.newChat / agent.compact in en + zh"
```

---

## Task 4: Wire `load` + session controls into the panel

**Files:**
- Modify: `components/agent/agent-panel.tsx` (full rewrite of the component body)

This task depends on Tasks 1 and 2 (imports `historyToAdkMessages` and `sendSlashCommand`).

- [ ] **Step 1: Rewrite `agent-panel.tsx`**

Replace the entire contents of `components/agent/agent-panel.tsx` with:

```tsx
"use client";

import { useCallback, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAdkRuntime } from "@assistant-ui/react-google-adk";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { createGatewayAdkStream } from "@/lib/agent/gateway-adk-stream";
import { historyToAdkMessages } from "@/lib/agent/history";
import { sendSlashCommand, type SlashCommand } from "@/lib/agent/session-commands";
import { solveTurnstile } from "@/lib/agent/turnstile";
import { AgentThread } from "@/components/agent/agent-thread";

/**
 * Wires the ADK runtime to the same-origin proxy and provides it to the thread.
 * Mounted only after the availability probe succeeds (see AgentSection), and
 * code-split so assistant-ui never ships on the degraded path.
 *
 * `load` rehydrates the visible thread from the server session on mount, so a
 * reload no longer drops history the backend still holds. New/Compact send a
 * session slash command then bump `runtimeEpoch`, remounting the runtime so
 * `load` re-runs against the freshly-swapped session.
 */
export function AgentPanel({ dict }: { dict: Dictionary }) {
  const [runtimeEpoch, setRuntimeEpoch] = useState(0);

  const runtime = useAdkRuntime({
    stream: createGatewayAdkStream({
      api: "/api/agent/chat",
      solveChallenge: () => solveTurnstile(),
    }),
    load: async () => {
      try {
        const res = await fetch("/api/agent/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) return { messages: [] };
        const data = await res.json();
        return {
          messages: historyToAdkMessages(data?.currentSession?.messages),
        };
      } catch {
        return { messages: [] };
      }
    },
  });

  const runCommand = useCallback(async (command: SlashCommand) => {
    await sendSlashCommand(command);
    setRuntimeEpoch((epoch) => epoch + 1);
  }, []);

  return (
    <AssistantRuntimeProvider key={runtimeEpoch} runtime={runtime}>
      <AgentThread
        dict={dict}
        onNewSession={() => runCommand("/new")}
        onCompact={() => runCommand("/compact")}
      />
    </AssistantRuntimeProvider>
  );
}
```

- [ ] **Step 2: Typecheck (will fail until Task 5 adds the props)**

Run: `npx tsc --noEmit`
Expected: FAIL — `AgentThread` does not yet accept `onNewSession` / `onCompact`. This is expected; Task 5 fixes it. (If you are running Tasks 4 and 5 back-to-back, defer the commit to the end of Task 5.)

- [ ] **Step 3: Commit (after Task 5 typechecks clean)**

Hold this commit until Task 5 is done so the tree compiles. Then:

```bash
git add components/agent/agent-panel.tsx
git commit -m "feat(agent): load session history on mount; New/Compact remount the runtime"
```

---

## Task 5: New / Compact buttons in the thread header

**Files:**
- Modify: `components/agent/agent-thread.tsx` (props signature + header)

- [ ] **Step 1: Add the props to `AgentThread`'s signature**

In `components/agent/agent-thread.tsx`, change the function signature from:

```tsx
export function AgentThread({ dict }: { dict: Dictionary }) {
```

to:

```tsx
export function AgentThread({
  dict,
  onNewSession,
  onCompact,
}: {
  dict: Dictionary;
  onNewSession: () => void;
  onCompact: () => void;
}) {
```

- [ ] **Step 2: Replace the header `headerNote` span with the controls**

In the header `<div>`, the current right-aligned element is:

```tsx
        <span className="ml-auto font-mono text-[11px] text-ink-subtle">
          {dict.agent.headerNote}
        </span>
```

Replace that single span with a control group that keeps `headerNote` and adds the two buttons:

```tsx
        <span className="ml-auto font-mono text-[11px] text-ink-subtle">
          {dict.agent.headerNote}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onNewSession}
            className="rounded border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-subtle transition-colors hover:border-accent hover:text-ink"
          >
            {dict.agent.newChat}
          </button>
          <button
            type="button"
            onClick={onCompact}
            className="rounded border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-subtle transition-colors hover:border-accent hover:text-ink"
          >
            {dict.agent.compact}
          </button>
        </div>
```

Note: `ml-auto` on the `headerNote` span pushes it plus the button group to the right edge as one cluster. The global `button:not(:disabled){cursor:pointer}` base rule already gives these the right cursor.

- [ ] **Step 3: Update the existing agent-parts test imports if needed**

No change needed — `tests/unit/agent-parts.test.tsx` tests `AgentReasoning`/`AgentToolFallback`, not `AgentThread`. Skip.

- [ ] **Step 4: Typecheck the whole tree**

Run: `npx tsc --noEmit`
Expected: PASS — `AgentPanel` now passes `onNewSession`/`onCompact` and `AgentThread` accepts them.

- [ ] **Step 5: Lint**

Run: `npx eslint app components lib`
Expected: PASS (no errors).

- [ ] **Step 6: Commit (bundles Task 4 + Task 5 so the tree compiles at each commit)**

```bash
git add components/agent/agent-thread.tsx components/agent/agent-panel.tsx
git commit -m "feat(agent): New/Compact controls in chat header"
```

---

## Task 6: Full gate + deploy

**Files:** none (verification + ship)

- [ ] **Step 1: Run the full local gate**

Run:

```bash
npx tsc --noEmit && npx vitest run && npx eslint app components lib && npm run build && (lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run test:e2e)
```

Expected: tsc clean; all vitest suites pass (including the 2 new ones); eslint clean; `npm run build` succeeds; Playwright e2e all green.

- [ ] **Step 2: Push (iron rule — all code changes go through GitHub)**

```bash
git push origin master
```

- [ ] **Step 3: Confirm the Vercel deploy**

Poll the `website` project (id `prj_ZZSz0G8mlN2L2kwRkjxTnJRx00MA`, team `team_oeVWMFfwtCnrNbQ0AhE1U0ev`) for a new deployment triggered by the push. If git-push auto-deploy did not fire, trigger a Git-source deploy via the Vercel REST API (the workaround recorded in memory `portfolio-rebuild.md`). Wait for state READY.

- [ ] **Step 4: Production smoke**

`curl` the production agent page and confirm the panel SSR markup and CSS bundle are present (the chat is gated behind the availability probe, so deep behavior is verified by the author in a real browser).

- [ ] **Step 5: Hand back to the author for acceptance**

Tell the author to verify in a real browser: (a) ask the agent something, reload the page, history is still shown; (b) "New" clears the thread to an empty session; (c) "Compact" replaces the thread with a summarized fresh session. (agent-browser is unreliable on the hidden, throttled, heavily-animated tab — author verifies live.)

---

## Self-Review

**1. Spec coverage:**
- History hydration (`historyToAdkMessages` + `load`) → Tasks 1, 4. ✓
- New/Compact controls (`sendSlashCommand` + `runtimeEpoch` remount + header buttons) → Tasks 2, 4, 5. ✓
- dict `agent.newChat`/`agent.compact` (en+zh) → Task 3. ✓
- Tests: `history.test.ts` → Task 1; optional `sendSlashCommand` test → Task 2 (included). ✓
- Out of scope (sessionAdapter / multi-session list / switching) — not in any task, matches spec YAGNI. ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✓

**3. Type consistency:** `historyToAdkMessages(messages: unknown)` is called with `data?.currentSession?.messages` (unknown) in Task 4 — signature accepts it. `SlashCommand` type exported from `session-commands.ts` (Task 2) and imported in Task 4. `sendSlashCommand` returns `Promise<void>`; `runCommand` awaits it. `AgentThread` props `{ dict, onNewSession, onCompact }` defined in Task 5 match what `AgentPanel` passes in Task 4. ✓

**Note on commit ordering:** Task 4's panel rewrite references props that Task 5 adds to `AgentThread`, so the tree does not typecheck between them. The plan defers Task 4's commit to the end of Task 5 (single compiling commit for the wiring). Tasks 1–3 are independent and commit cleanly on their own.
