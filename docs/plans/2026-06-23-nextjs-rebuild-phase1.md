# Portfolio Next.js Rebuild — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Astro app with a Next.js 16 app that renders a bilingual (EN/中) editorial-index home page with real, code-verified content — a working, deployable skeleton.

**Architecture:** Next.js 16 App Router (Cache Components) + TypeScript strict + Tailwind v4 + shadcn/ui + Geist fonts. Bilingual via a `[lang]` dynamic segment + plain dictionary modules (no heavy i18n framework). Composition is **editorial / non-card**: the home "Selected Work" section is a typeset index (oversized mono index numbers, large names, hairline rows, generous whitespace), NOT cards. Dark + light themes via CSS variables. Unit tests in Vitest + React Testing Library; e2e smoke in Playwright; CI on GitHub Actions.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, `geist`, `motion`, Vitest, @testing-library/react, Playwright, ESLint (type-aware), GitHub Actions.

**Scope note:** Phase 1 ships a working bilingual editorial home + CI. Out of scope (Phase 2/3): project case-study detail pages, animated architecture diagrams, the embedded live-agent panel, full SEO/OG image generation, Vercel production deploy. Those get their own plans after Phase 1 lands. The `GATEWAY_ALLOW_ORIGINS` backend prerequisite for the embed is already set (skip-deploys) and activates on the next backend redeploy.

**Reference (read before coding):**
- Design spec: `docs/specs/2026-06-23-portfolio-nextjs-rebuild-design.md` (authoritative).
- Content truth source: `.reference/dossiers.md` + `.reference/<repo>/` clones (gitignored). Use §5 "anonymized WorkDossier content" of each dossier for private projects.
- Current Astro copy to preserve: `src/pages/index.astro`, `src/pages/zh.astro`, `src/data/projects.ts`, `src/data/projects-zh.ts`, `src/assets/avatar.png`.
- ⚠️ Anonymization red lines (spec §2.3): never leak BWWM/BlackWhiteMatch/bwminsights/SOGo/employer/person names. ⚠️ Never cite `media.dirtyfancy.sbs` (does not exist). Flagship links = repo + `mediary.dirtyfancy.sbs` demo only.

---

## File Structure (Phase 1)

Created/owned by this phase:

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs   # tooling
vitest.config.ts, vitest.setup.ts                                                     # unit test harness
playwright.config.ts                                                                  # e2e (reuse existing dep)
.github/workflows/ci.yml                                                              # CI
app/layout.tsx                          # root: fonts (Geist), <html>, theme class
app/globals.css                         # Tailwind v4 import + design tokens (CSS vars, dark/light)
app/page.tsx                            # redirect "/" -> default locale
app/[lang]/layout.tsx                   # per-locale shell (nav + lang switcher + footer)
app/[lang]/page.tsx                     # home: composes sections
middleware.ts                           # Accept-Language -> /en or /zh redirect
lib/i18n/config.ts                      # locales = ["en","zh"], default
lib/i18n/dictionaries.ts                # getDictionary(lang) loader
lib/i18n/dictionaries/en.ts             # EN UI strings
lib/i18n/dictionaries/zh.ts             # 中文 UI strings
lib/content/projects.ts                 # Project type + bilingual project data (migrated + corrected)
components/site/site-nav.tsx            # name + EN/中 switch + theme toggle
components/site/site-footer.tsx         # links + colophon line
components/site/theme-toggle.tsx        # dark/light toggle (no flash)
components/home/hero.tsx                # positioning line + status
components/home/selected-work.tsx       # EDITORIAL INDEX (composition A)
components/home/how-i-work.tsx          # principles, restrained
components/home/now-section.tsx         # present-tense line
components/home/links-section.tsx       # GitHub / email / socials
public/avatar.png                       # migrated from src/assets/avatar.png
tests/unit/projects.test.ts             # data integrity + anonymization guard
tests/unit/selected-work.test.tsx       # editorial index renders correctly
tests/e2e/home.spec.ts                  # bilingual smoke + no-leak assertions
```

Removed: `src/` (Astro pages/components/layouts/styles), `astro.config.mjs`, Astro deps, old `tests/homepage.test.mjs`. Migrated content is read out of `src/` first, then `src/` is deleted.

---

## Task 0: Salvage current copy, then remove Astro

**Files:** Read `src/pages/index.astro`, `src/pages/zh.astro`, `src/data/projects*.ts`; Modify `.gitignore`; Delete Astro app.

- [ ] **Step 1: Extract copy** — Read `src/pages/index.astro` and `src/pages/zh.astro`; copy the hero positioning line, status line, "How I Work" principles, Now text, and links into a scratch note (paste into the relevant component tasks below). Read `src/data/projects.ts` + `projects-zh.ts` for the `Project` shape and per-project prose.

- [ ] **Step 2: Migrate the avatar**

Run: `mkdir -p public && git mv src/assets/avatar.png public/avatar.png`

- [ ] **Step 3: Ignore tool dirs**

Append to `.gitignore` (if absent): `.serena/` and Next.js's `.next/`, `next-env.d.ts`, `/coverage`, `/test-results`, `/playwright-report`.

- [ ] **Step 4: Remove Astro app + config + old test**

Run: `git rm -r src astro.config.mjs tests/homepage.test.mjs && git rm --cached package-lock.json`
(Keep `docs/`, `screenshot.js`, `public/`, `.vscode/`.)

- [ ] **Step 5: Commit the salvage**

```bash
git add -A
git commit -m "chore: remove Astro app, migrate avatar, prep for Next.js rebuild"
```

---

## Task 1: Scaffold Next.js 16 + tooling

**Files:** Create `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`.

- [ ] **Step 1: Scaffold in place** — Run the official scaffold into a temp dir then move files in (avoids the interactive prompt clobbering `docs/`/`.git`):

```bash
npx create-next-app@latest /tmp/pf-scaffold --ts --app --tailwind --eslint --no-src-dir --import-alias "@/*" --turbopack --use-npm --skip-git
rsync -a --exclude node_modules --exclude .git /tmp/pf-scaffold/ ./
rm -rf /tmp/pf-scaffold
```

- [ ] **Step 2: Add runtime + dev deps**

```bash
npm i geist motion
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
# playwright is already present; ensure browsers:
npx playwright install --with-deps chromium
```

- [ ] **Step 3: Enable Cache Components + strict TS** — Edit `next.config.ts`:

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  cacheComponents: true,
  images: { formats: ["image/avif", "image/webp"] },
};
export default nextConfig;
```

