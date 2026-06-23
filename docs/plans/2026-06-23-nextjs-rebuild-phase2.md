# Portfolio Next.js Rebuild — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add per-project **case-study detail pages** (`/[lang]/work/[slug]`) with the WorkDossier five-section narrative + **scroll-animated architecture diagrams**, and wire the home editorial index rows to link into them.

**Architecture:** Detail pages are statically generated (`generateStaticParams` over `projects` × locales). Layout follows the agreed **spec-sheet composition (B)**: a left rail (name / stack / status / links) + right column (five sections), flagship metrics, and the project's architecture diagram. The 4 hand-drawn SVG diagrams are ported from the salvaged Astro components into React, wrapped in a shared `<AnimatedDiagram>` that pulses flow along the arrows when scrolled into view (static under `prefers-reduced-motion`). Private-project diagrams are anonymized on the way in (enforced by test).

**Tech Stack:** Next.js 16 App Router (Cache Components), React 19, TS strict, Tailwind v4 tokens, `motion` (Framer Motion) + IntersectionObserver, Vitest + RTL, Playwright.

**Reference (read before coding):**
- Spec `docs/specs/2026-06-23-portfolio-nextjs-rebuild-design.md` §3 (IA: detail pages), §4.1 (composition B), §5.1 (animated diagrams).
- Data: `lib/content/projects.ts` (`Project`: `id,name,visibility,flagship?,summary{en,zh},tags,metrics?,links{repo?,demo?,live?},content{en,zh}:FiveSection`).
- Existing: `components/home/selected-work.tsx` (rows to wire), `lib/i18n/dictionaries/en.ts` (`work.caseStudy`, `work.eyebrow`), `app/[lang]/layout.tsx`, `app/[lang]/page.tsx`.
- Source diagrams to port (gitignored): `.reference/old-astro/{AdkAgentDiagram,GeoBwsDiagram,YTPipelineDiagram,WorkflowDiagram}.astro`.
- Mediary Scout flow (for its new diagram), from `.reference/dossiers.md`: `搜片请求 → 入队(Postgres) → 进程内 worker → 沙箱 agent → PanSou 搜索 → 转存 115/Quark → 回读校验 → 推送通知`.

## ⚠️ Anonymization (hard constraint, enforced by tests)
Diagrams go PUBLIC. Private-project diagrams must carry only generic labels:
- **GeoBwsDiagram** (→ content-pipeline) currently contains **"Postiz"** (a watch-list term). Replace every "Postiz" with a generic label (e.g. **"Social scheduler"** / "Distribution"). Re-scan the whole ported file for: postiz, blackwhitematch, bwwm, bwminsights, interracial, indexnow-as-brand (IndexNow is a generic protocol → OK to keep), and any dating/relationship wording.
- **YTPipelineDiagram** (→ enterprise-workflow): keep labels generic (UID poll / fetch / attachment / AI review / notify); scrub any of: sogo, mailcow, 88vip, s.utui, successfulmatch, yt@, person names, "code review".
- Banned terms must appear in NO ported diagram (test asserts this).

---

## Diagram → project map
| project id | diagram component | source |
|---|---|---|
| `mediary-scout` | `MediaryScoutDiagram` | NEW, built from the dossier flow chain above |
| `adk-agent` | `AdkAgentDiagram` | port `.reference/old-astro/AdkAgentDiagram.astro` |
| `enterprise-workflow` | `EnterpriseFlowDiagram` | port `YTPipelineDiagram.astro` (anonymized) |
| `content-pipeline` | `ContentPipelineDiagram` | port `GeoBwsDiagram.astro` (anonymized: Postiz→generic) |

---

