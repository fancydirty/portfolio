# Live Agent Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed a first-party, live chat panel on the adk-agent case-study page that proxies to the existing `api.dirtyfancy.sbs` ADK gateway, with mandatory Turnstile and graceful link-card degradation.

**Architecture:** Browser talks only to the portfolio's own same-origin `/api/agent/*` Next.js Route Handlers, which forward server-side to `GATEWAY_URL` with an `x-gateway-secret` header, transparently relaying cookies and the SSE stream. The UI uses `@assistant-ui/react` headless primitives with a fully custom editorial skin; the streaming runtime is `@assistant-ui/react-google-adk`'s `useAdkRuntime` fed by a slimmed port of the reference `createGatewayAdkStream` (Turnstile + plain SSE, no recovery/replay).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, `@assistant-ui/react` + `@assistant-ui/react-google-adk` + `@assistant-ui/react-markdown`, Cloudflare Turnstile, Vitest, Playwright.

**Spec:** `docs/specs/2026-06-24-live-agent-panel-design.md`

**Reference source (in-repo, gitignored, proven):** `.reference/adk-agent/frontend/` — port from `lib/gateway.ts`, `lib/gateway-adk-stream.ts`, `app/api/me/route.ts`, `app/api/chat/route.ts`, `components/chat.tsx`.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/agent/gateway.ts` | Resolve `GATEWAY_URL`; build forward headers incl. `x-gateway-secret`. Server-only. |
| `app/api/agent/me/route.ts` | GET proxy → gateway `/api/me`; relay cookie / set-cookie. |
| `app/api/agent/chat/route.ts` | POST proxy → gateway `/api/chat`; relay cookie / set-cookie / x-stream-id; stream SSE. |
| `lib/agent/gateway-adk-stream.ts` | Slimmed `AdkStreamCallback`: POST + Turnstile retry + SSE parse (ported, recovery stripped). Client. |
| `lib/agent/use-agent-availability.ts` | Client hook: probe `/api/agent/me` → `loading\|available\|unavailable`. |
| `lib/agent/turnstile.ts` | Load CF Turnstile script + render widget + resolve token. Client. |
| `components/agent/agent-panel.tsx` | Client panel: custom-skinned Thread, preset openers, Turnstile inline, error/retry. |
| `components/agent/agent-fallback.tsx` | Link card → `agent.dirtyfancy.sbs`. |
| `components/agent/agent-section.tsx` | Wrapper: probe → panel or fallback; `id="agent-panel"`. |
| `components/home/agent-cta.tsx` | Home one-line CTA → detail anchor. |
| `lib/i18n/dictionaries/en.ts` + `zh.ts` | Add `agent` slice. |
| `app/[lang]/work/[slug]/page.tsx` | Mount `<AgentSection>` when `slug === "adk-agent"`. |
| `app/[lang]/page.tsx` | Mount `<AgentCta>`. |
| `.env.example` | Document the 3 env vars. |

---

## Task 1: Install dependencies and env scaffold

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.example` (create if absent)

- [ ] **Step 1: Install assistant-ui packages**

Match the reference versions (`.reference/adk-agent/frontend/package.json`): `@assistant-ui/react@^0.14.0`, `@assistant-ui/react-google-adk@^0.0.10`, `@assistant-ui/react-markdown@^0.14.0`.

```bash
cd /Users/dirtyfancy/projects/portfolio
npm install @assistant-ui/react@^0.14.0 @assistant-ui/react-google-adk@^0.0.10 @assistant-ui/react-markdown@^0.14.0
```

- [ ] **Step 2: Confirm install + read the real types**

```bash
npm ls @assistant-ui/react-google-adk
ls node_modules/@assistant-ui/react-google-adk/dist/*.d.ts
```

Open `node_modules/@assistant-ui/react-google-adk/dist/index.d.ts` and confirm the exports `useAdkRuntime`, `AdkStreamCallback`, `AdkEvent`, `AdkMessage`, `AssistantRuntimeProvider`. These types drive Tasks 6 and 8. If a name differs from this plan, use the real one and keep it consistent across tasks.

- [ ] **Step 3: Create `.env.example`**

Create `.env.example`:

```bash
# --- Live agent panel (Phase 3 sub-project A) ---
# Server-side: the adk-agent FastAPI gateway base URL.
GATEWAY_URL=https://api.dirtyfancy.sbs
# Server-side: shared secret the gateway uses to trust the Next.js proxy.
# Value lives in the backend Railway env; read it with:
#   railway variables --service backend --kv | grep GATEWAY_PROXY_SECRET
GATEWAY_PROXY_SECRET=
# Public: Cloudflare Turnstile site key (reuse the adk-agent frontend's).
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

- [ ] **Step 4: Verify `.env*` is gitignored**

```bash
git check-ignore .env.local; grep -nE "^\.env" .gitignore
```
Expected: `.env.local` is ignored. If `.env.local` is NOT ignored, add a line `.env*.local` to `.gitignore`. `.env.example` IS committed.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "chore(agent): add assistant-ui deps + env scaffold for live panel"
```

