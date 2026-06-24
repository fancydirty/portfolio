# Portfolio Polish Round Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a round of polish to the rebuilt portfolio — make the language switch preserve the current path, move hardcoded chat colors onto theme tokens so light mode flips correctly, dedupe the double `/api/agent/me` fetch on agent mount, add JSON-LD `Person` structured data, and extract the Accept-Language decision into a tested helper.

**Architecture:** Five independent, backwards-compatible changes. Each is small and surgical: one shared client helper for the agent-me dedupe, one pure builder for JSON-LD, one pure helper for locale negotiation, and two component-level refactors (nav + chat) that move inline values onto existing token/CSS classes. No data model, routing, or gateway-protocol changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (CSS-first `@theme`), Vitest + Testing Library (jsdom), Playwright. Run commands: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `components/site/site-nav.tsx` | Modify | Lang-switch link preserves the current path beyond the locale segment. |
| `tests/unit/site-nav.test.tsx` | Modify | Assert lang-switch href on home and on a detail page. |
| `components/agent/agent-tool.tsx` | Modify | Tool-status color via a pure `statusInfo()` → CSS class, not inline hex. |
| `components/agent/agent-thread.tsx` | Modify | LIVE dot + user bubble colors via CSS classes driven by tokens. |
| `app/globals.css` | Modify | New agent color tokens + classes + `.light` overrides. |
| `tests/unit/agent-parts.test.tsx` | Modify | Assert tool-status class is applied. |
| `lib/agent/me.ts` | Create | Shared `fetchMe()` with in-flight dedupe for the `/api/agent/me` probe + runtime `load`. |
| `lib/agent/use-agent-availability.ts` | Modify | Use `fetchMe()`; drop the per-mount AbortController. |
| `components/agent/agent-panel.tsx` | Modify | `load` uses `fetchMe()` so the initial mount reuses the probe's request. |
| `tests/unit/me.test.ts` | Create | `fetchMe` dedupes concurrent calls and parses ok / non-ok. |
| `tests/unit/use-agent-availability.test.ts` | Modify | Reset the shared cache between tests. |
| `lib/seo/jsonld.ts` | Create | Pure `personJsonLd({ sameAs })` builder. |
| `components/site/jsonld-script.tsx` | Create | Renders the `<script type="application/ld+json">` tag from a builder object. |
| `app/[lang]/layout.tsx` | Modify | Inject the JSON-LD script into `<head>`. |
| `tests/unit/jsonld.test.ts` | Create | `personJsonLd` shape + `sameAs` passthrough. |
| `lib/i18n/negotiate.ts` | Create | Pure `negotiateLocale(acceptLanguage)` helper. |
| `proxy.ts` | Modify | Use `negotiateLocale` instead of inline `startsWith("zh")`. |
| `app/page.tsx` | Modify | Add a comment documenting it as the static safety-net fallback. |
| `tests/unit/negotiate.test.ts` | Create | `negotiateLocale` covers zh / en / empty / multi-tag. |

---

## Out of scope (intentional)

- **ZH Open Graph card.** `app/[lang]/opengraph-image.tsx` and `app/[lang]/work/[slug]/opengraph-image.tsx` render English-only cards for both locales. `lib/seo/og-fonts.ts` loads only Geist (Latin) to keep the satori/OG serverless function small; a zh card would require bundling a multi-MB CJK font into that function. The existing code comment documents this as a deliberate tradeoff. The page metadata stays bilingual; only the share image is English. Leaving unchanged.
- **`app/page.tsx` `redirect("/en")`.** This is the static safety-net fallback for `/` when the proxy is bypassed or disabled; the proxy (`proxy.ts`) performs the smart Accept-Language redirect at the edge. Making the page Accept-Language-aware would duplicate proxy logic (DRY violation) and force `/` from static (`○`) to dynamic (`ƒ`) for zero real benefit. Keeping it as the dumb fallback; Task 6 just adds a comment explaining the layering.

---

### Task 1: Language switch preserves the current path

**Files:**
- Modify: `components/site/site-nav.tsx:16-55`
- Test: `tests/unit/site-nav.test.tsx`

- [ ] **Step 1: Write the failing tests**