## File Structure (Phase 2)
```
components/diagrams/animated-diagram.tsx     # client wrapper: scroll-trigger + pulse animation + reduced-motion
components/diagrams/mediary-scout-diagram.tsx
components/diagrams/adk-agent-diagram.tsx
components/diagrams/enterprise-flow-diagram.tsx
components/diagrams/content-pipeline-diagram.tsx
components/diagrams/registry.tsx             # diagramFor(projectId) -> component | null
components/work/case-study.tsx               # spec-sheet detail layout (server component)
app/[lang]/work/[slug]/page.tsx              # route: generateStaticParams, generateMetadata, renders CaseStudy
tests/unit/diagrams.test.tsx                 # diagrams render + NO banned terms (anonymization guard)
tests/unit/case-study.test.tsx               # detail layout renders five sections + diagram + back link
tests/e2e/work.spec.ts                       # click a row -> detail; detail renders; no leaks; back to home
```
Modified: `components/home/selected-work.tsx` (rows become links), `lib/i18n/dictionaries/{en,zh}.ts` (add `work.backToWork` label if needed — keep key parity).

---

## Task 1: Wire Selected Work rows to detail links

**Files:** Modify `components/home/selected-work.tsx`; Modify `tests/unit/selected-work.test.tsx`.

- [ ] **Step 1: Update the test** — In `tests/unit/selected-work.test.tsx`, add a case asserting each row links to `/{lang}/work/{id}`:
```tsx
it("links each row to its case-study route", () => {
  render(<SelectedWork projects={projects} lang="en" eyebrow="SELECTED WORK" />);
  const link = screen.getByRole("link", { name: /Mediary Scout/i });
  expect(link).toHaveAttribute("href", "/en/work/mediary-scout");
});
```
Run `npm test -- selected-work` → expect FAIL.

- [ ] **Step 2: Make rows links** — In `selected-work.tsx`, wrap each row's clickable area in `next/link` `<Link href={`/${lang}/work/${project.id}`}>`. Keep the editorial layout (the `<Link>` replaces the outer `<article>` wrapper or wraps its content); keep `hover:pl-2`. The right-column link hints (live demo/repo) stay as plain text inside (do NOT nest interactive `<a>` inside the row `<Link>` — render them as non-link text to avoid nested anchors). Preserve "no card/pill" classes.
Run `npm test -- selected-work` → expect PASS. Also `npm test -- ` (all) stays green.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: link editorial-index rows to case-study routes"`

---

## Task 2: Animated diagram wrapper

**Files:** Create `components/diagrams/animated-diagram.tsx`; Create `tests/unit/diagrams.test.tsx` (wrapper part).

- [ ] **Step 1: Write the failing test** — `tests/unit/diagrams.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";
describe("AnimatedDiagram", () => {
  it("renders its title + children svg and is labelled for a11y", () => {
    const { container, getByRole } = render(
      <AnimatedDiagram title="Test flow"><svg data-testid="svg"><path d="M0 0 L10 10" /></svg></AnimatedDiagram>
    );
    expect(getByRole("img", { name: "Test flow" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
```
Run `npm test -- diagrams` → FAIL.

