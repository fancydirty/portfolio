# Portfolio → Next.js 从零重构 设计 Spec

> **给接手的 Claude(在 `projects/portfolio` 新开的会话):** 这份 spec 是另一会话(在 media-track 项目里)和作者一起 brainstorm 出来的设计结论,目的是让你**零上下文也能接手**。请按下面的「下一步」走:先就「待确认决策点」和作者过一遍(brainstorming),再用 writing-plans 出实现计划,然后 TDD/分步实现 + 真验。**作者铁律:代码改动一律走 GitHub(commit→push→CI→部署),绝不直接 hack 部署机。**

**日期**:2026-06-21
**状态**:approach 已选定(Next.js 从零重构),细节待新会话与作者确认后落实
**仓库**:`github.com/fancydirty/portfolio`(当前是 Astro 6 应用,默认分支 `master`)

---

## 1. 目标与受众(为什么做)

作者(**周乐 / Zhou Le**)在找工作,要把这个作品集的**域名直接写进简历甩给招聘方**。所以作品集有双重任务:
1. **展示项目**(内容)——用强叙事讲清楚他做过的东西有多硬核。
2. **本身就是一件能力证物**(载体)——招聘方点开的第一个站点/仓库就是它;简历口径是「Next.js 专长」,旗舰项目 media-track 也是 Next.js,**所以作品集本身也用 Next.js 重构,故事闭环、口径一致**。

⚠️**重要共识**:用 Astro 做作品集本身不丢人(选对工具的体现)。选 Next.js 不是因为 Astro low,而是为了「作品集=Next.js 能力证物 + 与简历一致」这个明确目标。重构必须**真有料**(见 §4 质量门槛),否则做个跟 Astro 没区别的纯静态站就是白费。

**成功标准**:招聘方/工程师点开后 ①第一屏就 get 到定位与亮点 ②点进项目能看到「难在哪/我怎么决策」级别的深度 ③站点本身干净、专业、响应式、加载快 ④源码仓库点开是像样的 Next.js 工程。

---

## 2. 必须保留 / 升级的现有资产(别推倒重来内容)

当前 Astro 站的**内容与叙事其实很成熟**,重构是换载体,不是丢内容。务必迁移:

- **定位句**:"I build agent workflows that survive the edge between demo and product."(中文站有对应)——这是核心人设,保留。
- **双语**:英文 `src/pages/index.astro` + 中文 `src/pages/zh.astro`,带 EN/中 切换。保留双语。
- **WorkDossier 叙事框架**(`src/components/WorkDossier.astro` / `WorkDossierZh.astro`):每个项目五段式 —— *whatItIs / inputsOutputs / whatMadeItHard / whatIDecided / whatChanged*。**这套「难在哪 + 我怎么决策」正是资深招聘方想看的,是这份作品集最值钱的部分,务必保留并做成 React 组件。**
- **项目数据**:`src/data/projects.ts`(英) / `src/data/projects-zh.ts`(中),Project 类型已定义好,迁成 TS 数据模块。
- **手绘架构图**:`src/components/{AdkAgentDiagram,GeoBwsDiagram,YTPipelineDiagram,WorkflowDiagram}.astro`(纯 SVG/CSS)。迁成 React 组件(或保留 SVG inline)。
- **个人信息 / 社交证明**:avatar(`src/assets/avatar.png`)、Bilibili 380k 粉丝徽章、各社交链接、status line。
- ⚠️**README 当前还是 Astro 脚手架默认模板**,重构后必须换成真 README。

迁移做法:新会话直接读这些旧文件挖内容,别凭空编。

---

## 3. 项目内容(展示什么)——含必须修的硬伤

当前项目列表(在 `projects.ts`):`adk-agent`、`clawd-media-track`、`private enterprise workflow`、`private content pipeline`。

### ⚠️ 头号硬伤:media-track 词条严重过时,必须重写成现状

旧词条 `clawd-media-track` 把它写成「OpenClaw 一次性技能 + SQLite + 115」——**这是旧版,严重低估**。它现在是一个完整的、已上线真验的 **Next.js 全栈产品**,应作为**旗舰主打项目**重写。新会话可直接用下面这份现状描述(作者另一会话刚深度参与了它的开发,以下属实):