Ensure `tsconfig.json` has `"strict": true` and `"noUncheckedIndexedAccess": true`.

- [ ] **Step 4: Wire test scripts** — In `package.json` `scripts`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`, `"typecheck": "tsc --noEmit"`, `"lint": "next lint"`.

- [ ] **Step 5: Vitest config** — Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Create `vitest.setup.ts`: `import "@testing-library/jest-dom/vitest";`

- [ ] **Step 6: Verify build + dev boot**

Run: `npm run build` → Expected: succeeds. Run `npm run dev` briefly, curl `http://localhost:3000` → Expected: 200.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 16 app with Tailwind, Geist, vitest, playwright"
```

---

## Task 2: Design tokens, fonts, themes

**Files:** Modify `app/layout.tsx`, `app/globals.css`.

- [ ] **Step 1: Fonts in root layout** — `app/layout.tsx` loads Geist Sans + Mono and sets the theme-safe `<html>`:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zhou Le — Agent Product Engineering",
  description: "I build agent workflows that survive the edge between demo and product.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Tokens + theme in `app/globals.css`** — Tailwind v4 `@import "tailwindcss";` then the synthesized dark/cold gene (near-black canvas, surface ladder, hairline, one restrained accent, mono eyebrow). Define `:root` (dark default) and `.light` overrides:

```css
@import "tailwindcss";