---

## Task 2: Gateway header helper

**Files:**
- Create: `lib/agent/gateway.ts`
- Test: `tests/unit/agent-gateway.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/agent-gateway.test.ts`:

```typescript
import { afterEach, describe, expect, it, vi } from "vitest";
import { gatewayUrl, gatewayHeaders } from "@/lib/agent/gateway";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("gatewayUrl", () => {
  it("returns GATEWAY_URL without a trailing slash", () => {
    vi.stubEnv("GATEWAY_URL", "https://api.dirtyfancy.sbs/");
    expect(gatewayUrl()).toBe("https://api.dirtyfancy.sbs");
  });

  it("throws when GATEWAY_URL is unset", () => {
    vi.stubEnv("GATEWAY_URL", "");
    expect(() => gatewayUrl()).toThrow(/GATEWAY_URL/);
  });
});

describe("gatewayHeaders", () => {
  it("injects x-gateway-secret when the secret is set", () => {
    vi.stubEnv("GATEWAY_PROXY_SECRET", "s3cret");
    expect(gatewayHeaders()["x-gateway-secret"]).toBe("s3cret");
  });

  it("omits x-gateway-secret when the secret is unset", () => {
    vi.stubEnv("GATEWAY_PROXY_SECRET", "");
    expect(gatewayHeaders()["x-gateway-secret"]).toBeUndefined();
  });

  it("merges a provided base", () => {
    vi.stubEnv("GATEWAY_PROXY_SECRET", "s3cret");
    const h = gatewayHeaders({ Accept: "text/event-stream" });
    expect(h.Accept).toBe("text/event-stream");
    expect(h["x-gateway-secret"]).toBe("s3cret");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/agent-gateway.test.ts`
Expected: FAIL — cannot resolve `@/lib/agent/gateway`.

- [ ] **Step 3: Write the implementation**

Create `lib/agent/gateway.ts`:

```typescript
// Server-only helpers for the agent proxy routes. Never import from a
// "use client" module — the secret must not reach the browser bundle.

export function gatewayUrl(): string {
  const raw = process.env.GATEWAY_URL;
  if (!raw) {
    throw new Error("GATEWAY_URL is not set");
  }
  return raw.replace(/\/$/, "");
}

export function gatewayHeaders(
  base?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = { ...(base ?? {}) };
  const secret = process.env.GATEWAY_PROXY_SECRET;
  if (secret) {
    headers["x-gateway-secret"] = secret;
  }
  return headers;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/agent-gateway.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/agent/gateway.ts tests/unit/agent-gateway.test.ts
git commit -m "feat(agent): gateway url + header helper with secret injection"
```

---

## Task 3: Proxy route handlers

**Files:**
- Create: `app/api/agent/me/route.ts`
- Create: `app/api/agent/chat/route.ts`
- Test: `tests/unit/agent-routes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/agent-routes.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("GATEWAY_URL", "https://api.example.test");
  vi.stubEnv("GATEWAY_PROXY_SECRET", "s3cret");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GET /api/agent/me", () => {
  it("forwards the browser cookie and relays set-cookie", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ userId: "u_x", anonymous: true }), {
        status: 200,
        headers: { "content-type": "application/json", "set-cookie": "sid=abc; Path=/" },
      }),
    );
    const { GET } = await import("@/app/api/agent/me/route");
    const req = new Request("http://localhost/api/agent/me", {
      headers: { cookie: "sid=abc" },
    });
    const res = await GET(req as never);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("https://api.example.test/api/me");
    expect((init as RequestInit).headers).toMatchObject({
      cookie: "sid=abc",
      "x-gateway-secret": "s3cret",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toBe("sid=abc; Path=/");
  });

  it("relays a non-2xx status from the gateway", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 502 }));
    const { GET } = await import("@/app/api/agent/me/route");
    const res = await GET(new Request("http://localhost/api/agent/me") as never);
    expect(res.status).toBe(502);
  });
});

describe("POST /api/agent/chat", () => {
  it("forwards the body + cookie and relays x-stream-id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("data: {}\n\n", {
        status: 200,
        headers: { "content-type": "text/event-stream", "x-stream-id": "str_1" },
      }),
    );
    const { POST } = await import("@/app/api/agent/chat/route");
    const req = new Request("http://localhost/api/agent/chat", {
      method: "POST",
      headers: { cookie: "sid=abc", "content-type": "application/json" },
      body: JSON.stringify({ parts: [{ text: "hi" }] }),
    });
    const res = await POST(req as never);

    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("https://api.example.test/api/chat");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({
      cookie: "sid=abc",
      "x-gateway-secret": "s3cret",
      Accept: "text/event-stream",
    });
    expect(res.headers.get("x-stream-id")).toBe("str_1");
    expect(res.headers.get("content-type")).toContain("text/event-stream");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/agent-routes.test.ts`
