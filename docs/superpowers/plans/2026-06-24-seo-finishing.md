# Phase 3 SEO Finishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship correct localized metadata, branded dynamic OG share images, sitemap/robots, and a real README for the portfolio.

**Architecture:** A small `lib/seo/` module holds shared logic (site URL + alternates helper, OG card JSX, OG font loader) so the route/layout files stay thin. Metadata uses Next's `generateMetadata` + `metadataBase`; OG images use `next/og` `ImageResponse` via the `opengraph-image.tsx` file convention; sitemap/robots use Next file conventions.

**Tech Stack:** Next.js 16 App Router (async `params`), React 19, TypeScript strict, `next/og` (satori), Geist fonts (static `.ttf`), Vitest + Playwright.

**Source spec:** `docs/superpowers/specs/2026-06-24-seo-finishing-design.md`

---

## Key decisions locked for this plan

- **OG cards are English-only** (both locales render the same English card). Reason: satori renders text with the bundled Latin Geist fonts; Chinese would need a CJK font + glyph subsetting (heavy, maintenance-prone). The HTML `<title>`/description stay fully bilingual; only the share *image* is English. Flagged for author acceptance.
- **OG fonts:** Geist Black (900, title), Geist Medium (500, subtitle), Geist Mono Regular (400, eyebrow/footer). Copied into `assets/fonts/` so they are bundled into the serverless function (reading from `node_modules` is not reliably file-traced).
- **Async params:** this Next version makes route `params` a `Promise` (see existing `page.tsx`). Every new route/layout awaits `params`.
- `SITE_URL = "https://portfolio.dirtyfancy.sbs"`.

## Verified facts (from `node_modules/next/dist/docs/`)

- `opengraph-image.tsx` exports `alt`, `size`, `contentType`, optional `generateStaticParams`, and a default async fn returning `new ImageResponse(jsx, { ...size, fonts })`. Fonts: `{ name, data, weight, style }`, `data` from `readFile(join(process.cwd(), path))`.
- `generateMetadata` `alternates: { canonical, languages }` → `<link rel="canonical">` + `hreflang`; relative URLs resolve against `metadataBase`.
- The file-convention `opengraph-image` auto-injects `<meta property="og:image">` for its segment; `generateMetadata`'s `openGraph` (without `images`) merges and keeps it.
- `sitemap.ts` → `MetadataRoute.Sitemap`; `robots.ts` → `MetadataRoute.Robots`.
- Static Geist `.ttf`: `node_modules/geist/dist/fonts/geist-sans/Geist-Black.ttf`, `Geist-Medium.ttf`, `geist-mono/GeistMono-Regular.ttf`.

## File Structure

| File | Responsibility |
|---|---|
| `lib/seo/site.ts` (new) | `SITE_URL` + `buildAlternates(lang, path)`. Pure. |
| `lib/seo/og-fonts.ts` (new) | `loadOgFonts()` → `ImageResponse` fonts array from `assets/fonts/`. |
| `lib/seo/og-card.tsx` (new) | `ogCard({ eyebrow, title, subtitle })` → the dark card `ReactElement`. |
| `assets/fonts/*.ttf` (new) | Copied Geist Black/Medium + Geist Mono Regular. |
| `app/layout.tsx` (modify) | `metadataBase` + fixed default title/description. |
| `app/[lang]/layout.tsx` (modify) | `generateMetadata`: localized title/desc + alternates + openGraph + twitter. |
| `app/[lang]/work/[slug]/page.tsx` (modify) | Extend `generateMetadata` with alternates + openGraph. |
| `app/[lang]/opengraph-image.tsx` (new) | Home OG card (English). |
| `app/[lang]/work/[slug]/opengraph-image.tsx` (new) | Project OG card (English). |
| `app/sitemap.ts` (new) | 10 entries (home + 4 projects)×2 locales. |
| `app/robots.ts` (new) | Allow all + sitemap. |
| `lib/i18n/dictionaries/en.ts` + `zh.ts` (modify) | Add `seo: { homeTitle, homeDescription }`. |
| `README.md` (replace) | Concise portfolio overview. |
| `public/` (clean) | Delete create-next-app SVGs. |
| Tests | `tests/unit/seo-site.test.ts`, `tests/unit/sitemap.test.ts`, `tests/unit/robots.test.ts`, `tests/unit/redlines.test.ts`; extend `tests/e2e/home.spec.ts`. |

