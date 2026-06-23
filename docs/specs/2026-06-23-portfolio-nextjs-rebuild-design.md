# Portfolio → Next.js 从零重构 · 实现级设计 Spec（已收敛）

**日期**：2026-06-23
**状态**：方向已与作者 brainstorm 收敛，approach + 视觉 + IA + 内容口径全部定稿，可进实现计划（writing-plans）。
**仓库**：`github.com/fancydirty/portfolio`（当前 Astro 6，默认分支 `master`）
**取代**：本文细化并取代 [`docs/specs/2026-06-21-portfolio-nextjs-rebuild-design.md`](2026-06-21-portfolio-nextjs-rebuild-design.md)（那份只到「approach 选定」；06-21 仍可读作背景）。

> **铁律（作者）**：代码改动一律走 GitHub（commit → push → CI → 部署），**绝不直接 hack 部署机**。

---

## 0. 这次 brainstorm 定下的关键结论（TL;DR）

1. **同仓库重构**：在 `fancydirty/portfolio` 开 feature 分支，用 Next.js 应用替换 Astro，**保留 git 历史**，最终合并 `master`。
2. **双语**：EN + 中文都做（海外+国内岗都投）。`[lang]` 路由。
3. **部署**：Vercel，绑 `portfolio.dirtyfancy.sbs`（adk-agent 身份提示词里已把此域当作作品集域名）。
4. **署名**：真名 **周乐 / Zhou Le**。
5. **样式栈**：Tailwind + shadcn/ui + **Geist 字体** + `motion`（Framer Motion）克制动效。
6. **Vercel Web Interface Guidelines**：采纳为生成期质量约束（装成 `AGENTS.md` / 规则）。
7. **Vercel DESIGN.md（黑白 Geist 品牌系统）**：只借工程纪律（间距/边框/字体/单色克制），**不照搬**视觉皮肤。
8. **Vercel Eve agent 框架**：**不加**。Eve 是建自主 agent 的框架，作品集是内容站，错配；且 Eve beta，简历级站点不押 beta。adk-agent 作为站内交互 demo 重点露出即可。
9. **视觉基因**：暗色、冷调、精确。综合 **xAI 的克制 + Linear 的层次**等原则**揉成专属语言，不克隆任何单一品牌**。深/浅色两套都做。
10. **构图（最关键的去「AI 味」决定）**：**抛弃卡片套路**（徽章药丸 + 四宫格指标盒 + 标签 chips + "read more →"），改用**编辑式 / 排版驱动**构图。详见 §4。
11. **"打成猪头"的执行口径**：往**深度 / 工艺 / 可信度**的死里做，**不往特效死里做**。资深审阅者反感炫技。
12. **不做静态自夸的"作品集本身"section**：站本身的呈现质感即证物；顶多 footer 一行 colophon 给懂行的人。

---

## 1. 目标与受众

作者周乐在找工作，要把本站域名直接写进简历甩给招聘方。作品集双重任务：
1. **展示项目**：用强叙事讲清做过的东西有多硬核。
2. **本身就是能力证物**：招聘方点开的第一个站 + 仓库就是它；简历口径「Next.js 专长」，旗舰 Mediary Scout 也是 Next.js → 作品集本身也用 Next.js 重构，故事闭环。

**成功标准**：①第一屏即 get 定位与亮点 ②点进项目能看到「难在哪 / 我怎么决策」级深度 ③站点干净专业响应式加载快 ④源码仓库点开是像样的 Next.js 工程 ⑤**整体呈现让看不懂的招聘方也"不明觉厉"**，靠质感与排版而非术语堆砌。

---

## 2. 内容真相源（已用子代理逐仓库代码级核实）

5 份代码级档案存于 `.reference/dossiers.md`（gitignored，含私有项目真实信息）。原始仓库已浅克隆到 `.reference/<repo>/`（gitignored）。**写文案一律据此，不凭空编。**

### 2.1 对 06-21 spec 的关键事实纠正
- **Mediary Scout = Next.js 16 + Cache Components**（`cacheComponents:true`），不是 15/实验 PPR。→ 本站重构**也用 Next.js 16 + Cache Components**，口径闭环。
- 测试真实数字：**~755 个 `it()` 用例 / 130 个 Vitest 文件**（"700+"属实，精确为 ~755）。
- ⚠️ **`media.dirtyfancy.sbs` 在仓库中不存在**，只有只读 Demo `mediary.dirtyfancy.sbs` 是真的。**对外不得引用那个私有实例 URL。** 旗舰对外链接只有：repo + 只读 Demo。
- 通知渠道：bark / serverchan / wecom / webhook（无 Telegram）。
- adk-agent 真实栈：FastAPI "Candidate Intelligence Gateway" 罩 Google ADK，DeepSeek-v4-flash via LiteLLM，可恢复 SSE，匿名隔离，Turnstile，招聘线索 CRM。