Expected: FAIL — cannot resolve the route modules.

- [ ] **Step 3: Implement the `me` route**

Create `app/api/agent/me/route.ts` (ported from `.reference/adk-agent/frontend/app/api/me/route.ts`, using our gateway helper):

```typescript
import { gatewayHeaders, gatewayUrl } from "@/lib/agent/gateway";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const headers = gatewayHeaders();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const upstream = await fetch(`${gatewayUrl()}/api/me`, {
    method: "GET",
    headers,
  });

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) responseHeaders.set("set-cookie", setCookie);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
```

- [ ] **Step 4: Implement the `chat` route**

Create `app/api/agent/chat/route.ts` (ported from `.reference/adk-agent/frontend/app/api/chat/route.ts`):

```typescript
import { gatewayHeaders, gatewayUrl } from "@/lib/agent/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const headers = gatewayHeaders({
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  });
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const upstream = await fetch(`${gatewayUrl()}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream",
    "Cache-Control": "no-cache, no-store, no-transform",
    "X-Accel-Buffering": "no",
  });
  const setCookie = upstream.headers.get("set-cookie");
  const streamId = upstream.headers.get("x-stream-id");
  if (setCookie) responseHeaders.set("set-cookie", setCookie);
  if (streamId) responseHeaders.set("x-stream-id", streamId);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/agent-routes.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add app/api/agent tests/unit/agent-routes.test.ts
git commit -m "feat(agent): same-origin proxy routes for /api/me and /api/chat"
```

---

## Task 4: Dictionary `agent` slice (EN + ZH)

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts` (add `agent` before `themeToggle`)
- Modify: `lib/i18n/dictionaries/zh.ts` (mirror structure)
- Test: `tests/unit/i18n.test.ts` (extend)

The `en` object is the source of truth; `Dictionary = Widen<typeof en>`. `zh` must supply the exact same keys and array lengths. Preset questions must contain NO redline terms (see spec §; `tests/e2e/home.spec.ts` lists them).

- [ ] **Step 1: Add the `agent` slice to `en.ts`**

Insert this block immediately before the `themeToggle:` key in `lib/i18n/dictionaries/en.ts`:

```typescript
  agent: {
    eyebrow: "TALK TO MY AGENT",
    title: "Ask my representative agent",
    intro:
      "This panel is the live adk-agent backend, not a canned script. Ask it about the architecture or how I'd fit a role.",
    inputPlaceholder: "Ask about a project, a decision, or a role…",
    sendLabel: "Send",
    presets: [
      "Walk me through the Mediary Scout architecture.",
      "Assess my fit for a senior backend role.",
      "What reliability engineering have you done?",
    ],
    turnstilePrompt: "Quick human check before we start.",
    streamError: "The stream dropped. Try again.",
    retry: "Retry",
    fallbackTitle: "Talk to my representative agent",
    fallbackBody:
      "The in-page panel is offline right now. The agent is still live on its own page.",
    fallbackCta: "Open the agent →",
    homeCta: "Or talk to my representative agent, live →",
  },
```

- [ ] **Step 2: Add the mirrored slice to `zh.ts`**

Insert immediately before `themeToggle:` in `lib/i18n/dictionaries/zh.ts` (same keys, 3 presets):

```typescript
  agent: {
    eyebrow: "和我的 AGENT 对话",
    title: "问我的代表 Agent",
    intro:
      "这个面板就是活的 adk-agent 后端，不是预设脚本。问它架构，或问它我适不适合某个岗位。",
    inputPlaceholder: "问一个项目、一个决策，或一个岗位……",
    sendLabel: "发送",
    presets: [
      "讲讲 Mediary Scout 的架构。",
      "评估我对某个资深后端岗位的匹配度。",
      "你做过哪些可靠性工程？",
    ],
    turnstilePrompt: "开始前先做个人机验证。",
    streamError: "流式中断了，请重试。",
    retry: "重试",
    fallbackTitle: "和我的代表 Agent 对话",
    fallbackBody: "站内面板暂时离线，Agent 在它自己的页面上仍然在线。",
    fallbackCta: "打开 Agent →",
    homeCta: "或者，和我的代表 Agent 实时对话 →",
  },
```

