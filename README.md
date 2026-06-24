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