Replace `tests/unit/site-nav.test.tsx` with:

```tsx
import { afterEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/site/site-nav";
import enDict from "@/lib/i18n/dictionaries/en";

const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => mockPathname() }));

afterEach(() => vi.clearAllMocks());

test("shows the home section anchors on the home page", () => {
  mockPathname.mockReturnValue("/en");
  render(<SiteNav lang="en" nav={enDict.nav} themeToggle={enDict.themeToggle} />);
  expect(screen.getByRole("link", { name: enDict.nav.now })).toHaveAttribute(
    "href",
    "#now",
  );
});

test("hides the dead section anchors on a detail page, keeps logo + lang", () => {
  mockPathname.mockReturnValue("/en/work/adk-agent");
  render(<SiteNav lang="en" nav={enDict.nav} themeToggle={enDict.themeToggle} />);
  expect(screen.queryByRole("link", { name: enDict.nav.now })).toBeNull();
  expect(screen.queryByRole("link", { name: enDict.nav.work })).toBeNull();
  expect(screen.getByRole("link", { name: /Zhou Le/ })).toBeInTheDocument();
  // Lang switch keeps the detail path, not just the locale root.
  expect(screen.getByRole("link", { name: "中" })).toHaveAttribute(
    "href",
    "/zh/work/adk-agent",
  );
});

test("lang switch on home points at the other locale root", () => {
  mockPathname.mockReturnValue("/zh");
  render(<SiteNav lang="zh" nav={enDict.nav} themeToggle={enDict.themeToggle} />);
  expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/en");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/site-nav.test.tsx`
Expected: FAIL — the detail-page test expects `href="/zh/work/adk-agent"` but the current code yields `/zh`.

- [ ] **Step 3: Implement the path-preserving lang switch**

In `components/site/site-nav.tsx`, replace the lang-switch `<Link>` block. Add a computed `otherHref` derived from `pathname`:

```tsx
  const other: Locale = lang === "en" ? "zh" : "en";
  const pathname = usePathname();
  // Preserve everything after the locale segment when switching languages, so
  // a case-study reader keeps their place rather than landing on the locale root.
  const otherHref = pathname.replace(/^\/(en|zh)(?=\/|$)/, `/${other}`);
```

Then change the link target from `href={`/${other}`}` to `href={otherHref}`. The regex replaces only the leading `/en` or `/zh` (when followed by `/` or end-of-string); a pathname without a locale prefix is returned unchanged, which is a safe fallback.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/site-nav.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/site/site-nav.tsx tests/unit/site-nav.test.tsx
git commit -m "fix(nav): lang switch preserves the current path, not just the locale root"
```

---

### Task 2: Chat hardcoded colors onto theme tokens

**Files:**
- Modify: `components/agent/agent-tool.tsx`
- Modify: `components/agent/agent-thread.tsx:29-55,81-87`
- Modify: `app/globals.css`
- Test: `tests/unit/agent-parts.test.tsx`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/agent-parts.test.tsx`:

```tsx
test("tool chip status uses a theme-aware class, not an inline color", () => {
  const complete = {
    toolName: "read_file",
    status: { type: "complete" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...complete} />);
  const label = screen.getByText("✓");
  expect(label).toHaveClass("agent-tool-ok");

  const failed = {
    toolName: "search",
    status: { type: "incomplete" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...failed} />);
  expect(screen.getByText(/failed/i)).toHaveClass("agent-tool-fail");

  const running = {
    toolName: "search",
    status: { type: "running" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...running} />);
  expect(screen.getByText(/running/i)).toHaveClass("agent-tool-run");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/agent-parts.test.tsx`
Expected: FAIL — the current component renders the label in a `<span style={{ color }}>`, with no `agent-tool-*` class.

- [ ] **Step 3: Add the agent color tokens + classes to `app/globals.css`**

Inside the existing `:root { … }` block, append (after `--on-accent`):

```css
  --agent-live: #5DCAA5; --agent-live-strong: #0F6E56;
  --agent-ok: #5DCAA5; --agent-fail: #E24B4A;
  --agent-you-bg: #3a2a18; --agent-you-fg: #f0d9bf; --agent-you-border: #5a4127;
```