- [ ] **Step 3: Extend the i18n test**

Append to `tests/unit/i18n.test.ts`:

```typescript
import enDict from "@/lib/i18n/dictionaries/en";
import zhDict from "@/lib/i18n/dictionaries/zh";

test("agent slice exists and matches across locales", () => {
  expect(enDict.agent.presets).toHaveLength(3);
  expect(Object.keys(zhDict.agent).sort()).toEqual(Object.keys(enDict.agent).sort());
  expect(zhDict.agent.presets).toHaveLength(enDict.agent.presets.length);
});

test("agent presets leak no redline terms", () => {
  const redline = ["blackwhitematch", "bwwm", "interracial", "sogo", "mailcow", "successfulmatch", "postiz"];
  const blob = JSON.stringify([enDict.agent, zhDict.agent]).toLowerCase();
  for (const term of redline) expect(blob).not.toContain(term);
});
```

- [ ] **Step 4: Run typecheck + test**

Run: `npx tsc --noEmit && npx vitest run tests/unit/i18n.test.ts`
Expected: PASS. If tsc complains `zh` is missing keys, the structures don't match — fix `zh.ts`.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/zh.ts tests/unit/i18n.test.ts
git commit -m "feat(agent): bilingual agent dictionary slice"
```

---

## Task 5: Availability probe hook

**Files:**
- Create: `lib/agent/use-agent-availability.ts`
- Test: `tests/unit/use-agent-availability.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/use-agent-availability.test.ts`:

```typescript
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAgentAvailability } from "@/lib/agent/use-agent-availability";

afterEach(() => vi.restoreAllMocks());