---

## Task 1: `lib/seo/site.ts` — SITE_URL + alternates helper

**Files:**
- Create: `lib/seo/site.ts`
- Test: `tests/unit/seo-site.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/seo-site.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SITE_URL, buildAlternates } from "@/lib/seo/site";

describe("SITE_URL", () => {
  it("is an absolute https URL with no trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});

describe("buildAlternates", () => {
  it("builds canonical + both language alternates for the home path", () => {
    expect(buildAlternates("en", "")).toEqual({
      canonical: "/en",
      languages: { en: "/en", zh: "/zh" },
    });
  });

  it("builds canonical + alternates for a work path", () => {
    expect(buildAlternates("zh", "/work/mediary-scout")).toEqual({
      canonical: "/zh/work/mediary-scout",
      languages: {
        en: "/en/work/mediary-scout",
        zh: "/zh/work/mediary-scout",
      },
    });
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run tests/unit/seo-site.test.ts`
Expected: FAIL — `Cannot find module '@/lib/seo/site'`.

- [ ] **Step 3: Implement**

Create `lib/seo/site.ts`:

```ts
import type { Locale } from "@/lib/i18n/config";

/** Canonical production origin. No trailing slash. */
export const SITE_URL = "https://portfolio.dirtyfancy.sbs";

/**
 * Build the `alternates` block for `generateMetadata`: a canonical pointing at
 * the current locale, plus `hreflang` links to every locale of the same page.
 * `path` is "" for the home page or "/work/<slug>" for a detail page. URLs are
 * relative — Next resolves them against `metadataBase`.
 */
export function buildAlternates(lang: Locale, path: string) {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      en: `/en${path}`,
      zh: `/zh${path}`,
    },
  };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run tests/unit/seo-site.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/seo/site.ts tests/unit/seo-site.test.ts
git commit -m "feat(seo): SITE_URL + buildAlternates helper"
```

---

