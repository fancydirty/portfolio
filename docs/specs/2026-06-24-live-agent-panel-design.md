# 站内 Live Agent 面板 · 设计 Spec

**日期**：2026-06-24
**状态**：已与作者 brainstorm 收敛（位置 / 聊天 UI / 拓扑 / 保真度 / Turnstile / 密钥来源全部定稿），可进 writing-plans。
**所属**：Portfolio 重构 Phase 3 的 sub-project A（独立 spec→plan→implement）。
**父 spec**：[`2026-06-23-portfolio-nextjs-rebuild-design.md`](2026-06-23-portfolio-nextjs-rebuild-design.md) §5.2「站内活的 agent」。本文细化并**修订**那一节的拓扑与 Turnstile 口径。

> **铁律（作者）**：代码改动一律走 GitHub（commit → push → CI → 部署），**绝不直接 hack 部署机**。env 经 Railway/Vercel dashboard 或 CLI 读写属配置，合规。

---

## 0. 目标

在作品集站内嵌一个**第一方、活的**聊天面板，让招聘方无需跳转、无需登录即可与作者的代表 agent（adk-agent 后端 `api.dirtyfancy.sbs`）对话。这是父 spec 定义的「最强证物」——证物本身就是能跑的产品面，而非一张静态卡。

**成功标准**：①adk-agent 详情页内嵌可对话面板，匿名招聘方过 Turnstile 后即可问答、SSE 流式出字；②任何后端不可达 / 探测失败场景**优雅降级为链接卡**，绝不白屏或报错；③首页一行 CTA 锚到详情页面板；④视觉为编辑式自定义皮肤（hairline / mono / 留白，无气泡阴影），不带 assistant-ui 默认皮；⑤脱敏红线词不出现在面板任何文案；⑥本地 `localhost:3000` 即可跑通活的路径（代理拓扑）。

---

## 1. 关键决策（brainstorm 收敛）

| 维度 | 决策 |
|---|---|
| **面板位置** | adk-agent 详情页为主（内嵌面板）+ 首页一行 CTA 引流 |
| **聊天 UI** | `@assistant-ui/react` **headless primitives** + 完全自定义编辑式样式 |
| **集成拓扑** | **Next.js API 路由代理**：浏览器 → portfolio 自己的 `/api/agent/*`（同源）→ 服务端 fetch `GATEWAY_URL` |
| **保真度** | **精简版**：保留代理 + 基础 SSE 流式 + Turnstile + 优雅降级；**砍掉**可恢复流 / recovery / replay |
| **Turnstile** | **必接**（生产后端 `TURNSTILE_SECRET_KEY` 已设 → 匿名会话强制人机验证） |
| **共享密钥来源** | `GATEWAY_PROXY_SECRET` 从 adk-agent 后端 Railway env 读出复用，作者零手敲 |

---

## 2. 架构与数据流（代理拓扑）

```
浏览器 (portfolio.dirtyfancy.sbs/[lang]/work/adk-agent#agent-panel)
   │  fetch('/api/agent/me' | '/api/agent/chat')      ← 同源，无浏览器 CORS
   ▼
Portfolio Next.js Route Handler（服务端，Node runtime）
   │  fetch(GATEWAY_URL + '/api/me' | '/api/chat')
   │  注入  x-gateway-secret: GATEWAY_PROXY_SECRET
   │  转发  cookie 进 / set-cookie 出 / SSE body 透传 / x-stream-id 透传
   ▼
api.dirtyfancy.sbs（adk-agent FastAPI gateway，现成，零代码改动）
```

