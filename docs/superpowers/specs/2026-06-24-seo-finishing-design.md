# Phase 3 SEO Finishing — Design Spec

**Date:** 2026-06-24
**Status:** Approved (user approved design; spec-review gate waived — user accepts at acceptance time).
**Scope:** Portfolio Phase 3 final sub-project: metadata, dynamic OG images, sitemap/robots, real README.

---

## Goal

Make the portfolio "respectable when shared, correct when searched": every page (home + 4 project details, each in en/zh) ships correct localized metadata, a branded dynamic social share card, is discoverable via sitemap/robots, and the public GitHub repo has a real README instead of the create-next-app boilerplate.

## Decisions (from brainstorming)

- **OG images:** dynamic, code-generated per page per locale (`next/og` `ImageResponse`). Not a single static image.
- **Indexing:** full open indexing (robots `allow: /`, sitemap submitted). The site is the job-hunt flagship; content is already anonymized.
- **README:** concise portfolio overview for HR/peers browsing GitHub. Public repo → anonymization redlines enforced.

## Verified technical facts (this Next version — read from `node_modules/next/dist/docs/`)

- `next/og` exports `ImageResponse`. OG file convention: `opengraph-image.tsx` in a route segment exports `alt`, `size = { width, height }`, `contentType = "image/png"`, and a default async function returning `new ImageResponse(jsx, { ...size, fonts })`.
- Fonts load via `readFile(join(process.cwd(), <path>))` → `{ name, data, style, weight }`. Geist ships **static** `.ttf` (e.g. `node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf`, `Geist-Black.ttf`, `geist-mono/GeistMono-Regular.ttf`) — satori-compatible. We copy the few weights we use into `assets/fonts/` so they are guaranteed in the serverless bundle (reading straight from `node_modules` is not reliably file-traced).
- `generateMetadata` supports `alternates: { canonical, languages: { en, zh } }` → emits `<link rel="canonical">` + `<link rel="alternate" hreflang>`. URL-based fields resolve against `metadataBase` (set once in root `app/layout.tsx`).
- `app/sitemap.ts` default-exports `(): MetadataRoute.Sitemap` returning entries `{ url, lastModified, alternates: { languages: { en, zh } } }`.
- `app/robots.ts` default-exports `(): MetadataRoute.Robots` returning `{ rules: { userAgent: "*", allow: "/" }, sitemap }`.
- ImageResponse JSX is a constrained subset: flexbox only, inline styles, no Tailwind/CSS vars. The dark brand card is hand-built with inline styles + hardcoded brand hex (the artifact has fixed colors regardless of viewer theme).

## Architecture

A small `lib/seo/` module holds everything shared, so the route files stay thin:

| Unit | Responsibility |
|---|---|
| `lib/seo/site.ts` | `SITE_URL` constant + `buildAlternates(lang, path)` → `{ canonical, languages }`. Pure, unit-tested. |
| `lib/seo/og-card.tsx` | `ogCard({ eyebrow?, title, subtitle, lang })` → the `ImageResponse` JSX element. Single source of the dark editorial card design. |
| `lib/seo/og-fonts.ts` | `loadOgFonts()` → reads `assets/fonts/*.ttf`, returns the `fonts` array for `ImageResponse` (Geist Medium/Black + Geist Mono). |

Route files that consume them:

| File | Action |
|---|---|
| `app/layout.tsx` | Add `metadataBase`; fix the stale title/description to neutral site defaults. |
| `app/[lang]/layout.tsx` | Add `generateMetadata`: localized title/description (from `dict.seo`), `alternates` via `buildAlternates(lang, "")`, `openGraph` (type/locale/siteName/url), `twitter: { card: "summary_large_image" }`. Home inherits this. |
| `app/[lang]/page.tsx` | No metadata change needed (inherits layout). |
| `app/[lang]/work/[slug]/page.tsx` | Extend existing `generateMetadata`: keep title/description, add `alternates` via `buildAlternates(lang, \`/work/${slug}\`)` + `openGraph`. |
| `app/[lang]/opengraph-image.tsx` (new) | Home card per lang: `eyebrow` = role line, `title` = "Zhou Le", `subtitle` = localized thesis. `generateStaticParams` mirrors locales. |
| `app/[lang]/work/[slug]/opengraph-image.tsx` (new) | Project card: `eyebrow` = "SELECTED WORK"/localized, `title` = project name, `subtitle` = truncated `summary[lang]`. `generateStaticParams` mirrors page. |
| `app/sitemap.ts` (new) | Home + 4 details × {en,zh} from `projects`, with `alternates.languages`. |
| `app/robots.ts` (new) | Allow all + sitemap URL. |
| `lib/i18n/dictionaries/en.ts` + `zh.ts` | Add `seo: { homeTitle, homeDescription, ogEyebrow, ogSubtitle, workEyebrow }`. |
| `README.md` | Replace boilerplate with concise overview. |
| `public/` | Delete create-next-app leftovers: `next.svg`, `vercel.svg`, `window.svg`, `globe.svg`, `file.svg`. Keep `avatar.png`, `favicon.*`. |
| `assets/fonts/` (new) | Copied Geist `.ttf` weights used by OG cards. |

## OG card design

1200×630, dark editorial (matches the site): bg `#161109`, surface stroke `#33281a`; amber accent rule `#e0a878`; serif-ish title in Geist Black `#f1e7d8`; subtitle Geist Medium `#cdbfad`; mono footer (Geist Mono) — left `portfolio.dirtyfancy.sbs` in accent, right a role/name label in `#7d7060`; a hairline divider above the footer. Home card leads with the name; project card leads with a small mono `SELECTED WORK` eyebrow then the project name. (Mockup approved in chat.)

## i18n copy (new `dict.seo`)

- `homeTitle` — en: `Zhou Le — Agent Product Engineering`; zh: `周乐 — Agent 产品工程`.
- `homeDescription` — en: the babysit/evidence thesis; zh: the mirrored thesis.
- `ogEyebrow` — en: `AGENT PRODUCT ENGINEERING`; zh kept latin or localized.
- `ogSubtitle` — the localized one-line thesis used on the home OG card.
- `workEyebrow` — en: `SELECTED WORK`; zh: `精选作品`.

(Exact strings finalized in the plan; both locales must stay key-identical — `tests/unit/i18n.test.ts` enforces it.)

## Testing

- **Unit:** `lib/seo/site.ts` — `buildAlternates` canonical + languages for home and a work path, both locales; `SITE_URL` is absolute https. `app/sitemap.ts` — returns 10 entries (home×2 + 4 projects×2) with correct URLs + language alternates. `app/robots.ts` — allows `/`, sitemap URL absolute. i18n parity test covers the new `seo` keys automatically.
- **Redline guard:** extend the existing leak test to assert the README and the rendered `seo`/OG copy contain none of the redline terms (blackwhitematch, bwwm, interracial, sogo, mailcow, successfulmatch, postiz, media.dirtyfancy.sbs).
- **OG render:** not unit-tested (renders to PNG). Verified by `npm run build` succeeding (static OG generation runs at build) + a curl smoke that `/<lang>/opengraph-image` and `/<lang>/work/<slug>/opengraph-image` return `image/png` 200 against the prod deploy. Author eyeballs one real share.
- **e2e:** extend `home.spec.ts` / `work.spec.ts` to assert `<meta property="og:image">`, `<link rel="canonical">`, and an `hreflang` alternate are present on home and a detail page.
- All existing gates stay green: `tsc --noEmit`, full vitest, eslint, build, Playwright e2e.

## Scope / YAGNI

- No JSON-LD / structured data, no Google Search Console wiring, no per-project custom artwork, no `manifest.ts`/PWA, no twitter-image separate from opengraph-image (Next reuses OG for Twitter via the card type). These are explicitly out.
- README is concise (option A), not a case-study (C).

## Iron-rule / constraints

- All code changes via GitHub (commit → push → CI → Vercel). Vercel project `website` (`prj_ZZSz0G8mlN2L2kwRkjxTnJRx00MA`, team `team_oeVWMFfwtCnrNbQ0AhE1U0ev`), domain `portfolio.dirtyfancy.sbs`.
- Public repo → README + all public copy obey anonymization redlines. Mediary Scout public terms (115/Quark/media-library/cloud-drive) allowed. Real name Zhou Le / 周乐 allowed.