:root {
  --canvas: #0a0a0b;        --surface-1: #141416;     --surface-2: #1a1a1d;
  --hairline: #232327;      --ink: #ededed;           --ink-muted: #a0a0a6;
  --ink-subtle: #6c6c72;    --accent: #e0a878;        /* restrained signature; tune later */
  --on-accent: #1a1206;
  --font-sans: var(--font-geist-sans); --font-mono: var(--font-geist-mono);
}
.light {
  --canvas: #faf9f7; --surface-1: #ffffff; --surface-2: #f3f1ec;
  --hairline: #e4e1da; --ink: #18181a; --ink-muted: #55555c; --ink-subtle: #8a8a90;
  --accent: #b4632c; --on-accent: #fff;
}
@theme inline {
  --color-canvas: var(--canvas); --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2); --color-hairline: var(--hairline);
  --color-ink: var(--ink); --color-ink-muted: var(--ink-muted);
  --color-ink-subtle: var(--ink-subtle); --color-accent: var(--accent);
  --font-sans: var(--font-sans); --font-mono: var(--font-mono);
}
body { background: var(--canvas); color: var(--ink); font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

- [ ] **Step 3: Verify** — `npm run build` passes; `npm run dev`, confirm dark canvas renders. Commit: `git commit -am "feat: design tokens, Geist fonts, dark/light themes"`.

---

## Task 3: i18n foundation (`[lang]` + dictionaries + switcher)

**Files:** Create `lib/i18n/config.ts`, `lib/i18n/dictionaries.ts`, `lib/i18n/dictionaries/{en,zh}.ts`, `middleware.ts`, `app/[lang]/layout.tsx`, `components/site/site-nav.tsx`, `components/site/theme-toggle.tsx`, `app/page.tsx`. Delete the scaffold's `app/page.tsx` content (replaced).

- [ ] **Step 1: Locale config** — `lib/i18n/config.ts`:

```ts
export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}
```

- [ ] **Step 2: Write the failing dictionary test** — `tests/unit/i18n.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";

describe("dictionaries", () => {
  it("en and zh expose the same keys", async () => {
    const en = await getDictionary("en");
    const zh = await getDictionary("zh");
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
    expect(en.nav.work).toBeTruthy();
    expect(zh.nav.work).toBeTruthy();
  });
});
```

Run: `npm test -- i18n` → Expected: FAIL (module missing).

- [ ] **Step 3: Implement dictionaries** — `lib/i18n/dictionaries/en.ts` and `zh.ts` export the same shape (use real copy salvaged in Task 0). Minimal shape:

```ts
// en.ts
const en = {
  nav: { work: "Work", howIWork: "How I work", now: "Now", links: "Links" },
  hero: {
    line: "I build agent workflows that survive the edge between demo and product.",
    sub: "Self-hosted media agents, a recruiting representative agent, long-running ops & content pipelines — I care about state, reliability, and unattended operation.",
    status: "now — turning agents from scripts that run into products that ship",
  },
  work: { eyebrow: "SELECTED WORK", caseStudy: "case study" },
  // ...howIWork[], now, links — fill from src/pages/index.astro
} as const;
export type Dictionary = typeof en;
export default en;
```

`zh.ts` mirrors with 中文 (from `src/pages/zh.astro`). `lib/i18n/dictionaries.ts`:

```ts
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
const loaders = { en: () => import("./dictionaries/en"), zh: () => import("./dictionaries/zh") } as const;
export async function getDictionary(lang: Locale): Promise<Dictionary> {
  return (await loaders[lang]()).default;
}
```

Run: `npm test -- i18n` → Expected: PASS.

- [ ] **Step 4: Middleware redirect** — `middleware.ts` redirects `/` and bare paths to a locale based on `Accept-Language`, default `en`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  if (pathname.startsWith("/_next") || pathname.includes(".")) return;
  const header = req.headers.get("accept-language") ?? "";
  const lang = header.toLowerCase().startsWith("zh") ? "zh" : defaultLocale;
  return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}`, req.url));
}
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
```

- [ ] **Step 5: Per-locale layout + nav + theme toggle + root redirect** — `app/[lang]/layout.tsx` validates lang (`notFound()` if invalid), sets `<html lang>` via generateStaticParams, renders `<SiteNav>`+children+`<SiteFooter>`. `components/site/theme-toggle.tsx` is a client component toggling `.light` on `<html>` (persist to `localStorage`, read pre-paint via an inline script to avoid flash). `app/page.tsx` → `redirect("/en")`. Add `export function generateStaticParams() { return locales.map((lang) => ({ lang })); }`.

- [ ] **Step 6: Verify + commit** — `npm run build`; `npm run dev`, visit `/` (redirects), `/en`, `/zh`, toggle theme + language. Commit: `git commit -am "feat: bilingual [lang] routing, dictionaries, theme toggle"`.

---

## Task 4: Project content model (migrated + corrected + anonymized)

**Files:** Create `lib/content/projects.ts`, `tests/unit/projects.test.ts`.

- [ ] **Step 1: Write the failing data-integrity + anonymization test** — `tests/unit/projects.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { projects } from "@/lib/content/projects";

const BANNED = [/blackwhitematch/i, /bwwm/i, /bwminsights/i, /sogo/i, /mailcow/i,
  /media\.dirtyfancy\.sbs/i, /successfulmatch/i];

describe("projects data", () => {
  it("has the flagship first and 4 entries", () => {
    expect(projects).toHaveLength(4);
    expect(projects[0].id).toBe("mediary-scout");
    expect(projects[0].flagship).toBe(true);
  });
  it("every project has bilingual five-section content", () => {
    for (const p of projects) {
      for (const lang of ["en", "zh"] as const) {
        const c = p.content[lang];
        for (const k of ["whatItIs","inputsOutputs","whatMadeItHard","whatIDecided","whatChanged"] as const) {
          expect(c[k].length, `${p.id}.${lang}.${k}`).toBeGreaterThan(20);
        }
      }
    }
  });
  it("leaks no private subject matter and no nonexistent URL", () => {
    const blob = JSON.stringify(projects);
    for (const re of BANNED) expect(re.test(blob), `leaked ${re}`).toBe(false);
  });
  it("flagship links to repo + demo only", () => {
    expect(projects[0].links.demo).toBe("https://mediary.dirtyfancy.sbs");
    expect(projects[0].links.repo).toContain("github.com/fancydirty/mediary-scout");
  });
});
```

