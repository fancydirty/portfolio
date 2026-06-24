# 验收 Round-3 设计 Spec（E/F/G/H/I）

**日期**：2026-06-24
**状态**：方向与作者对齐（G/H mockup 已通过；F 文案据 mediary-scout 定位草拟，待作者过目）。
**所属**：Portfolio Phase 3 验收第三轮。五项独立、可一并实现一次部署。

> 铁律：代码走 GitHub。脱敏红线只约束私有项目（geo-bws / yt-email-pipeline）；Mediary Scout 是**公开**旗舰，其「网盘/115/夸克/媒体库」措辞可用（Selected Work 行已在用）。

---

## E — 索引行 hover 文字抖动（bug）
`components/home/selected-work.tsx:42` 用 `transition-[padding] hover:pl-2`——padding 变化触发 reflow → 行内文字重排抖动。改为 **transform 位移**（不触发布局）：`transition-transform hover:translate-x-2`（保留 `motion-safe` 语义；reduced-motion 下 transform 也应被现有全局规则禁用，但 translate 不抖，无副作用）。

## I — 自定义滚动条（polish）
聊天框消息区 + SVG 放大灯箱用的是默认丑滚动条。在 `globals.css` 加一个 `.scroll-thin` 工具类：
```css
.scroll-thin { scrollbar-width: thin; scrollbar-color: var(--hairline) transparent; }
.scroll-thin::-webkit-scrollbar { width: 8px; height: 8px; }
.scroll-thin::-webkit-scrollbar-track { background: transparent; }
.scroll-thin::-webkit-scrollbar-thumb { background: var(--hairline); border-radius: 4px; }
.scroll-thin::-webkit-scrollbar-thumb:hover { background: var(--ink-subtle); }
```
应用到：`agent-thread.tsx` 的 `ThreadPrimitive.Viewport`、`diagram-zoom.tsx` 灯箱的 `overflow-auto` 容器。

## G — SVG 脉冲重设计（视觉）
当前每条 edge 一颗 `motion.circle` 圆点（土，且后台 tab rAF 冻结时停成孤点）。改为**沿连线流动的能量虚线**：每条 edge 在 hairline 底线上叠一条 **accent 虚线**，用 **CSS `@keyframes` 动画 `stroke-dashoffset`** 制造「电流流过」效果。
- 实现：`flow-diagram.tsx` 里 edge 渲染 = 底线（`#232327` 实线）+ overlay（`stroke="#e0a878"` `stroke-dasharray="7 11"` `stroke-linecap="round"`，class `flow-edge`）。
- `globals.css`：`.flow-edge { animation: flow-dash 1.1s linear infinite } @keyframes flow-dash { to { stroke-dashoffset: -18 } }`。
- 移除 `motion.circle` 脉冲。dashed edge（如 enterprise 的丢弃分支）overlay 用更稀疏的 dasharray 或不加 overlay。
- reduced-motion：现有全局 `animation:none` 规则会停掉流动，overlay 虚线静态显示（仍是 accent 虚线，不难看）。
- 健壮性：overlay 是 SVG 线，始终可见；冻结=静态虚线，绝不消失。

## H — 聊天思考流程 + 工具调用展示（功能）
痛点：首 token 前空白，显得卡死，看不到 agent 在想/调工具。ADK 后端**已经 stream** thought（reasoning）与 functionCall/Response（tool）事件，`useAdkRuntime` 已转成 message parts；我之前只渲染了 `Text`。补渲染 reasoning + tool 部件即可。
- 新增组件（移植 `.reference/adk-agent/frontend/components/assistant-ui/` 的 `reasoning.tsx`/`tool-fallback.tsx`/`tool-group.tsx`，**改成编辑式暗皮**）：
  - `components/agent/agent-reasoning.tsx`：thought 部件 → 斜体、`text-ink-subtle`、左 `border-l border-hairline pl-3` 的「思考」块；流式中带「thinking」脉动点（mockup 那个）。
  - `components/agent/agent-tool.tsx`：tool-call 部件 → 圆角 chip（`ti-tool` 图标 + 工具名 + 状态：running…/✓），`border-hairline bg-surface-2 font-mono`。绿点=成功、accent=进行中。
- `agent-thread.tsx` 的 `AssistantMessage` 把 `MessagePrimitive.Parts` 的 `components` 扩成 `{ Text: MarkdownText, Reasoning: AgentReasoning, ToolGroup: AgentToolGroup, tools: { Fallback: AgentToolFallback } }`（按 assistant-ui v0.14 实际 part 组件名为准，实现期对照 reference + 包类型）。
- 「thinking…」运行指示：assistant 消息在流式且尚无正文时显示脉动点 + "thinking"。用 reasoning 部件先出 + 一个 in-progress 指示。
- 不引入图标字体依赖：用内联 SVG 画 tool/✓ 图标（站点目前无 icon 字体）。
- 测试：渲染含 reasoning/tool 部件的 mock message → 出现思考块 + 工具 chip；纯文本消息不受影响（现有 agent-section 降级测试继续绿）。