## Task 2: Dictionary `seo` slice (en + zh)

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts` (after the `agent` object's closing brace, before `themeToggle`)
- Modify: `lib/i18n/dictionaries/zh.ts` (same location)

- [ ] **Step 1: Add the `seo` slice to EN**

In `lib/i18n/dictionaries/en.ts`, find the end of the `agent: { ... }` object (the line `  },` immediately before `  themeToggle: {`) and insert a new `seo` object between them:

```ts
  seo: {
    homeTitle: "Zhou Le — Agent Product Engineering",
    homeDescription:
      "I build agents you don't have to babysit — they act on evidence, not vibes. Flagship: Mediary Scout, an agent-driven self-hosted media library.",
  },
  themeToggle: {
```

- [ ] **Step 2: Add the `seo` slice to ZH**

In `lib/i18n/dictionaries/zh.ts`, same location:

```ts
  seo: {
    homeTitle: "周乐 — Agent 产品工程",
    homeDescription:
      "我做不用你盯着的 agent——它凭证据行动，而不是凭感觉。旗舰 Mediary Scout：agent 驱动的自部署媒体库。",
  },
  themeToggle: {
```

- [ ] **Step 3: Run the i18n parity + typecheck**

Run: `npx vitest run tests/unit/i18n.test.ts && npx tsc --noEmit`
Expected: PASS — en/zh keys identical; `Dictionary` type now includes `seo`.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/zh.ts
git commit -m "feat(i18n): seo.homeTitle / seo.homeDescription in en + zh"
```

---

## Task 3: Root `metadataBase` + `[lang]` layout metadata

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/[lang]/layout.tsx`

- [ ] **Step 1: Rewrite the root layout metadata**

Replace the `metadata` export in `app/layout.tsx` (lines 4-7) with:

```ts
import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zhou Le — Agent Product Engineering",
  description:
    "I build agents you don't have to babysit — they act on evidence, not vibes.",
};
```

(Keep the existing `RootLayout` function below unchanged.)

- [ ] **Step 2: Add `generateMetadata` to the `[lang]` layout**

In `app/[lang]/layout.tsx`, add these imports at the top (alongside the existing ones):

```ts
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo/site";
```

Then add this exported function above `LangLayout` (after `generateStaticParams`):

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { seo } = await getDictionary(lang);
  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
    alternates: buildAlternates(lang, ""),
    openGraph: {
      type: "website",
      siteName: "Zhou Le",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      url: `/${lang}`,
      title: seo.homeTitle,
      description: seo.homeDescription,
    },
    twitter: { card: "summary_large_image" },
  };
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx "app/[lang]/layout.tsx"
git commit -m "feat(seo): metadataBase + localized home metadata (canonical/hreflang/openGraph)"
```

---

## Task 4: Detail page metadata (alternates + openGraph)

**Files:**
- Modify: `app/[lang]/work/[slug]/page.tsx` (the `generateMetadata` function, lines 12-21)

- [ ] **Step 1: Extend `generateMetadata`**

Add the import at the top of `app/[lang]/work/[slug]/page.tsx`:

```ts
import { buildAlternates } from "@/lib/seo/site";
```

Replace the body of `generateMetadata` (currently returning `{ title, description }`) so the return is:

```ts
  const { lang, slug } = await params;
  const p = projects.find((x) => x.id === slug);
  if (!p || !isLocale(lang)) return {};
  const title = `${p.name} — Zhou Le`;
  return {
    title,
    description: p.summary[lang],
    alternates: buildAlternates(lang, `/work/${slug}`),
    openGraph: {
      type: "article",
      siteName: "Zhou Le",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      url: `/${lang}/work/${slug}`,
      title,
      description: p.summary[lang],
    },
    twitter: { card: "summary_large_image" },
  };
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add "app/[lang]/work/[slug]/page.tsx"
git commit -m "feat(seo): detail-page canonical/hreflang/openGraph"
```

---

## Task 5: OG fonts + card builder

**Files:**
- Create: `assets/fonts/Geist-Black.ttf`, `assets/fonts/Geist-Medium.ttf`, `assets/fonts/GeistMono-Regular.ttf` (copied)
- Create: `lib/seo/og-fonts.ts`
- Create: `lib/seo/og-card.tsx`

- [ ] **Step 1: Copy the font files into the repo**

Run:

```bash
mkdir -p assets/fonts
cp node_modules/geist/dist/fonts/geist-sans/Geist-Black.ttf assets/fonts/
cp node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf assets/fonts/
cp node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf assets/fonts/
ls assets/fonts/
```

Expected: three `.ttf` files listed.

- [ ] **Step 2: Implement the font loader**

Create `lib/seo/og-fonts.ts`:

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Load the Geist fonts used by the OG cards as an `ImageResponse` `fonts` array.
 * Files live in `assets/fonts/` (copied from the `geist` package) so they are
 * bundled into the serverless function; `process.cwd()` is the project root.
 */
export async function loadOgFonts() {
  const dir = join(process.cwd(), "assets", "fonts");
  const [black, medium, mono] = await Promise.all([
    readFile(join(dir, "Geist-Black.ttf")),
    readFile(join(dir, "Geist-Medium.ttf")),
    readFile(join(dir, "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Geist", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    {
      name: "Geist Mono",
      data: mono,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}
```

- [ ] **Step 3: Implement the card builder**

Create `lib/seo/og-card.tsx`:

```tsx
import type { ReactElement } from "react";

/**
 * The portfolio's dark editorial OG card (1200×630). Built with the inline-style
 * flexbox subset `next/og`/satori supports — no Tailwind, no CSS variables; the
 * artifact has fixed brand colors regardless of viewer theme. `eyebrow` is a
 * small mono kicker, `title` the headline, `subtitle` one supporting line.
 */
export function ogCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#161109",
        padding: "72px 80px",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ width: 56, height: 5, background: "#e0a878", marginBottom: 40 }} />
        <div
          style={{
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 22,
            letterSpacing: 4,
            color: "#7d7060",
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 900,
            fontSize: 84,
            color: "#f1e7d8",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 500,
            fontSize: 34,
            color: "#cdbfad",
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #2c2318",
          paddingTop: 28,
          fontFamily: "Geist Mono",
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex", color: "#e0a878", letterSpacing: 1 }}>
          portfolio.dirtyfancy.sbs
        </div>
        <div style={{ display: "flex", color: "#7d7060", letterSpacing: 1 }}>
          Zhou Le
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/fonts lib/seo/og-fonts.ts lib/seo/og-card.tsx
git commit -m "feat(seo): OG card builder + Geist font loader"
```

---

## Task 6: Home OG image route

**Files:**
- Create: `app/[lang]/opengraph-image.tsx`

- [ ] **Step 1: Implement the route**

Create `app/[lang]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { locales } from "@/lib/i18n/config";
import { ogCard } from "@/lib/seo/og-card";
import { loadOgFonts } from "@/lib/seo/og-fonts";

export const alt = "Zhou Le — Agent Product Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// English-only card (both locales). The page metadata stays bilingual; only the
// share image is English, to avoid bundling a CJK font into satori.
export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    ogCard({
      eyebrow: "AGENT PRODUCT ENGINEERING",
      title: "Zhou Le",
      subtitle:
        "Agents you don't have to babysit — they act on evidence, not vibes.",
    }),
    { ...size, fonts },
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add "app/[lang]/opengraph-image.tsx"
git commit -m "feat(seo): home OG image route"
```

---

## Task 7: Project OG image route

**Files:**
- Create: `app/[lang]/work/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Implement the route**

Create `app/[lang]/work/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { locales } from "@/lib/i18n/config";
import { projects } from "@/lib/content/projects";
import { ogCard } from "@/lib/seo/og-card";
import { loadOgFonts } from "@/lib/seo/og-fonts";

export const alt = "Selected work — Zhou Le";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    projects.map((p) => ({ lang, slug: p.id })),
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// English-only card (uses summary.en regardless of locale; project names are
// already English). See the home route for the CJK rationale.
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  const fonts = await loadOgFonts();
  return new ImageResponse(
    ogCard({
      eyebrow: "SELECTED WORK",
      title: project?.name ?? "Zhou Le",
      subtitle: project ? truncate(project.summary.en, 120) : "",
    }),
    { ...size, fonts },
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add "app/[lang]/work/[slug]/opengraph-image.tsx"
git commit -m "feat(seo): per-project OG image route"
```

---

## Task 8: `sitemap.ts`

**Files:**
- Create: `app/sitemap.ts`
- Test: `tests/unit/sitemap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/sitemap.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { projects } from "@/lib/content/projects";

describe("sitemap", () => {
  const entries = sitemap();

  it("has one entry per page per locale (home + projects)", () => {
    expect(entries).toHaveLength((projects.length + 1) * 2);
  });

  it("uses absolute https URLs under the production origin", () => {
    for (const e of entries) {
      expect(e.url).toMatch(/^https:\/\/portfolio\.dirtyfancy\.sbs\/(en|zh)/);
    }
  });

  it("includes the flagship project for both locales with language alternates", () => {
    const ms = entries.filter((e) => e.url.endsWith("/work/mediary-scout"));
    expect(ms).toHaveLength(2);
    expect(ms[0]!.alternates?.languages).toMatchObject({
      en: "https://portfolio.dirtyfancy.sbs/en/work/mediary-scout",
      zh: "https://portfolio.dirtyfancy.sbs/zh/work/mediary-scout",
    });
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run tests/unit/sitemap.test.ts`
Expected: FAIL — `Cannot find module '@/app/sitemap'`.

- [ ] **Step 3: Implement**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { projects } from "@/lib/content/projects";
import { SITE_URL } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...projects.map((p) => `/work/${p.id}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: new Date("2026-06-24"),
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          zh: `${SITE_URL}/zh${path}`,
        },
      },
    })),
  );
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run tests/unit/sitemap.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts tests/unit/sitemap.test.ts
git commit -m "feat(seo): sitemap.ts (home + projects × locales, with hreflang)"
```

---

## Task 9: `robots.ts`

**Files:**
- Create: `app/robots.ts`
- Test: `tests/unit/robots.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/robots.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  const r = robots();

  it("allows all crawlers at the root", () => {
    expect(r.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });

  it("points at the absolute sitemap URL", () => {
    expect(r.sitemap).toBe("https://portfolio.dirtyfancy.sbs/sitemap.xml");
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run tests/unit/robots.test.ts`
Expected: FAIL — `Cannot find module '@/app/robots'`.

- [ ] **Step 3: Implement**

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run tests/unit/robots.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/robots.ts tests/unit/robots.test.ts
git commit -m "feat(seo): robots.ts (open indexing + sitemap)"
```

---

## Task 10: README + clean `public/` + redline guard

**Files:**
- Replace: `README.md`
- Delete: `public/next.svg`, `public/vercel.svg`, `public/window.svg`, `public/globe.svg`, `public/file.svg`
- Test: `tests/unit/redlines.test.ts`

- [ ] **Step 1: Write the failing redline test**

Create `tests/unit/redlines.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REDLINE = [
  "blackwhitematch",
  "bwwm",
  "interracial",
  "sogo",
  "mailcow",
  "successfulmatch",
  "postiz",
  "media.dirtyfancy.sbs",
];

describe("README redline compliance", () => {
  it("leaks no redline terms", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8").toLowerCase();
    for (const term of REDLINE) {
      expect(readme, `leaked ${term}`).not.toContain(term);
    }
  });

  it("is not the create-next-app boilerplate", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    expect(readme).not.toContain("bootstrapped with");
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run tests/unit/redlines.test.ts`
Expected: FAIL on the second assertion — current README still contains "bootstrapped with".

- [ ] **Step 3: Replace the README**

Overwrite `README.md` with:

```markdown
# portfolio

The personal portfolio and live representative agent of **Zhou Le (周乐)** — a bilingual (English / 中文), editorially-composed site that doubles as a working agent product, not a static résumé.

**Live:** https://portfolio.dirtyfancy.sbs

## What's here

- **Editorial home + case studies.** A typographic, anti-template layout for selected work — flagship *Mediary Scout* (an agent-driven, self-hosted media library for your own cloud drives) plus three further projects, each told as a five-part case study.
- **An in-page representative agent.** A live chat panel (assistant-ui over a same-origin proxy to a separate agent gateway) that answers questions about the work using real project evidence, with session persistence and graceful degradation when the gateway is offline.
- **Architecture diagrams.** Data-driven flow diagrams rendered from a single primitive.

## Stack

- **Next.js 16** App Router, React 19, React Server Components, TypeScript (strict).
- **Tailwind v4** (CSS-first `@theme`), Geist fonts.
- **i18n** via a `[lang]` segment + plain dictionary modules (en source, zh mirror), with an Accept-Language redirect.
- **Agent UI** with `@assistant-ui/react` + the Google ADK runtime, talking to a gateway through a same-origin proxy.
- **Dynamic OG images** via `next/og`, sitemap/robots via Next file conventions.
- Deployed on **Vercel**.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000 (redirects to /en or /zh)
```

The in-page agent needs gateway env vars (`GATEWAY_URL`, `GATEWAY_PROXY_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`); without them the site renders fully and the agent panel degrades to a link.

## Checks

```bash
npm run build                       # production build
npx tsc --noEmit && npx vitest run  # types + unit tests
npm run test:e2e                    # Playwright end-to-end
```

## License

All rights reserved. Code is published for portfolio review, not for reuse.
```

- [ ] **Step 4: Delete the create-next-app SVG leftovers**

Run:

```bash
git rm public/next.svg public/vercel.svg public/window.svg public/globe.svg public/file.svg
```

Expected: five files staged for deletion. (`avatar.png`, `favicon.ico`, `favicon.svg` remain.)

- [ ] **Step 5: Run the test, verify it passes**

Run: `npx vitest run tests/unit/redlines.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Verify no source references the deleted SVGs**

Run: `grep -rn "next.svg\|vercel.svg\|window.svg\|globe.svg\|file.svg" app components lib || echo "no references"`
Expected: `no references` (the default page that referenced them was already replaced earlier in Phase 3).

- [ ] **Step 7: Commit**

```bash
git add README.md public tests/unit/redlines.test.ts
git commit -m "docs(readme): real portfolio README; drop create-next-app assets"
```

---

## Task 11: e2e metadata assertions + full gate + ship

**Files:**
- Modify: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Add a metadata assertion test**

In `tests/e2e/home.spec.ts`, append this test:

```ts
test("EN home emits canonical, hreflang, and an OG image", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/en$/,
  );
  await expect(page.locator('link[rel="alternate"][hreflang="zh"]')).toHaveAttribute(
    "href",
    /\/zh$/,
  );
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og, "og:image present").toBeTruthy();
});
```

- [ ] **Step 2: Run the full local gate**

Run:

```bash
npx tsc --noEmit && npx vitest run && npx eslint app components lib && npm run build && (lsof -ti:3000 | xargs kill -9 2>/dev/null; npm run test:e2e)
```

Expected: tsc clean; all vitest suites pass (incl. seo-site, sitemap, robots, redlines); eslint clean; **build succeeds and statically generates the OG images** (watch for `opengraph-image` entries / no satori font errors); Playwright all green including the new metadata test.

- [ ] **Step 3: Commit the e2e test**

```bash
git add tests/e2e/home.spec.ts
git commit -m "test(e2e): assert canonical/hreflang/og:image on home"
```

- [ ] **Step 4: Push (iron rule — all code via GitHub)**

```bash
git push origin master
```

- [ ] **Step 5: Confirm the Vercel deploy**

Poll the `website` project (`prj_ZZSz0G8mlN2L2kwRkjxTnJRx00MA`, team `team_oeVWMFfwtCnrNbQ0AhE1U0ev`) for the deployment of the pushed commit; wait for READY. If auto-deploy didn't fire, use the Git-source deploy REST API recorded in memory `portfolio-rebuild.md`. (Token from `~/Library/Application Support/com.vercel.cli/auth.json`.)

- [ ] **Step 6: Production smoke**

Run (against `https://portfolio.dirtyfancy.sbs`):

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://portfolio.dirtyfancy.sbs/en/opengraph-image
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://portfolio.dirtyfancy.sbs/en/work/mediary-scout/opengraph-image
curl -s https://portfolio.dirtyfancy.sbs/robots.txt
curl -s -o /dev/null -w "%{http_code}\n" https://portfolio.dirtyfancy.sbs/sitemap.xml
curl -s https://portfolio.dirtyfancy.sbs/en | grep -o 'rel="canonical"[^>]*' | head -1
```

Expected: OG routes → `200 image/png`; `robots.txt` shows `Allow: /` + sitemap line; `sitemap.xml` → 200; canonical link present.

- [ ] **Step 7: Hand to author for acceptance**

Tell the author: paste `portfolio.dirtyfancy.sbs` (and a project URL) into a link-unfurling surface (Slack/Telegram/X/WeChat) to see the OG card. Note the OG cards are **English-only by design** — flag whether they want bilingual cards (would require bundling a CJK font). Phase 3 is then complete.

---

## Self-Review

**1. Spec coverage:**
- Metadata (metadataBase, localized home, detail, alternates/hreflang, openGraph, twitter) → Tasks 3, 4. ✓
- `lib/seo/site.ts` helper → Task 1. ✓
- dict `seo` slice → Task 2 (note: spec listed `ogEyebrow/ogSubtitle/workEyebrow` but the English-only OG decision moved that copy into the routes as constants; dict carries only the bilingual HTML `homeTitle`/`homeDescription`). ✓
- OG images (dynamic, per route, card builder, font loader) → Tasks 5, 6, 7. ✓
- sitemap + robots → Tasks 8, 9. ✓
- README + clean public → Task 10. ✓
- Tests: seo-site, sitemap, robots, redlines, e2e meta → Tasks 1, 8, 9, 10, 11. i18n parity auto-covers `seo` keys (Task 2). ✓
- Redline guard extended → Task 10 (`redlines.test.ts`). ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. The CJK/English-only decision is explicit, not a placeholder. ✓

**3. Type consistency:** `buildAlternates(lang: Locale, path: string)` returns `{ canonical, languages: { en, zh } }` — used identically in Tasks 3, 4 and matched by Task 1's test. `SITE_URL` (no trailing slash) consumed in Tasks 3, 8, 9. `loadOgFonts()` returns `{ name, data, weight, style }[]` consumed by `ImageResponse` in Tasks 6, 7. `ogCard({ eyebrow, title, subtitle })` defined in Task 5, called in Tasks 6, 7 with exactly those keys. `dict.seo.homeTitle/homeDescription` defined in Task 2, read in Task 3. ✓

**Deviation from spec (intentional):** OG cards are English-only (CJK font avoidance); spec's per-locale OG copy keys collapse to in-route English constants. Bilingual HTML metadata is unaffected. Flagged to the author at Task 11 Step 7.