### 2.2 项目阵容（4 主力 + 1 前身并入叙事）
| 展示名 | 真实仓库 | 可见性 | 角色 |
|---|---|---|---|
| **Mediary Scout** | `mediary-scout` | public | **旗舰**，repo + 只读 Demo |
| **adk-agent** | `adk-agent` | private（站 live） | **站内交互 demo**，`agent.dirtyfancy.sbs` |
| **private enterprise workflow** | `yt-email-pipeline` | private | 脱敏展示 |
| **private content pipeline** | `geo-bws` | private | 脱敏展示 |
| （前身）clawd-media-track | `clawd-media-track` | public | 并入 Mediary Scout 叙事，不单列卡 |

每个项目保留 **WorkDossier 五段式**（whatItIs / inputsOutputs / whatMadeItHard / whatIDecided / whatChanged）。脱敏后的五段式文案已在 `.reference/dossiers.md` 各项目「section 5」中写好，直接迁移润色。

### 2.3 脱敏红线（私有项目，绝不可泄露到公开站）
- **geo-bws**：BlackWhiteMatch / BWWM / bwminsights.com / blackwhitematch.net / 跨种族交友 / 具体人群 / Postiz / Medium 具名渠道。
- **yt-email-pipeline**：雇主、审查人姓名、SOGo/mailcow、s.utui.cc、successfulmatch.com、家庭/个人背景、具名外部服务。
对外只描述：系统形态、状态化运营、可靠性、无人值守、QA 门——不碰主体/品牌/人物。

---

## 3. 信息架构（IA）

- **双语 `[lang]` 路由**：`/en` + `/zh`（或 route group），保留 EN/中 切换。轻量，不上重型 i18n 框架。
- **首页**（每语言）：Hero（定位句 + 现状 status 行）→ Selected Work（编辑式索引，§4）→ How I Work（工作原则，克制）→ 活的 agent CTA → Now → Links。
- **项目详情页** `/[lang]/work/[slug]`：每项目独立、可深链（符合 Vercel guideline 的 deep-link 原则），含 WorkDossier 五段式 + **放大版会动架构图** + 技术深度要点。旗舰 + adk-agent 有专属强化处理。
- **不做**：博客、简历下载页、时间线、推荐语、联系表单（YAGNI，先把单站做到无可挑剔）。

---

## 4. 视觉与构图（本次核心，去「AI 味」）

### 4.1 构图原则（结构层 —— 已与作者对齐，三版 mockup 全部通过）
**抛弃通用 AI 卡片套路。** 不要：圆角卡盒 + 徽章药丸 + 四宫格指标盒 + 标签 chips + 千篇一律"read case study →"。
改用**编辑式 / 排版驱动**：

- **首页 Selected Work = 编辑式索引（主骨架，构图 A）**：无盒子；等宽小序号（01–04）+ 大字项目名 + 一行描述 + 右侧等宽元信息（栈/状态/入口）+ 细线分隔 + 大留白；**旗舰行显著更大更重**；hover 整行轻微右移。读感像作品集目录 / changelog。
- **详情页 = Spec-sheet 文档质感（构图 B）**：左栏竖排名字+技术栈，右栏正文 + 内嵌架构链路；像工程规格书而非营销卡。
- **终端气质（构图 C）作为点缀**：用在 hero status 行、404、或 colophon；克制，不做成全站噱头。

> 判断基线：让排版、留白、细线、真实架构图承重；让"有人在认真排版"的克制感取代"问 AI 要个作品集"的卡片感。

### 4.2 视觉基因（皮肤层 —— 暗冷精确，综合非克隆）
- 近黑画布 + 表面微阶梯做深度（借 Linear 思路，非克隆其 #010102/薰衣草）。
- **一处克制的签名强调色**（实现期定，候选暖橙/冷蓝其一，全站稀用）。
- **等宽大写 eyebrow**（像代码注释 / 坐标，借 xAI 思路）做小标签 / 元信息。
- 细线（hairline）分隔，**不用阴影堆叠**。
- 字体：**Geist Sans + Geist Mono**（mono 承载技术标签/状态/序号）。display 用紧负字距。
- 深/浅色两套；尊重 `prefers-reduced-motion`。

### 4.3 动效（克制）
- View Transitions 做页面间过渡；入场/hover 微动效。
- **签名动效见 §5**。绝不炫技过度。

---

## 5. 三个签名时刻（狠在实力、克制在噪音）