> **Mediary Scout**(repo:`github.com/fancydirty/mediary-scout`;只读 Demo:`mediary.dirtyfancy.sbs`;作者自部署私有实例:`media.dirtyfancy.sbs`)
> - **是什么**:一个自部署的「媒体获取 agent」全栈应用。Monorepo:`packages/workflow`(TS 领域逻辑)+ `apps/web`(Next.js App Router)。一次 `docker compose up` 拉起 web(含进程内队列 worker)+ Postgres + 自带 PanSou;经 **Cloudflare Tunnel + Access** 无公网 IP 即可安全外网访问。
> - **核心链路**:用户搜片 → LLM agent(OpenAI 兼容,如小米 MiMo)在沙箱里 搜索(PanSou/磁力)→ 转存到网盘(115/夸克)→ 校验覆盖,全程 agent 基于「证据→事实→决策」自主判断,硬规则做成不可绕过的校验器(预算/scope/关键词必须含片名/秒传后验证)。
> - **工程深度(可作亮点)**:Next.js App Router + **PPR(cacheComponents)**;**进程内队列 worker**(instrumentation 启动);Postgres(jsonb 存快照);**多账号**(各人绑各自 115、库隔离);**获取失败恢复**(瞬时网络错退避自动重排 + 手动重试 + 通知);**启动期配置校验**(非法配置即崩);**类型感知 ESLint 进 CI**;Cloudflare(自托管 TMDB 代理 Worker + Tunnel + Access);**TDD,700+ 测试 + CI**。
> - **难在哪 / 我怎么决策**(WorkDossier 风格素材):agent 容易机械化(瞎搜、乱转、删大留小)→ 把惨痛教训本地化进 agent 提示词 + 把硬规则转成校验器;隐藏状态(应有 vs 实有=缺集)要让 agent 看得见;115 高爆炸半径操作做防护(失效 cid 静默 fallback 到账号根的坑);真验铁律(单元绿 ≠ 产品可用,坚持端到端 + 真站验证)。
> - **结果**:从「本机能跑的脚本」变成「可自部署、可公开 Demo、能端到端真验跑通真实获取」的产品。

其余项目(`adk-agent` 招聘代表 agent,live `agent.dirtyfancy.sbs`;`private enterprise workflow`;`private content pipeline`)沿用现有 WorkDossier 内容迁移即可,可顺手润色。

**(可选)元项目**:把「这个作品集本身(Next.js 重构)」也作为一个小项目展示,呼应「我用 Next.js 重做了它」。新会话与作者确认要不要。

---

## 4. 技术设计(载体)——推荐方案

> 这些是推荐默认值;§6 列出真正需要作者拍板的决策点。

- **框架**:Next.js(最新稳定版,**App Router**)+ React + **TypeScript(strict)**。作品集以内容为主 → 大部分页面静态/SSG(App Router 默认静态 + 按需 dynamic),保证加载快。
- **样式**:**Tailwind CSS + shadcn/ui**(现代、专业、招聘方熟悉的栈;比手写 CSS 更能体现工程化)。可保留当前视觉调性(深色、克制),用 shadcn 重塑。
- **动效/打磨**:**适度** —— View Transitions + 克制的入场/悬停动效(如 `motion`/Framer Motion)。体现能力但**不要炫技过度**,资深审阅者反感花哨。
- **国际化**:双语 EN + 中文。App Router 用 `[lang]` 段或 route group 实现两个 locale,保留 EN/中 切换。简单为主(就两语言,别上重型 i18n 框架)。
- **内容模型**:项目数据用 TS 模块(迁 `projects.ts`/`projects-zh.ts`);WorkDossier 做成 React 组件;架构图迁成 React/SVG 组件。
- **质量门槛(这才是「证明专业度」的关键,务必达到)**:
  - 干净的组件架构 + TS strict 无 any 滥用;
  - **响应式**(手机/平板/桌面都过关 —— 作者很在意移动端,media-track 刚踩过宽度超限的坑);
  - **可访问性 a11y**(语义标签、对比度、键盘、reduced-motion);
  - **性能**(Lighthouse 高分、图片优化用 next/image、字体优化);
  - **SEO / OG meta**(招聘方会分享链接,要有像样的 title/description/OG 图);
  - 有基本测试(作者用 TDD;至少关键组件/数据有测试)+ CI。
- **部署**:推荐 **Vercel**(Next.js 原生、免费、自定义域名最顺);CF Pages 亦可。绑一个干净子域(作者有 `dirtyfancy.sbs`)。

---

## 5. 仓库 / 交付策略

- 在**同一个仓库** `fancydirty/portfolio` 里重构:开 feature 分支,用 Next.js 应用替换 Astro 应用,**保留 git 历史**(别新建仓库丢历史)。最终合并到 `master`。
- 全程走 GitHub:commit → push → CI 绿 → 部署。**绝不直接改部署机**(作者铁律)。
- 旧 Astro 代码迁移完成、新站验收通过后再删,迁移期可暂存(如 `legacy/` 或靠 git 历史)。

---

## 6. 待确认决策点(新会话先和作者过一遍再动手)

1. **主语言**:EN 为主还是中文为主?(取决于目标是海外还是国内岗位 —— 作者没明说,需问。)
2. **部署**:Vercel 还是 Cloudflare Pages?用哪个(子)域名?
3. **视觉方向**:保留当前深色克制调性、只做工程化升级,还是想要全新视觉设计?动效到什么程度?
4. **元项目**:要不要把「作品集本身」也列为一个项目?
5. **署名**:用真名(周乐 / Zhou Le)还是匿名化?(现有站用真名 + Bilibili,但部分项目是「private/anonymous」措辞,需统一。)
6. **样式栈**:认可 Tailwind + shadcn,还是有别的偏好?

---

## 7. 下一步(给接手的 Claude)

1. 读本 spec + 旧 Astro 源码(`src/` 下的 pages/components/data)挖内容。
2. 就 §6 决策点与作者 brainstorming 收敛。
3. 用 **writing-plans** 把本设计 + 决策结论写成分步实现计划。
4. TDD / 分步实现,**verification-before-completion**(真起 dev server、真验响应式与各页、Lighthouse、双语切换),全程走 GitHub。
5. 收尾:换掉默认 README、部署、把最终域名给作者写进简历。