Inside the existing `.light { … }` block, append (after `--on-accent: #ffffff;`):

```css
  --agent-live: #2e8d6f; --agent-live-strong: #1f6b54;
  --agent-ok: #1f8a5b; --agent-fail: #c0392b;
  --agent-you-bg: #f4e7d3; --agent-you-fg: #5a3f1e; --agent-you-border: #d9c39a;
```

After the `.agent-md` prose block (before the `.agent-live-dot` rule), add:

```css
/* Agent chat accents, driven by tokens so light mode flips them. */
.agent-tool-ok { color: var(--agent-ok); }
.agent-tool-fail { color: var(--agent-fail); }
.agent-tool-run { color: var(--accent); }
.agent-you {
  border-color: var(--agent-you-border);
  background: var(--agent-you-bg);
  color: var(--agent-you-fg);
}
.agent-live-badge {
  border-color: var(--agent-live-strong);
  color: var(--agent-live);
}
```

Replace the existing `.agent-live-dot` block with a token-driven version (the pulse uses `color-mix` so it tracks `--agent-live` in both themes):

```css
.agent-live-dot {
  background: var(--agent-live);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--agent-live) 50%, transparent);
  animation: agent-pulse 2s infinite;
}
@keyframes agent-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--agent-live) 50%, transparent); }
  70% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--agent-live) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--agent-live) 0%, transparent); }
}
```

- [ ] **Step 4: Rewrite `components/agent/agent-tool.tsx` to use a pure `statusInfo` + classes**

```tsx
"use client";

import type {
  ToolCallMessagePartComponent,
  ToolCallMessagePartStatus,
} from "@assistant-ui/react";

function statusInfo(status: ToolCallMessagePartStatus): {
  label: string;
  cls: string;
} {
  switch (status.type) {
    case "complete":
      return { label: "✓", cls: "agent-tool-ok" };
    case "incomplete":
      return { label: "failed", cls: "agent-tool-fail" };
    default:
      return { label: "running…", cls: "agent-tool-run" };
  }
}

/** Compact chip showing a tool call + its status, so the agent's work is visible. */
export const AgentToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  status,
}) => {
  const { label, cls } = statusInfo(status);
  return (
    <span className="my-1 mr-1.5 inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={cls}
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6 2 2 6-6a4 4 0 0 0 5.4-5.4l-2.3 2.3-1.6-1.6 2.3-2.3z" />
      </svg>
      {toolName}
      <span className={cls}>{label}</span>
    </span>
  );
};
```

The SVG stroke now inherits `currentColor` from the `cls` class on the `<svg>` itself.

- [ ] **Step 5: Move the LIVE dot and user bubble onto classes in `components/agent/agent-thread.tsx`**

In the header bar, replace:

```tsx
        <span className="agent-live-dot h-2 w-2 rounded-full bg-[#5DCAA5]" />
        <span className="font-mono text-xs text-ink">adk-agent</span>
        <span className="rounded border border-[#0F6E56] px-1.5 py-px font-mono text-[10px] tracking-wider text-[#5DCAA5]">
          LIVE
        </span>
```

with:

```tsx
        <span className="agent-live-dot h-2 w-2 rounded-full" />
        <span className="font-mono text-xs text-ink">adk-agent</span>
        <span className="agent-live-badge rounded border px-1.5 py-px font-mono text-[10px] tracking-wider">
          LIVE
        </span>
```

In the `UserMessage` component, replace:

```tsx
              <MessagePrimitive.Root className="max-w-[82%] self-end whitespace-pre-wrap rounded-xl rounded-br-[3px] border border-[#5a4127] bg-[#3a2a18] px-3.5 py-2.5 text-[#f0d9bf]">
```

with:

```tsx
              <MessagePrimitive.Root className="agent-you max-w-[82%] self-end whitespace-pre-wrap rounded-xl rounded-br-[3px] border px-3.5 py-2.5">
```