- [ ] **Step 2: Implement the wrapper** — `components/diagrams/animated-diagram.tsx` (`"use client"`):
  - Props `{ title: string; children: React.ReactNode }`.
  - Wrap children in a `<figure role="img" aria-label={title}>`.
  - Use IntersectionObserver (or `motion`'s `useInView`) to add an `in-view` state when scrolled into view; when in view AND not reduced-motion, animate flow: select `path[data-flow]` inside and animate `stroke-dashoffset` from full length to 0 (a "draw"/pulse), or render small dots traveling along paths. Keep it subtle. Under `prefers-reduced-motion` (check `window.matchMedia`), render fully static (no animation) — diagram still fully visible.
  - Must degrade to static if JS disabled (children SVG renders regardless).
Run `npm test -- diagrams` → PASS.

- [ ] **Step 3: Commit** — `git commit -am "feat: scroll-triggered AnimatedDiagram wrapper (reduced-motion safe)"`

---

## Task 3: Port the 4 diagrams (anonymized) + registry

**Files:** Create `components/diagrams/{mediary-scout,adk-agent,enterprise-flow,content-pipeline}-diagram.tsx`, `components/diagrams/registry.tsx`; extend `tests/unit/diagrams.test.tsx`.

- [ ] **Step 1: Port adk-agent + the two private diagrams** — For each of `AdkAgentDiagram.astro`, `YTPipelineDiagram.astro`, `GeoBwsDiagram.astro` (in `.reference/old-astro/`): convert Astro → TSX (inline SVG; `class`→`className`; `style="..."`→`style={{...}}` objects OR move to className; HTML comments `<!-- -->`→`{/* */}`; self-close void elements). Tag the connector `<path>`/`<line>` flow arrows with `data-flow` so the wrapper can animate them. Wrap the returned SVG export in `<AnimatedDiagram title="...">`.
  - **content-pipeline-diagram.tsx**: replace EVERY "Postiz" with "Social scheduler" (or "Distribution"); keep "IndexNow" (generic protocol). Re-scan for any leak.
  - **enterprise-flow-diagram.tsx**: confirm labels are generic; scrub any leak.
- [ ] **Step 2: Build `MediaryScoutDiagram`** — Author a fresh editorial SVG for the flagship from the dossier chain: nodes `Request → Queue (Postgres) → Worker → Sandbox agent → Search → Transfer (cloud drive) → Verify (re-read) → Notify`, connector paths tagged `data-flow`, styled with the design tokens (use `currentColor`/CSS vars so it themes). Wrap in `<AnimatedDiagram title="Mediary Scout — acquisition flow">`. Keep it clean/legible, not cluttered.
- [ ] **Step 3: Registry** — `components/diagrams/registry.tsx`: `export function diagramFor(id: string): React.ReactNode | null` mapping the 4 ids to their components, else null.
- [ ] **Step 4: Anonymization + render test** — extend `tests/unit/diagrams.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { MediaryScoutDiagram } from "@/components/diagrams/mediary-scout-diagram";
import { AdkAgentDiagram } from "@/components/diagrams/adk-agent-diagram";
import { EnterpriseFlowDiagram } from "@/components/diagrams/enterprise-flow-diagram";
import { ContentPipelineDiagram } from "@/components/diagrams/content-pipeline-diagram";
const BANNED = [/postiz/i,/blackwhatmatch/i,/blackwhitematch/i,/bwwm/i,/bwminsights/i,/interracial/i,/sogo/i,/mailcow/i,/successfulmatch/i,/88vip/i,/s\.utui/i];
it("no diagram leaks banned terms", () => {
  for (const D of [MediaryScoutDiagram, AdkAgentDiagram, EnterpriseFlowDiagram, ContentPipelineDiagram]) {
    const html = renderToStaticMarkup(<D />);
    for (const re of BANNED) expect(re.test(html), `leak ${re}`).toBe(false);
  }
});
```
(If a diagram needs to render without the client wrapper's effects under `renderToStaticMarkup`, ensure the component is SSR-safe — guard `window` access.)
Run `npm test -- diagrams` → PASS.

- [ ] **Step 5: typecheck + commit** — `npm run typecheck`; `git commit -am "feat: port 4 architecture diagrams to React (private ones anonymized)"`

---

## Task 4: Case-study detail page

**Files:** Create `components/work/case-study.tsx`, `app/[lang]/work/[slug]/page.tsx`, `tests/unit/case-study.test.tsx`.

- [ ] **Step 1: Failing layout test** — `tests/unit/case-study.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseStudy } from "@/components/work/case-study";
import { projects } from "@/lib/content/projects";
const flagship = projects[0]!;
describe("CaseStudy", () => {
  it("renders name, all five sections, and a back link", () => {
    render(<CaseStudy project={flagship} lang="en" backLabel="Back" />);
    expect(screen.getByRole("heading", { name: flagship.name })).toBeInTheDocument();
    expect(screen.getByText(flagship.content.en.whatMadeItHard.slice(0, 24), { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute("href", "/en");
  });
});
```
Run `npm test -- case-study` → FAIL.

- [ ] **Step 2: Implement `CaseStudy`** (server component) — Props `{ project: Project; lang: Locale; backLabel: string }`. Spec-sheet composition: a back `<Link href={`/${lang}`}>`; header with `name` (large) + mono status (visibility) + tags (plain mono text, not chips); a left/right or stacked layout — left rail: stack (tags) + links (repo/demo/live as real `<a>`); right/below: the five sections each with a mono eyebrow (What it is / Inputs & outputs / What made it hard / What I decided / What changed — localized labels) + the `content[lang]` prose; flagship: render `metrics` as a typeset row (NOT a four-cell card grid — keep editorial); then the diagram via `diagramFor(project.id)`. Hairlines + type only; no card/pill chrome.
Run `npm test -- case-study` → PASS.

- [ ] **Step 3: Route + static params + metadata** — `app/[lang]/work/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { projects } from "@/lib/content/projects";
import { CaseStudy } from "@/components/work/case-study";
export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.id })));
}
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.id === slug);
  if (!p || !isLocale(lang)) return {};
  return { title: `${p.name} — Zhou Le`, description: p.summary[lang] };
}
export default async function WorkPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();
  const dict = await getDictionary(lang);
  return <main className="mx-auto max-w-3xl px-6 py-16"><CaseStudy project={project} lang={lang} backLabel={dict.work.backToWork} /></main>;
}
```
Add `work.backToWork` (e.g. "← Back to work" / "← 返回作品") and the 5 section labels to BOTH dictionaries (keep deep key parity — the i18n test now recurses arrays). Add a `work.sections` object `{ whatItIs, inputsOutputs, whatMadeItHard, whatIDecided, whatChanged }` localized, used by `CaseStudy`.
Run `npm run build` → `/en/work/mediary-scout` etc. prerender; `npm test` all green.

- [ ] **Step 4: typecheck + commit** — `git commit -am "feat: case-study detail pages (/[lang]/work/[slug]) with metadata"`

---

## Task 5: E2E + close-out

**Files:** Create `tests/e2e/work.spec.ts`; Modify `tests/e2e/home.spec.ts` (row → detail click).

- [ ] **Step 1: Write e2e** — `tests/e2e/work.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
test("home row navigates to case study; detail renders; no leaks", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: /Mediary Scout/i }).click();
  await expect(page).toHaveURL(/\/en\/work\/mediary-scout/);
  await expect(page.getByRole("heading", { name: "Mediary Scout" })).toBeVisible();
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const t of ["postiz","blackwhitematch","bwwm","interracial","sogo","mailcow","media.dirtyfancy.sbs"]) {
    expect(body, `leak ${t}`).not.toContain(t);
  }
  await page.getByRole("link", { name: /back/i }).click();
  await expect(page).toHaveURL(/\/en$/);
});
test("zh detail page renders", async ({ page }) => {
  await page.goto("/zh/work/adk-agent");
  await expect(page.getByRole("heading", { name: "adk-agent" })).toBeVisible();
});
```
Run `npm run test:e2e` → PASS.

- [ ] **Step 2: Full green + push** — `npm run lint && npm run typecheck && npm test && npm run test:e2e && npm run build` all green. `git commit -am "test: e2e for case-study navigation + leak guard"` then `git push`.

---

## Self-Review (plan author)
- **Spec coverage:** §3 detail pages → Tasks 1,3,4,5; §4.1 spec-sheet composition → Task 4; §5.1 animated diagrams → Tasks 2,3. Deferred to Phase 3 (noted): embedded agent panel, OG images, sitemap/robots, Vercel deploy, real README.
- **Anonymization:** Postiz leak in GeoBwsDiagram explicitly scrubbed (Task 3 Step 1) + guarded by `tests/unit/diagrams.test.tsx` and `tests/e2e/work.spec.ts`.
- **Type consistency:** `Project`/`FiveSection`/`Locale`/`getDictionary`/`projects`/`diagramFor`/`CaseStudy` props/`AnimatedDiagram` props consistent across tasks. New dict keys (`work.backToWork`, `work.sections.*`) added to BOTH locales (deep-parity test enforces).
- **No dead links:** rows now link to routes created in Task 4 (Task 1 wires links, Task 4 creates the routes — both land before e2e in Task 5).
- **Placeholders:** none; code shown for each non-trivial step. Diagram SVG bodies are ported from named source files (not pasted) with explicit conversion + anonymization rules — acceptable since the source is in-repo.