- **同源**：浏览器只跟 portfolio 自己的 `/api/agent/*` 通信，无 CORS、无同站 cookie 要求 → 本地 `localhost:3000` 直接可跑（前提：`.env.local` 有 `GATEWAY_URL` + `GATEWAY_PROXY_SECRET`）。
- **匿名身份**：后端 `apply_user_cookie` 下发 `u_...` 匿名会话 cookie；代理路由把 `set-cookie` 透传回浏览器，后续请求把浏览器 `cookie` 带回后端。招聘方无需登录。
- **不需要** `GATEWAY_ALLOW_ORIGINS` 改动：那是「浏览器直连」拓扑（`GATEWAY_ALLOW_DIRECT_BROWSER=true`）才需要的；代理拓扑用 `GATEWAY_PROXY_SECRET` 服务端鉴权。父 spec §5.2 那条「唯一前置改动加 origin」在本拓扑下作废。

---

## 3. 组件划分（清晰边界）

| 单元 | 文件 | 职责 | 依赖 |
|---|---|---|---|
| gateway 工具 | `lib/agent/gateway.ts` | 解析 `GATEWAY_URL`；`gatewayHeaders(base?)` 注入 `x-gateway-secret`（仅当 `GATEWAY_PROXY_SECRET` 存在） | env only |
| 代理路由 · me | `app/api/agent/me/route.ts` | `GET` 转发 → gateway `/api/me`；透传 `cookie` 进、`set-cookie` 出；`cache: no-store` | gateway.ts |
| 代理路由 · chat | `app/api/agent/chat/route.ts` | `POST` 转发 SSE → gateway `/api/chat`；`runtime="nodejs"`、`dynamic="force-dynamic"`、`maxDuration=300`；透传 cookie + `set-cookie` + `x-stream-id`；流式 body 透传 | gateway.ts |
| runtime 适配 | `lib/agent/use-agent-runtime.ts` | `"use client"`；包 `@assistant-ui/react-google-adk` runtime，`api` 指向 `/api/agent/chat`；捕获 `turnstile_required` 交给 Turnstile 解算器 | assistant-ui |
| 探测 hook | `lib/agent/use-agent-availability.ts` | `"use client"`；挂载后 `fetch('/api/agent/me')` 判定 `available / unavailable / loading` | — |
| Turnstile 解算 | `lib/agent/turnstile.ts` + widget | 加载 Cloudflare Turnstile script，渲染 widget，`solveChallenge()` 返回 token；用 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | CF script |
| 面板（编辑式皮肤） | `components/agent/agent-panel.tsx` | `"use client"`；自定义 Thread UI（消息列表 / 输入 / 流式光标 / 预置开场问题）；全自定义样式 | runtime + 探测 |
| 降级卡 | `components/agent/agent-fallback.tsx` | 探测失败 / 无 JS 时渲染：「和我的代表 agent 对话 →」链 `agent.dirtyfancy.sbs` | — |
| 详情页挂载 | `app/[lang]/work/[slug]/page.tsx` | `slug === "adk-agent"` 时在 `<CaseStudy>` 后渲染 `<AgentPanelSection>`（`id="agent-panel"`） | 面板 |
| 首页 CTA | `components/home/agent-cta.tsx` + `app/[lang]/page.tsx` | 一行 mono CTA，锚 `/{lang}/work/adk-agent#agent-panel` | — |

> `CaseStudy` 保持纯净不改：面板由 `WorkPage` 条件渲染挂载，不污染通用案例组件。

---

## 4. 降级与错误处理（优雅退化）

| 触发 | 行为 |
|---|---|
| 首屏挂载 | 面板先渲染骨架 + 预置开场问题；后台 `fetch /api/agent/me` 探测 |
| 探测失败（网络 / 后端宕 / 无 secret / 非 2xx） | 整块换 `agent-fallback`：链接卡跳 `agent.dirtyfancy.sbs`。**绝不白屏 / 报错** |
| `turnstile_required` | 内联渲染 Turnstile widget → 拿 token 重发该条消息 |
| 对话中流断 / 出错 | 顶部 hairline 提示 + 「重试」按钮；**不做可恢复流**（精简版取舍） |
| 无 JS / reduced-motion | 面板是 `"use client"`，无 JS 时 SSR 直接渲染降级卡（沿用现有 diagram 的降级哲学） |

---

## 5. Turnstile（必接）