`border` keeps the 1px width; the `agent-you` class sets border/background/foreground from tokens.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/unit/agent-parts.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add components/agent/agent-tool.tsx components/agent/agent-thread.tsx app/globals.css tests/unit/agent-parts.test.tsx
git commit -m "fix(agent): move chat accents onto theme tokens so light mode flips"
```

---

### Task 3: Dedupe the double `/api/agent/me` fetch

**Files:**
- Create: `lib/agent/me.ts`
- Modify: `lib/agent/use-agent-availability.ts`
- Modify: `components/agent/agent-panel.tsx:34-48`
- Create: `tests/unit/me.test.ts`
- Modify: `tests/unit/use-agent-availability.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/me.test.ts`:

```ts
import { afterEach, expect, it, vi } from "vitest";
import { fetchMe, __resetMeCacheForTests } from "@/lib/agent/me";

afterEach(() => {
  vi.restoreAllMocks();
  __resetMeCacheForTests();
});

it("dedupes concurrent calls into a single fetch", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));

  await Promise.all([fetchMe(), fetchMe(), fetchMe()]);

  expect(fetchSpy).toHaveBeenCalledTimes(1);
});

it("refetches after the in-flight promise settles", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));

  await fetchMe();
  await fetchMe();

  expect(fetchSpy).toHaveBeenCalledTimes(2);
});

it("parses ok responses and exposes the data", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ currentSession: { messages: [] } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  const r = await fetchMe();
  expect(r.ok).toBe(true);
  expect((r.data as { currentSession: { messages: [] } }).currentSession.messages).toEqual([]);
});

it("reports ok=false on a non-2xx response", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("x", { status: 502 }));
  const r = await fetchMe();
  expect(r.ok).toBe(false);
  expect(r.data).toBeNull();
});