describe("useAgentAvailability", () => {
  it("reports available when /api/agent/me is ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));
    const { result } = renderHook(() => useAgentAvailability());
    expect(result.current).toBe("loading");
    await waitFor(() => expect(result.current).toBe("available"));
  });

  it("reports unavailable when the probe fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useAgentAvailability());
    await waitFor(() => expect(result.current).toBe("unavailable"));
  });

  it("reports unavailable on a non-2xx probe", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("x", { status: 502 }));
    const { result } = renderHook(() => useAgentAvailability());
    await waitFor(() => expect(result.current).toBe("unavailable"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/use-agent-availability.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the hook**

Create `lib/agent/use-agent-availability.ts`:

```typescript
"use client";

import { useEffect, useState } from "react";

export type AgentAvailability = "loading" | "available" | "unavailable";

export function useAgentAvailability(): AgentAvailability {
  const [state, setState] = useState<AgentAvailability>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/me", { cache: "no-store", credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        setState(res.ok ? "available" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/use-agent-availability.test.ts`
Expected: PASS (3 tests). If `renderHook` is missing, confirm `@testing-library/react` is installed (it is — used by `selected-work.test.tsx`).

- [ ] **Step 5: Commit**

```bash
git add lib/agent/use-agent-availability.ts tests/unit/use-agent-availability.test.ts
git commit -m "feat(agent): availability probe hook"
```

---

## Task 6: Streaming runtime adapter (focused, from scratch)

**Files:**
- Create: `lib/agent/gateway-adk-stream.ts`
- Reference: `.reference/adk-agent/frontend/lib/gateway-adk-stream.ts` (for body + SSE shapes only)

**Deviation from original plan:** rather than `cp` the heavy reference adapter (which carries recovery/replay/attachments) and strip it, write a focused ~120-line adapter from scratch against the real installed types (`@assistant-ui/react-google-adk` `AdkStreamCallback`/`AdkEvent`). The gateway SSE is plain `data: {AdkEvent json}\n\n`; the body for one human turn is `{ parts: [...] }`; Turnstile 403 is `{ error: "turnstile_required" }` and the token goes in the body as `turnstileToken`. Keeps **send + Turnstile retry + plain SSE parse**; no recovery/replay.

- [ ] **Step 1: Copy the reference adapter into place**

```bash
cp .reference/adk-agent/frontend/lib/gateway-adk-stream.ts lib/agent/gateway-adk-stream.ts
```

- [ ] **Step 2: Strip the recovery/replay surface**

Edit `lib/agent/gateway-adk-stream.ts` so the public factory matches this exact shape (delete the `getRecoveryContext`, `recoverIfStored`, `replayStoredEvents`, `onNetworkStatus` options and every code path that references them; keep `api`, `headers?`, `onComplete?`, `solveChallenge?`):

```typescript
type CreateGatewayAdkStreamOptions = {
  api: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  onComplete?: () => void | Promise<void>;
  solveChallenge?: (challenge: TurnstileChallenge) => Promise<string>;
};

export function createGatewayAdkStream(
  options: CreateGatewayAdkStreamOptions,
): AdkStreamCallback {
  return async function* (messages, config) {
    const headers = await resolveHeaders(options.headers);
    const body = messagesToProxyBody(messages, config as SendConfig);

    let response = await postGatewayRequest({
      api: options.api,
      headers,
      body,
      signal: (config as SendConfig).abortSignal,
    });

    const challenge = await parseTurnstileChallenge(response);
    if (challenge) {
      if (!options.solveChallenge) {
        throw new Error(challenge.message ?? "Human verification required");
      }
      const token = await options.solveChallenge(challenge);
      response = await postGatewayRequest({
        api: options.api,
        headers,
        body: { ...body, turnstileToken: token },
        signal: (config as SendConfig).abortSignal,
      });
    }

    if (!response.ok) {
      throw new Error(await errorMessageFromResponse(response));
    }

    try {
      yield* parseSseResponse(response);
    } finally {
      if (!(config as SendConfig).abortSignal?.aborted) {
        await options.onComplete?.();
      }
    }
  };
}
```

- [ ] **Step 3: Simplify `parseSseResponse` to drop recovery params**

In the same file, change `parseSseResponse` to take only `(response: Response)` and yield ADK events from the SSE body. Remove the `recoveryContext` / `recoverIfStored` / `replayStoredEvents` parameters and the branches that use them. Keep the core loop that reads `response.body`, splits on `\n\n`, parses each `data:` line as JSON, and `yield`s it as an `AdkEvent`. Keep the helpers `messagesToProxyBody`, `collectAttachments` (or delete attachments if unused), `parseTurnstileChallenge`, `errorMessageFromResponse`, `postGatewayRequest`, `resolveHeaders` as-is from the reference.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS. Resolve any leftover references to deleted symbols (they indicate a recovery code path you missed — delete it).

- [ ] **Step 5: Lint**

Run: `npx eslint lib/agent/gateway-adk-stream.ts`
Expected: clean (fix unused imports left behind by the strip).

- [ ] **Step 6: Commit**

```bash
git add lib/agent/gateway-adk-stream.ts
git commit -m "feat(agent): slim ADK stream adapter (send + turnstile + SSE, no recovery)"
```

---

## Task 7: Turnstile solver

**Files:**
- Create: `lib/agent/turnstile.ts`
- Reference: `.reference/adk-agent/frontend/components/chat.tsx` (`solveChallenge`, Turnstile widget handling)

- [ ] **Step 1: Implement the solver**

Create `lib/agent/turnstile.ts`. It exposes a `solveTurnstile(prompt)` that lazy-loads the Cloudflare script, renders a widget into a container appended to `document.body`, and resolves with the token from the widget callback. Port the script-loading and `window.turnstile.render` logic from the reference `chat.tsx`. If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is empty, reject so callers can surface the fallback.

```typescript
"use client";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function solveTurnstile(): Promise<string> {
  if (!SITE_KEY) throw new Error("Turnstile site key is not configured");
  await loadScript();
  if (!window.turnstile) throw new Error("Turnstile unavailable");

  return new Promise<string>((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "1rem";
    container.style.right = "1rem";
    container.style.zIndex = "50";
    document.body.appendChild(container);

    const cleanup = (id?: string) => {
      try {
        if (id) window.turnstile?.remove(id);
      } finally {
        container.remove();
      }
    };

    const widgetId = window.turnstile!.render(container, {
      sitekey: SITE_KEY,
      callback: (token: string) => {
        cleanup(widgetId);
        resolve(token);
      },
      "error-callback": () => {
        cleanup(widgetId);
        reject(new Error("Turnstile challenge failed"));
      },
    });
  });
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint lib/agent/turnstile.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/agent/turnstile.ts
git commit -m "feat(agent): cloudflare turnstile solver"
```

---

## Task 8: Panel + fallback + section wrapper

**Files:**
- Create: `components/agent/agent-fallback.tsx`
- Create: `components/agent/agent-panel.tsx`
- Create: `components/agent/agent-section.tsx`
- Test: `tests/unit/agent-section.test.tsx`

- [ ] **Step 1: Write the fallback (pure, no deps)**

Create `components/agent/agent-fallback.tsx`:

```typescript
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = { dict: Dictionary };

export function AgentFallback({ dict }: Props) {
  return (
    <div className="border-t border-hairline pt-8">
      <h3 className="font-medium text-ink">{dict.agent.fallbackTitle}</h3>
      <p className="mt-2 max-w-prose text-ink-muted">{dict.agent.fallbackBody}</p>
      <a
        href="https://agent.dirtyfancy.sbs"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block font-mono text-xs text-accent transition-colors hover:text-ink"
      >
        {dict.agent.fallbackCta}
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Write the failing section test**

Create `tests/unit/agent-section.test.tsx`. The section renders the fallback while probing fails; we force `unavailable` by rejecting fetch.

```typescript
import { afterEach, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AgentSection } from "@/components/agent/agent-section";
import enDict from "@/lib/i18n/dictionaries/en";

afterEach(() => vi.restoreAllMocks());

test("renders the fallback link when the agent is unavailable", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  render(<AgentSection dict={enDict} />);
  await waitFor(() => {
    const link = screen.getByRole("link", { name: enDict.agent.fallbackCta });
    expect(link).toHaveAttribute("href", "https://agent.dirtyfancy.sbs");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/agent-section.test.tsx`
Expected: FAIL — `@/components/agent/agent-section` not found.

- [ ] **Step 4: Write the panel**

Create `components/agent/agent-panel.tsx`. It builds the runtime and renders a custom-skinned thread. Use the real types confirmed in Task 1 Step 2. Wire `solveChallenge: solveTurnstile` and `api: "/api/agent/chat"`. Render preset buttons that submit via the assistant-ui composer API. Keep the skin editorial (hairlines, mono labels, no bubble shadows).

```typescript
"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAdkRuntime } from "@assistant-ui/react-google-adk";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { createGatewayAdkStream } from "@/lib/agent/gateway-adk-stream";
import { solveTurnstile } from "@/lib/agent/turnstile";
import { AgentThread } from "@/components/agent/agent-thread";

type Props = { dict: Dictionary };

export function AgentPanel({ dict }: Props) {
  const runtime = useAdkRuntime({
    stream: createGatewayAdkStream({
      api: "/api/agent/chat",
      solveChallenge: () => solveTurnstile(),
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AgentThread dict={dict} />
    </AssistantRuntimeProvider>
  );
}
```

- [ ] **Step 5: Write the custom-skinned thread**

Create `components/agent/agent-thread.tsx` using `@assistant-ui/react` primitives (`ThreadPrimitive`, `MessagePrimitive`, `ComposerPrimitive`). Port structure from `.reference/adk-agent/frontend/components/assistant-ui/thread.tsx` but replace all styling with the editorial skin and drop attachments/branch/reasoning UI. Render `dict.agent.presets` as `ThreadPrimitive.Suggestion` buttons, `dict.agent.inputPlaceholder` on the composer input, and a stream-error notice using `dict.agent.streamError` + `dict.agent.retry`.

```typescript
"use client";

import { ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { MarkdownText } from "@/components/agent/markdown-text";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function AgentThread({ dict }: { dict: Dictionary }) {
  return (
    <ThreadPrimitive.Root className="flex flex-col gap-6">
      <ThreadPrimitive.Viewport className="flex flex-col gap-4">
        <ThreadPrimitive.Empty>
          <p className="max-w-prose text-ink-muted">{dict.agent.intro}</p>
          <div className="mt-4 flex flex-col gap-2">
            {dict.agent.presets.map((q) => (
              <ThreadPrimitive.Suggestion
                key={q}
                prompt={q}
                method="replace"
                autoSend
                className="border-t border-hairline py-3 text-left text-ink-muted transition-colors hover:text-ink"
              >
                {q}
              </ThreadPrimitive.Suggestion>
            ))}
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="border-t border-hairline py-3">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">YOU</p>
                <div className="mt-1 text-ink">
                  <MessagePrimitive.Content />
                </div>
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="border-t border-hairline py-3">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">AGENT</p>
                <div className="mt-1 leading-relaxed text-ink-muted">
                  <MessagePrimitive.Content components={{ Text: MarkdownText }} />
                </div>
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="flex items-end gap-3 border-t border-hairline pt-4">
        <ComposerPrimitive.Input
          placeholder={dict.agent.inputPlaceholder}
          className="min-h-10 flex-1 resize-none bg-transparent text-ink outline-none placeholder:text-ink-subtle"
        />
        <ComposerPrimitive.Send className="font-mono text-xs text-accent transition-colors hover:text-ink">
          {dict.agent.sendLabel}
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
```

Create `components/agent/markdown-text.tsx` (thin wrapper, ported from reference `assistant-ui/markdown-text.tsx`, editorial styles):

```typescript
"use client";

import { makeMarkdownText } from "@assistant-ui/react-markdown";

export const MarkdownText = makeMarkdownText();
```

> If a primitive name (`ThreadPrimitive.Suggestion`, `autoSend`, `makeMarkdownText`) differs in the installed version, use the real API from the reference `thread.tsx` and the package `.d.ts`. Keep names consistent with what you confirmed in Task 1.

- [ ] **Step 6: Write the section wrapper**

Create `components/agent/agent-section.tsx`:

```typescript
"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { useAgentAvailability } from "@/lib/agent/use-agent-availability";
import { AgentFallback } from "@/components/agent/agent-fallback";

const AgentPanel = dynamic(
  () => import("@/components/agent/agent-panel").then((m) => m.AgentPanel),
  { ssr: false },
);

export function AgentSection({ dict }: { dict: Dictionary }) {
  const availability = useAgentAvailability();

  return (
    <section id="agent-panel" className="mt-16 border-t border-hairline pt-10">
      <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
        {dict.agent.eyebrow}
      </p>
      <h2 className="mt-3 text-2xl tracking-tight text-ink">{dict.agent.title}</h2>
      <div className="mt-6">
        {availability === "available" ? (
          <AgentPanel dict={dict} />
        ) : availability === "unavailable" ? (
          <AgentFallback dict={dict} />
        ) : (
          <p className="text-ink-subtle">…</p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run the section test + typecheck**

Run: `npx vitest run tests/unit/agent-section.test.tsx && npx tsc --noEmit`
Expected: PASS. The dynamic import of the panel is `ssr:false`, so the unavailable path never loads assistant-ui in the test.

- [ ] **Step 8: Commit**

```bash
git add components/agent tests/unit/agent-section.test.tsx
git commit -m "feat(agent): editorial chat panel, fallback, and section wrapper"
```

---

## Task 9: Mount on detail page + home CTA

**Files:**
- Modify: `app/[lang]/work/[slug]/page.tsx`
- Create: `components/home/agent-cta.tsx`
- Modify: `app/[lang]/page.tsx`

- [ ] **Step 1: Mount the section on the adk-agent detail page**

Edit `app/[lang]/work/[slug]/page.tsx`. Add the import and render `<AgentSection>` after `<CaseStudy>` only for the adk-agent slug:

```typescript
import { AgentSection } from "@/components/agent/agent-section";
```

Change the returned JSX to:

```tsx
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CaseStudy project={project} lang={lang} work={dict.work} />
      {project.id === "adk-agent" ? <AgentSection dict={dict} /> : null}
    </main>
  );
```

- [ ] **Step 2: Create the home CTA**

Create `components/home/agent-cta.tsx`:

```typescript
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function AgentCta({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  return (
    <div className="border-t border-hairline py-8">
      <Link
        href={`/${lang}/work/adk-agent#agent-panel`}
        className="font-mono text-sm text-accent transition-colors hover:text-ink"
      >
        {dict.agent.homeCta}
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Mount the CTA on the home page**

Edit `app/[lang]/page.tsx`. Add the import:

```typescript
import { AgentCta } from "@/components/home/agent-cta";
```

Insert `<AgentCta dict={dict} lang={lang} />` inside the lower `max-w-3xl` wrapper, right after `<HowIWork dict={dict} />`:

```tsx
      <div className="mx-auto max-w-3xl px-6">
        <HowIWork dict={dict} />
        <AgentCta dict={dict} lang={lang} />
        <NowSection dict={dict} />
        <LinksSection dict={dict} />
      </div>
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds; route list shows `ƒ /api/agent/chat` and `ƒ /api/agent/me`.

- [ ] **Step 5: Commit**

```bash
git add "app/[lang]/work/[slug]/page.tsx" components/home/agent-cta.tsx "app/[lang]/page.tsx"
git commit -m "feat(agent): mount panel on adk-agent page + home CTA"
```

---

## Task 10: E2E coverage (degraded path is the green main line)

**Files:**
- Create: `tests/e2e/agent.spec.ts`

CI has no reachable gateway, so the degraded path must be the asserted behavior. We do NOT mock the backend in E2E — with no `GATEWAY_URL`/secret in CI, `/api/agent/me` returns non-2xx and the section shows the fallback.

- [ ] **Step 1: Write the E2E spec**

Create `tests/e2e/agent.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("home CTA links to the agent panel anchor", async ({ page }) => {
  await page.goto("/en");
  const cta = page.getByRole("link", { name: /representative agent/i });
  await expect(cta).toHaveAttribute("href", "/en/work/adk-agent#agent-panel");
});

test("adk-agent page shows the agent section and degrades to a link", async ({ page }) => {
  await page.goto("/en/work/adk-agent");
  await expect(page.getByText("TALK TO MY AGENT")).toBeVisible();
  // With no gateway configured, the panel degrades to the fallback link.
  const fallback = page.getByRole("link", { name: /open the agent/i });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute("href", "https://agent.dirtyfancy.sbs");
});

test("agent section leaks no redline terms", async ({ page }) => {
  await page.goto("/en/work/adk-agent");
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const term of ["blackwhitematch", "bwwm", "interracial", "sogo", "mailcow", "successfulmatch", "postiz"]) {
    expect(body, `leaked ${term}`).not.toContain(term);
  }
});

test("non-agent project pages do NOT mount the panel", async ({ page }) => {
  await page.goto("/en/work/mediary-scout");
  await expect(page.getByText("TALK TO MY AGENT")).toHaveCount(0);
});
```

- [ ] **Step 2: Run E2E**

Run: `npm run test:e2e -- tests/e2e/agent.spec.ts`
Expected: 4 PASS. (Playwright builds + starts the server per `playwright.config.ts`. If port 3000 has a stale server, kill it first: `lsof -ti:3000 | xargs kill -9`.)

- [ ] **Step 3: Run the full unit + e2e suite (no regressions)**

Run: `npm test && npm run test:e2e`
Expected: all prior tests still green + the new ones.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/agent.spec.ts
git commit -m "test(agent): e2e for CTA anchor, graceful degradation, redline, scoping"
```

---

## Task 11: Live verification against the real gateway

**Files:** none (manual verification; this gates "done").

- [ ] **Step 1: Pull the real secret into `.env.local`**

```bash
cd .reference/adk-agent
SECRET=$(railway variables --service backend --kv | sed -n 's/^GATEWAY_PROXY_SECRET=//p')
cd ../..
printf 'GATEWAY_URL=https://api.dirtyfancy.sbs\nGATEWAY_PROXY_SECRET=%s\n' "$SECRET" >> .env.local
```

Also set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `.env.local` — read it from the adk-agent frontend's deployment env (Vercel) or the Cloudflare Turnstile dashboard. If it cannot be obtained, note that Turnstile cannot be verified locally and the panel will surface the challenge error; proceed to verify the degraded path and defer live Turnstile to post-deploy.

- [ ] **Step 2: Start the dev server and drive it with agent-browser**

```bash
npm run dev
```

Then with agent-browser: open `http://localhost:3000/en/work/adk-agent`, wait for networkidle, screenshot. Confirm the panel mounts (not the fallback), the preset questions render, and sending a preset either (a) streams a reply, or (b) surfaces the Turnstile widget → after solving, streams a reply. Watch the Network panel for `/api/agent/chat` returning `text/event-stream`.

- [ ] **Step 3: Verify the degraded path**

Temporarily blank `GATEWAY_URL` in `.env.local`, restart dev, reload the page, confirm the fallback link card appears instead of an error/white screen. Restore `.env.local` after.

- [ ] **Step 4: Verify bilingual + reduced-motion**

Open `/zh/work/adk-agent`; confirm the panel labels are Chinese. Confirm no console errors.

- [ ] **Step 5: No commit (verification only)**

Record the verification outcome in the PR description.

---

## Self-Review

**Spec coverage:**
- §1 placement (detail + home CTA) → Tasks 8, 9. ✓
- §1 chat UI (assistant-ui headless + custom skin) → Task 8 (agent-thread). ✓
- §2 proxy topology → Tasks 2, 3. ✓
- §4 degradation → Tasks 5, 8 (section), 10 (e2e). ✓
- §5 Turnstile mandatory → Tasks 6 (challenge handling), 7 (solver). ✓
- §6 env (3 vars, secret from Railway) → Tasks 1, 11. ✓
- §7 bilingual dict → Task 4. ✓
- §8 unit + e2e → Tasks 2, 3, 4, 5, 8, 10. ✓
- §9 YAGNI (no recovery/upload/multi-session) → Task 6 strips recovery; panel omits attachments. ✓

**Placeholder scan:** Task 6 Steps 2-3 and Task 8 Step 5 intentionally port from in-repo reference source rather than reproduce hundreds of lines of SSE/markdown code; exact source files + line-level instructions are given. All other steps carry full code.

**Type consistency:** `gatewayUrl()` / `gatewayHeaders()` (Tasks 2,3); `useAgentAvailability(): "loading"|"available"|"unavailable"` (Tasks 5,8); `createGatewayAdkStream({api, solveChallenge, onComplete, headers})` (Tasks 6,8); `AgentSection({dict})`, `AgentPanel({dict})`, `AgentThread({dict})`, `AgentFallback({dict})`, `AgentCta({dict, lang})` consistent across Tasks 8,9. `dict.agent.*` keys defined in Task 4 are all consumed in Tasks 8,9.