生产后端 `TURNSTILE_SECRET_KEY` 已设 → `/api/chat` 对匿名会话会返回 `{ error: "turnstile_required" }`（后端 `app.py:1189-1210`）。面板必须：

1. 捕获该响应 → 内联渲染 Cloudflare Turnstile widget（`NEXT_PUBLIC_TURNSTILE_SITE_KEY`）。
2. 用户完成挑战拿到 token → 把 `turnstileToken` 放进 `/api/agent/chat` 请求体重发（后端 `ChatRequest.turnstile_token`，alias `turnstileToken`，`app.py:120`）。
3. **前置（dashboard 配置，合铁律）**：
   - 取 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`（公开 site key）——复用 adk-agent 前端现有的，从其 Vercel env 或 Cloudflare Turnstile 后台取。
   - 把 `portfolio.dirtyfancy.sbs` 加进该 Turnstile widget 的允许域名（Cloudflare 后台）；`localhost` 一般默认放行，可本地测。

---

## 6. 环境变量（仅 dashboard/CLI 配置）

| 变量 | 位置 | 值 / 来源 |
|---|---|---|
| `GATEWAY_URL` | Vercel 服务端 env + `.env.local` | `https://api.dirtyfancy.sbs` |
| `GATEWAY_PROXY_SECRET` | Vercel 服务端 env + `.env.local` | **从后端 Railway 读出复用**：`railway variables --service backend --kv \| grep GATEWAY_PROXY_SECRET`（已确认 key 存在、CLI 可读、作者已登录 `fancydirty@gmail.com`、项目 `adk-agent` 已 link） |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel public env + `.env.local` | 复用 adk-agent 前端 site key（公开值） |

`.env.local` 已被 `.gitignore` 覆盖（gitignored）。`.env.example` 新增这三个 key 的占位说明。

---

## 7. 双语文案（dict 新增）

`lib/i18n/dictionaries`（EN + zh）新增 `agent` 段：
- `panelTitle` / `inputPlaceholder` / `sendLabel`
- `presetQuestions`：例「问 mediary-scout 的架构」「按某岗位评估我的匹配度」「你做过哪些可靠性工程」（EN + zh 各一组，**不含红线词**）
- `fallbackTitle` / `fallbackCta`（链 `agent.dirtyfancy.sbs`）
- `turnstilePrompt`（「请先完成人机验证」）
- `streamError` + `retry`
- `homeCta`（首页一行引流文案）

---

## 8. 测试

- **单元（vitest）**：
  - `gateway.ts`：有 secret → 注入 `x-gateway-secret`；无 secret → 不注入。
  - `me` 路由：mock fetch，断言 `cookie` 转发进、`set-cookie` 转发出、非 2xx 透传状态码。
- **E2E（playwright，后端 mock，不打真实 gateway）**：
  - 详情页渲染面板骨架 + 预置问题。
  - 探测失败 → 降级卡含 `agent.dirtyfancy.sbs` 链接（**绿测主线**：CI 里 gateway 不可达是常态）。
  - 首页 CTA 锚点跳 `/{lang}/work/adk-agent#agent-panel`。
  - 脱敏断言：面板 DOM 不含红线词。
- **活路径**：实现期填 `.env.local` 后用 agent-browser 真起 dev server 验 Turnstile→对话→SSE 流式；CI 不依赖真后端。

---

## 9. 范围之外（YAGNI）

- 可恢复流 / stream replay / recovery（精简版砍掉）。
- 文件上传 / 图像分析 / 会话历史分页 / 多会话切换（招聘方快聊用不上）。
- 登录 / admin / `/owner` slash 命令（面板只走匿名路径）。
- 浏览器直连拓扑（`GATEWAY_ALLOW_DIRECT_BROWSER`）。

---

## 10. 下一步

1. （本 spec 通过后）用 **writing-plans** 出分步 TDD 实现计划。
2. 实现 + verification-before-completion（真起 dev server、Turnstile、SSE、降级、双语、脱敏）。
3. 收尾并入 master，随后接 sub-project E（Vercel 部署，含本面板的三个 env）。