it("reports ok=false on a network failure", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  const r = await fetchMe();
  expect(r.ok).toBe(false);
  expect(r.data).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/me.test.ts`
Expected: FAIL — `@/lib/agent/me` does not exist (import error).

- [ ] **Step 3: Implement `lib/agent/me.ts`**

```ts
"use client";

export type MeResult = { ok: boolean; data: unknown };

// Module-level in-flight cache. Two callers in the same tick (the availability
// probe and the runtime `load`) share one network request; the cache clears the
// moment it settles so a later remount (after /new or /compact) refetches.
let inFlight: Promise<MeResult> | null = null;

export async function fetchMe(): Promise<MeResult> {
  if (inFlight) return inFlight;
  const p = (async (): Promise<MeResult> => {
    try {
      const res = await fetch("/api/agent/me", {
        cache: "no-store",
        credentials: "include",
      });
      const data = res.ok ? await res.json().catch(() => null) : null;
      return { ok: res.ok, data };
    } catch {
      return { ok: false, data: null };
    } finally {
      inFlight = null;
    }
  })();
  inFlight = p;
  return p;
}

/** Test-only: clear the in-flight cache between tests. */
export function __resetMeCacheForTests(): void {
  inFlight = null;
}
```

- [ ] **Step 4: Run the me tests to verify they pass**

Run: `npx vitest run tests/unit/me.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Wire `fetchMe` into the availability hook**

Replace `lib/agent/use-agent-availability.ts` with:

```ts
"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/agent/me";

export type AgentAvailability = "loading" | "available" | "unavailable";

export function useAgentAvailability(): AgentAvailability {
  const [state, setState] = useState<AgentAvailability>("loading");

  useEffect(() => {
    let active = true;
    fetchMe().then((r) => {
      if (active) setState(r.ok ? "available" : "unavailable");
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
```

- [ ] **Step 6: Wire `fetchMe` into the runtime `load`**

In `components/agent/agent-panel.tsx`, import `fetchMe`:

```ts
import { fetchMe } from "@/lib/agent/me";
```

and replace the `load` body with:

```ts
    load: async () => {
      const r = await fetchMe();
      if (!r.ok) return { messages: [] };
      const data = r.data as { currentSession?: { messages?: unknown } } | null;
      return { messages: historyToAdkMessages(data?.currentSession?.messages) };
    },
```

On the initial mount the probe already triggered `fetchMe`, so `load` reuses the in-flight promise instead of re-fetching. After a `/new` or `/compact` remount (bumped `runtimeEpoch`), `inFlight` is null and `load` refetches — the intended behavior.

- [ ] **Step 7: Update the availability tests to reset the shared cache**

In `tests/unit/use-agent-availability.test.ts`, add the reset to the existing `afterEach`:

```ts
import { __resetMeCacheForTests } from "@/lib/agent/me";

afterEach(() => {
  vi.restoreAllMocks();
  __resetMeCacheForTests();
});
```

Leave the three existing test bodies unchanged — they mock `globalThis.fetch`, which `fetchMe` calls, so the ok / non-2xx / failure cases still hold.

- [ ] **Step 8: Run all agent + availability tests**

Run: `npx vitest run tests/unit/me.test.ts tests/unit/use-agent-availability.test.ts tests/unit/agent-section.test.tsx`
Expected: PASS (5 + 3 + 2 = 10 tests).

- [ ] **Step 9: Commit**

```bash
git add lib/agent/me.ts lib/agent/use-agent-availability.ts components/agent/agent-panel.tsx tests/unit/me.test.ts tests/unit/use-agent-availability.test.ts
git commit -m "perf(agent): dedupe /api/agent/me between the probe and the runtime load"
```

---

### Task 4: JSON-LD `Person` structured data

**Files:**
- Create: `lib/seo/jsonld.ts`
- Create: `components/site/jsonld-script.tsx`
- Modify: `app/[lang]/layout.tsx:50-65`
- Create: `tests/unit/jsonld.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/jsonld.test.ts`:

```ts
import { expect, it } from "vitest";
import { personJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

it("builds a Person JSON-LD object with the expected shape", () => {
  const out = personJsonLd({
    sameAs: ["https://github.com/fancydirty", "https://example.com/me"],
  });
  expect(out["@context"]).toBe("https://schema.org");
  expect(out["@type"]).toBe("Person");
  expect(out.name).toBe("Zhou Le");
  expect(out.alternateName).toBe("周乐");
  expect(out.url).toBe(SITE_URL);
  expect(out.jobTitle).toBe("Agent Product Engineer");
  expect(out.sameAs).toEqual([
    "https://github.com/fancydirty",
    "https://example.com/me",
  ]);
});

it("passes sameAs through verbatim and keeps it an array", () => {
  const out = personJsonLd({ sameAs: [] });
  expect(Array.isArray(out.sameAs)).toBe(true);
  expect(out.sameAs).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/jsonld.test.ts`
Expected: FAIL — `@/lib/seo/jsonld` does not exist.

- [ ] **Step 3: Implement `lib/seo/jsonld.ts`**

```ts
import { SITE_URL } from "@/lib/seo/site";

/**
 * Build a schema.org `Person` JSON-LD object for the site owner. `sameAs` is
 * passed in from the locale dictionary so the profile URLs stay in one place.
 */
export function personJsonLd({
  sameAs,
}: {
  sameAs: string[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zhou Le",
    alternateName: "周乐",
    url: SITE_URL,
    jobTitle: "Agent Product Engineer",
    sameAs,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/jsonld.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Add the script renderer**

Create `components/site/jsonld-script.tsx`:

```tsx
/**
 * Renders a JSON-LD `<script>` for a schema.org object. Kept as a component so
 * the layout stays declarative and the JSON is escaped/serialized in one place.
 * The object must be a plain serializable record (no React nodes, no Dates).
 */
export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 6: Inject it into the `[lang]` layout**

In `app/[lang]/layout.tsx`, add imports:

```ts
import { personJsonLd } from "@/lib/seo/jsonld";
import { JsonLdScript } from "@/components/site/jsonld-script";
```

Inside the `LangLayout` function body, after `const dict = await getDictionary(lang);`, build the sameAs list from the dictionary:

```ts
  const sameAs = [dict.links.github, ...dict.links.items.map((i) => i.href)];
```

Then in the `<head>`, after the existing theme-bootstrap `<script>`, add:

```tsx
        <JsonLdScript data={personJsonLd({ sameAs })} />
```

- [ ] **Step 7: Add an e2e assertion that the script is present**

In `tests/e2e/home.spec.ts`, append a test:

```ts
test("emits a Person JSON-LD script", async ({ page }) => {
  await page.goto("/en");
  const el = page.locator('script[type="application/ld+json"]').first();
  await expect(el).toBeAttached();
  const raw = await el.textContent();
  const obj = JSON.parse(raw ?? "{}");
  expect(obj["@type"]).toBe("Person");
  expect(obj.name).toBe("Zhou Le");
});
```

- [ ] **Step 8: Run unit tests + typecheck**

Run: `npx vitest run tests/unit/jsonld.test.ts && npx tsc --noEmit`
Expected: tests PASS; typecheck clean.

- [ ] **Step 9: Commit**

```bash
git add lib/seo/jsonld.ts components/site/jsonld-script.tsx app/[lang]/layout.tsx tests/unit/jsonld.test.ts tests/e2e/home.spec.ts
git commit -m "feat(seo): emit Person JSON-LD structured data on every locale page"
```

---

### Task 5: Extract `negotiateLocale` and document the root fallback

**Files:**
- Create: `lib/i18n/negotiate.ts`
- Modify: `proxy.ts:7-9`
- Modify: `app/page.tsx`
- Create: `tests/unit/negotiate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/negotiate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { negotiateLocale } from "@/lib/i18n/negotiate";

describe("negotiateLocale", () => {
  it("maps a leading zh tag to zh", () => {
    expect(negotiateLocale("zh-CN")).toBe("zh");
    expect(negotiateLocale("zh")).toBe("zh");
    expect(negotiateLocale("zh-HK,en;q=0.8")).toBe("zh");
  });

  it("falls back to the default locale for anything not leading with zh", () => {
    expect(negotiateLocale("en-US")).toBe("en");
    expect(negotiateLocale("en,zh;q=0.6")).toBe("en");
    expect(negotiateLocale("fr-FR")).toBe("en");
  });

  it("handles an empty header", () => {
    expect(negotiateLocale("")).toBe("en");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/negotiate.test.ts`
Expected: FAIL — `@/lib/i18n/negotiate` does not exist.

- [ ] **Step 3: Implement `lib/i18n/negotiate.ts`**

```ts
import { defaultLocale, type Locale } from "./config";

/**
 * Pick a locale from an Accept-Language header. Mirrors the proxy's original
 * logic: a header that starts with `zh` (case-insensitive) yields `zh`,
 * everything else falls back to the default locale. Kept intentionally simple —
 * full quality-weight parsing is not worth it for a two-locale site.
 */
export function negotiateLocale(acceptLanguage: string): Locale {
  return acceptLanguage.toLowerCase().startsWith("zh") ? "zh" : defaultLocale;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/negotiate.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Use it in `proxy.ts`**

In `proxy.ts`, replace the inline locale decision. New file:

```ts
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n/config";
import { negotiateLocale } from "@/lib/i18n/negotiate";
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return;
  const lang = negotiateLocale(req.headers.get("accept-language") ?? "");
  return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}`, req.url));
}
export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
```