## F — 首页文案进化（内容，据 Mediary Scout 旗舰定位重写）
当前 hero/how-i-work/now 还停在 adk-agent「招聘代表 agent 作测试用例」时期。重写为以旗舰 **Mediary Scout** 的命题为核心（证据驱动、获取=状态问题、纪律从 prompt 搬进软件、agent 隐形化、网关边界），仍是周乐的整体定位。改 `lib/i18n/dictionaries/en.ts` + `zh.ts` 的 `hero` / `howIWork.items`(5) / `now`。

### EN
- **hero.line**: `I build agents you don't have to babysit — they act on evidence, not vibes.`
- **hero.sub**: `My flagship, Mediary Scout, treats acquisition as a state problem: an agent searches real sources, transfers the best match into your own cloud drive, then re-reads to verify what actually landed — and a scheduler keeps closing the gaps. The discipline lives in software — workflow state, typed boundaries, snapshots, retries, audit logs — not in prompt wishful thinking.`
- **hero.status**: `Focused on agent product engineering: state machines, verification, and gateways — not just prompts.`
- **howIWork.items** (5):
  1. `Express intent, don't supervise.` / `The user shouldn't babysit an agent. They say what they want, connect their account, and get results. The agent stays a strong, task-scoped actor inside a system-owned sandbox — not the product surface, and not a weak judgment API.`
  2. `Acquisition is a state problem.` / `Most automation either searches well but never knows what you're still missing, or moves files but never checks what landed. I model it as state: season-level coverage, the gaps, and a scheduler that only comes back for what's still incomplete.`
  3. `Act on evidence, then verify.` / `The agent reads real search results — picking by quality, subtitles, and dedup — transfers, then re-reads the drive to confirm what actually arrived. A fluent answer isn't enough; the system has to show what happened.`
  4. `Move discipline from prompts into software.` / `Stop-before-side-effects, bind a plan, verify after — the right shape for a prompt-driven skill, but fragile. The product pushes those rules into workflow state, typed I/O, policy checks, retries, and audit logs.`
  5. `The gateway is part of the agent.` / `I don't expose an agent runtime to the internet. A business gateway owns anonymous sessions, abuse controls, streaming recovery, and the boundary between public traffic and private tools.`
- **now.body**: `The flagship right now is Mediary Scout — an agent that fills your own cloud-drive media library by acting on evidence and tracking what's still missing, with the discipline enforced in software rather than prompts. The agent you can talk to on this page is the same engineering on a different surface: a representative that answers recruiters from real project evidence. The interesting part is never just the model — it's the product boundary around it: state, verification, gateways, observability, and the small fixes that make a public agent feel steady instead of experimental.`

### ZH
- **hero.line**: `我做不用你盯着的 agent——它凭证据行动，而不是凭感觉。`
- **hero.sub**: `我的旗舰 Mediary Scout 把「获取」当成状态问题：agent 跨真实源搜索、把最合适的转存进你自己的网盘、转存后回读验证到底落了什么，再由定时巡检持续补缺。纪律落在软件里——工作流状态、类型化边界、快照、重试、审计日志——而不是靠 prompt 的一厢情愿。`
- **hero.status**: `专注 agent 产品工程：状态机、验证、网关——不只是写 prompt。`
- **howIWork.items** (5):
  1. `让用户表达意图，而不是监督 agent。` / `用户不该盯着 agent。他说出想要什么、接上自己的账号、拿到结果。agent 始终是系统沙箱里一个任务范围明确的强执行者——不是产品本身，也不是一个弱判断 API。`
  2. `获取是个状态问题。` / `多数自动化要么搜得好却不知道你还缺哪集，要么会搬文件却从不验证落了什么。我把它建模成状态：季级覆盖、缺口，以及只回来处理仍不完整剧集的定时巡检。`
  3. `凭证据行动，然后验证。` / `agent 读真实搜索结果——按画质、字幕、去重来挑——转存后回读网盘确认到底落了什么。答得漂亮还不够，系统必须能说清发生了什么。`
  4. `把纪律从 prompt 搬进软件。` / `先停在副作用前、绑定计划、事后验证——这对 prompt 驱动的 skill 是对的形态，但脆弱。产品要把这些规则落进工作流状态、类型化 I/O、策略校验、重试和审计日志。`
  5. `网关是 agent 的一部分。` / `我不把 agent 运行时直接暴露给互联网。业务网关负责匿名会话、滥用控制、流恢复，以及公网流量和私有工具之间的边界。`
- **now.body**: `现在的旗舰是 Mediary Scout——一个凭证据行动、持续追踪还缺什么的 agent，把你自己网盘的媒体库填起来，纪律靠软件而非 prompt 兜住。你在本页能对话的 agent 是同一套工程换了个面：一个用真实项目证据回答招聘方的代表。有意思的从来不只是模型，而是它周围的产品边界：状态、验证、网关、可观测性，以及那些让公网 agent 从实验感变成稳定感的小修小补。`

> dict 结构不变（hero 三键、howIWork 5 items、now.body 单键），en 为源、zh 同构，`Widen` 类型与数组长度一致。现有 i18n deep-key 测试继续守卫。

---

## 交付顺序
E（快修）→ I（滚动条）→ G（流动虚线）→ F（文案）→ H（思考流程，最大）。各自 TDD/实测，一次部署。生产用 agent-browser 验静态结构（动画在 automation 隐藏 tab 会冻，属正常）。