1. **会动的架构图**：现有 4 张手绘 SVG（AdkAgent / GeoBws / YTPipeline / Workflow）升级为 React 组件，**滚动进入视口时数据沿箭头流动**（脉冲/粒子），演示真实链路而非装饰。各项目链路节点以 `.reference/dossiers.md` 的 diagram-ready 描述为准。尊重 reduced-motion（降级为静态）。
2. **站内活的 agent**（最强证物，非跳转）：在站内嵌**第一方聊天面板**（复用 `@assistant-ui/react`），`fetch` 带 `credentials:'include'` 直连 adk-agent 现有后端 `api.dirtyfancy.sbs`（`/api/me`、`/api/chat` SSE、可恢复流）。
   - **同站 cookie**：`portfolio.dirtyfancy.sbs` 与 `api.dirtyfancy.sbs` 同属 `dirtyfancy.sbs` → `samesite=lax` 会话 cookie 在同站请求照常带上。
   - **唯一前置改动**：把 `https://portfolio.dirtyfancy.sbs` 加进 adk-agent 后端的 `GATEWAY_ALLOW_ORIGINS`（**环境变量/配置**，非代码；走 GitHub/Railway env，遵守铁律）。
   - **优雅降级**：`/api/me` 探测失败 → 面板退回成"和我的代表 agent 对话 →"卡片跳 `agent.dirtyfancy.sbs`。最差是链接，最好是站内活的。
   - 预置开场问题（"问 mediary-scout 架构""按某岗位评估我"）让招聘方即刻 get。
3. **旗舰硬指标**：Mediary Scout 详情页克制摆出 ~755 测试 / 一行 `docker compose up` / observe-act-verify agent 循环等可信硬料。

---

## 6. 技术设计

- **框架**：Next.js 16（App Router + Cache Components）+ React + **TypeScript strict**。内容为主 → 多数页面静态/SSG，加载快。
- **样式**：Tailwind + shadcn/ui + Geist。组件架构干净、TS strict 不滥用 any。
- **国际化**：`[lang]` 段，EN + 中，轻量。
- **内容模型**：项目数据迁成 TS 模块（沿用 `projects.ts` / `projects-zh.ts` 的 `Project` 类型，按 §2 纠正与扩充：新增 Mediary Scout 旗舰、删旧 clawd-media-track 卡、字段够承载五段式+指标+链路+多链接）。WorkDossier、架构图均为 React 组件。
- **嵌入式 agent**：见 §5.2。
- **质量门槛**（证明专业度的关键，必须达到）：
  - 响应式（手机/平板/桌面全过，作者很在意移动端）；
  - a11y（语义标签、对比度、键盘、reduced-motion）；
  - 性能（Lighthouse 高分、`next/image`、字体优化）；
  - SEO / OG（像样 title/description/OG 图，招聘方会分享链接）；
  - 测试 + CI（作者用 TDD；至少关键组件/数据模块有测试）；
  - 采纳 **Vercel Web Interface Guidelines**（所有状态设计、弯引号、状态不只靠颜色、足够热区、deep-link 一切）。
- **部署**：Vercel，绑 `portfolio.dirtyfancy.sbs`。

---

## 7. 仓库 / 交付策略

- 同仓库 `fancydirty/portfolio` 开 feature 分支，Next.js 应用替换 Astro，**保留 git 历史**，验收通过后合并 `master`。
- 旧 Astro 代码迁移完成、新站验收前可暂存（`legacy/` 或靠 git 历史），通过后删。
- 全程 GitHub：commit → push → CI 绿 → 部署。**绝不改部署机。**
- ⚠️ 现 README 是 Astro 脚手架默认模板，重构后必须换成真 README。
- `.reference/`、`.superpowers/` 已在 `.gitignore`。

---

## 8. 仍待实现期微决策（不阻塞，作者可随时介入，否则我按推荐执行）

1. 签名强调色最终取值（暖橙 vs 冷蓝 vs 其它）——实现期出几版定。
2. `[lang]` 用路径段还是 route group——实现期按 Next 16 最佳实践定。
3. 嵌入式 agent 面板的露出位置（首页常驻 vs 详情页 vs 浮层）——实现期定，默认 adk-agent 详情页 + 首页 CTA。
4. 主语言展示默认（EN-first 还是按浏览器语言）——默认按 `Accept-Language` 重定向，可切。

---

## 9. 下一步

1. （本 spec 通过后）用 **writing-plans** 出分步实现计划。
2. TDD / 分步实现 + **verification-before-completion**（真起 dev server、真验响应式/各页/Lighthouse/双语切换/嵌入 agent 降级）。
3. 收尾：换真 README、部署、域名写进简历。