Run: `npm test -- projects` → Expected: FAIL.

- [ ] **Step 2: Implement the model + data** — `lib/content/projects.ts`. Type:

```ts
export type FiveSection = {
  whatItIs: string; inputsOutputs: string; whatMadeItHard: string;
  whatIDecided: string; whatChanged: string;
};
export type Project = {
  id: string; name: string;
  visibility: "public" | "private" | "live";
  flagship?: boolean;
  summary: { en: string; zh: string };
  tags: string[];
  metrics?: { value: string; key: string }[];
  links: { repo?: string; demo?: string; live?: string };
  content: { en: FiveSection; zh: FiveSection };
};
export const projects: Project[] = [ /* 4 entries, order: mediary-scout, adk-agent, enterprise, content */ ];
```

Fill the 4 entries from `.reference/dossiers.md`:
- `mediary-scout` (flagship:true, visibility:"public"): use the Mediary Scout dossier §4; metrics = [{value:"Next.js 16",key:"Cache Components"},{value:"~755",key:"Vitest · CI"},{value:"Postgres",key:"jsonb · resumable"},{value:"1 cmd",key:"docker compose up"}]; links {repo:"https://github.com/fancydirty/mediary-scout", demo:"https://mediary.dirtyfancy.sbs"}.
- `adk-agent` (visibility:"live"): adk-agent dossier §4; links {live:"https://agent.dirtyfancy.sbs"}.
- `enterprise-workflow` (visibility:"private", name "private enterprise workflow"): yt dossier §5 (anonymized).
- `content-pipeline` (visibility:"private", name "private content pipeline"): geo-bws dossier §5 (anonymized).
Write `zh` content by translating/adapting (existing `src/data/projects-zh.ts` covers adk-agent/enterprise/content; write Mediary Scout zh fresh from the dossier).

Run: `npm test -- projects` → Expected: PASS.

- [ ] **Step 3: Commit** — `git commit -am "feat: bilingual project content model (corrected, anonymized, flagship-first)"`.

---

## Task 5: Editorial index — "Selected Work" (composition A)

**Files:** Create `components/home/selected-work.tsx`, `tests/unit/selected-work.test.tsx`.

- [ ] **Step 1: Write the failing component test** — `tests/unit/selected-work.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SelectedWork } from "@/components/home/selected-work";
import { projects } from "@/lib/content/projects";

describe("SelectedWork (editorial index)", () => {
  it("renders an index row per project with index numbers and names", () => {
    render(<SelectedWork projects={projects} lang="en" eyebrow="SELECTED WORK" />);
    expect(screen.getByText("SELECTED WORK")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Mediary Scout")).toBeInTheDocument();
    // editorial index, not cards: no element with a card/badge-pill class
    expect(document.querySelector("[data-card]")).toBeNull();
  });
  it("marks the flagship row", () => {
    render(<SelectedWork projects={projects} lang="en" eyebrow="SELECTED WORK" />);
    expect(screen.getByText(/flagship/i)).toBeInTheDocument();
  });
});
```

Run: `npm test -- selected-work` → Expected: FAIL.

- [ ] **Step 2: Implement the editorial index** — `components/home/selected-work.tsx`. Server component: a section with a mono eyebrow, then hairline-separated rows: `grid-cols-[64px_1fr_auto]`, mono index `01..`, large name (flagship row larger + a mono `FLAGSHIP` tag, no pill), one-line summary, right-aligned mono meta (tags/status/links). Rows link to `/${lang}/work/${id}` (detail pages arrive Phase 2 — link is fine, will 404 until then; acceptable for Phase 1 skeleton, or render as non-link until Phase 2 — choose non-link `<div>` now to avoid dead links, swap to `<Link>` in Phase 2). Use Tailwind classes mapped to tokens (`text-ink`, `text-ink-subtle`, `border-hairline`, `font-mono`). No card containers, no badge pills, no four-cell metric box.