- [ ] **Step 6: Document the root page as the static safety-net fallback**

In `app/page.tsx`, replace the file with:

```ts
import { redirect } from "next/navigation";

// Static safety-net fallback for `/`. The proxy (proxy.ts) performs the smart
// Accept-Language redirect at the edge; this page only runs if the proxy is
// bypassed or disabled, so it stays a dumb redirect to the default locale and
// stays statically prerenderable (no headers() read, no dynamic rendering).
export default function Root() {
  redirect("/en");
}
```

- [ ] **Step 7: Run proxy + negotiate tests**

Run: `npx vitest run tests/unit/negotiate.test.ts tests/unit/proxy.test.ts`
Expected: PASS (3 + 4 = 7 tests).

- [ ] **Step 8: Commit**

```bash
git add lib/i18n/negotiate.ts proxy.ts app/page.tsx tests/unit/negotiate.test.ts
git commit -m "refactor(i18n): extract negotiateLocale helper; document root fallback"
```

---

## Final verification

- [ ] **Run the full local gate**

```bash
npx tsc --noEmit && npm run lint && npx vitest run && npm run build
```

Expected: typecheck clean, lint clean, all unit tests pass, `next build` succeeds with the same route set as before (no route should move from static to dynamic except none expected).

- [ ] **Run the e2e suite**

```bash
npm run test:e2e
```

Expected: all Playwright tests pass, including the new JSON-LD assertion and the existing lang-switch / root-redirect / Accept-Language tests.