Run: `npm test -- selected-work` → Expected: PASS.

- [ ] **Step 3: Commit** — `git commit -am "feat: editorial-index Selected Work section"`.

---

## Task 6: Hero, How-I-Work, Now, Links + compose home

**Files:** Create `components/home/{hero,how-i-work,now-section,links-section}.tsx`, `components/site/site-footer.tsx`; Modify `app/[lang]/page.tsx`.

- [ ] **Step 1: Build the four sections** — Each a server component taking the `Dictionary` slice. `hero.tsx`: positioning line (large Geist, tight negative tracking), sub, mono status line. `how-i-work.tsx`: short principles list (from salvaged copy). `now-section.tsx`: present-tense line. `links-section.tsx`: GitHub (`github.com/fancydirty`), email, socials (Bilibili 380k from current site). `site-footer.tsx`: minimal links + one mono colophon line ("Built with Next.js 16 — source on GitHub").

- [ ] **Step 2: Compose the home page** — `app/[lang]/page.tsx`:

```tsx
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { projects } from "@/lib/content/projects";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { HowIWork } from "@/components/home/how-i-work";
import { NowSection } from "@/components/home/now-section";
import { LinksSection } from "@/components/home/links-section";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <main>
      <Hero dict={dict} />
      <SelectedWork projects={projects} lang={lang} eyebrow={dict.work.eyebrow} />
      <HowIWork dict={dict} />
      <NowSection dict={dict} />
      <LinksSection dict={dict} />
    </main>
  );
}
```

- [ ] **Step 3: Verify visually** — `npm run dev`; check `/en` and `/zh` render hero + editorial index + sections in dark and light; mobile width (DevTools 375px) has no overflow.

- [ ] **Step 4: Commit** — `git commit -am "feat: hero, how-i-work, now, links sections; compose bilingual home"`.

---

## Task 7: E2E smoke + CI

**Files:** Create `playwright.config.ts`, `tests/e2e/home.spec.ts`, `.github/workflows/ci.yml`.

- [ ] **Step 1: Playwright config** — `playwright.config.ts` with `webServer: { command: "npm run build && npm run start", url: "http://localhost:3000", reuseExistingServer: !process.env.CI }`, `testDir: "tests/e2e"`, chromium project.

- [ ] **Step 2: Write the e2e smoke** — `tests/e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
test("EN home shows positioning + editorial index, no leaks", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText(/demo and product/i)).toBeVisible();
  await expect(page.getByText("SELECTED WORK")).toBeVisible();
  await expect(page.getByText("Mediary Scout")).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body).not.toMatch(/blackwhitematch|bwwm|sogo|media\.dirtyfancy\.sbs/i);
});
test("zh locale renders and language switch works", async ({ page }) => {
  await page.goto("/zh");
  await expect(page).toHaveURL(/\/zh/);
});
```

Run: `npm run test:e2e` → Expected: PASS.

- [ ] **Step 3: CI workflow** — `.github/workflows/ci.yml`: on push/PR, Node 22, `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npx playwright install --with-deps chromium`, `npm run test:e2e`, `npm run build`.

- [ ] **Step 4: Commit + push branch**

```bash
git add -A && git commit -m "test: e2e home smoke + CI workflow"
git push -u origin feat/nextjs-rebuild
```

Expected: CI runs green on the branch.

---

## Self-Review (completed by plan author)

- **Spec coverage:** Phase-1 slice of spec §3 (IA: bilingual home + sections), §4 (editorial composition + dark/light gene + Geist), §6 (Next 16 Cache Components, TS strict, Tailwind+shadcn ready, a11y reduced-motion, tests+CI), §7 (feature branch, GitHub flow, real README deferred to Phase 3), §2 (corrected facts + anonymization enforced by tests). Deferred-and-noted: case-study pages, animated diagrams, embedded agent, SEO/OG, deploy (Phase 2/3).
- **No dead-link risk:** Task 5 Step 2 renders index rows as non-links in Phase 1 (detail routes arrive Phase 2) to avoid 404s.
- **Type consistency:** `Project`, `FiveSection`, `Dictionary`, `Locale`, `getDictionary`, `projects`, `SelectedWork` props consistent across Tasks 3–6.
- **Anonymization:** enforced by `tests/unit/projects.test.ts` + `tests/e2e/home.spec.ts` banned-pattern checks; `media.dirtyfancy.sbs` explicitly banned.
- **shadcn note:** Phase 1 needs no shadcn primitives yet; init deferred to first component that needs one (Phase 2 detail pages / agent panel) to avoid unused config.
