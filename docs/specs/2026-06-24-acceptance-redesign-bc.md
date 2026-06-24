# 验收 Round-2 重设计 · B + C 设计 Spec

**日期**：2026-06-24
**状态**：已与作者 mockup 对齐拍板，可进 writing-plans。
**所属**：Portfolio Phase 3，验收反馈第二轮。A（详情页死导航）、D（SVG 点击放大灯箱）已先行实现并部署上线（commits `92ab3fa`、`576f78b`）。本 spec 覆盖 **B（聊天框可识别性重设计）** 与 **C（4 张架构图重设计 + Framer motion）**。

> 铁律：代码改动走 GitHub（commit → push → CI → 部署）。

---

## B — 聊天 section 重设计（让招聘方一眼认出是聊天区）

### 问题
当前面板虽有容器，但不像聊天框：无「这是聊天」的标识、消息不左右分离、预置问题叠成纯文字。招聘方/用户无法一眼识别这是可与 agent 对话的区域。这是对原 spec §4「无气泡/编辑式」的**有意破例**——此组件优先「可识别性」over 编辑式纯粹。

### 设计（mockup 已通过）
改造 `components/agent/agent-thread.tsx`（沿用现有 assistant-ui headless primitives + `.agent-md` markdown 样式）：

1. **Live 状态条**（新增，顶部）：脉冲绿点 + `adk-agent` + `LIVE` 药丸 + 右侧 `my representative`。脉冲点用 CSS keyframes（reduced-motion 下静止）。这是「可识别性」核心信号。
2. **左右气泡分离**：
   - Assistant 消息：靠左（`align-self:flex-start`），surface-2 底 + hairline 边，圆角 `12px 12px 12px 3px`（左下尖角=尾巴）。内部用 `.agent-md` 渲染 markdown。
   - User 消息：靠右（`align-self:flex-end`），accent 暖色调底（`#3a2a18` 暗背景 + `#5a4127` 边 + `#f0d9bf` 字，亮色模式对应浅 accent），圆角 `12px 12px 3px 12px`（右下尖角）。
   - 角色不再用 `YOU/AGENT` mono 标签行（气泡位置已表达角色）；保留可选小标签或直接去掉。
3. **预置问题做成 chips**：空状态下，agent 开场气泡 + 「TRY ASKING」mono 小标 + 预置问题渲染成圆角药丸 chips（`ThreadPrimitive.Suggestion`，`border-radius:999px`），明确可点、不再叠成纯文字块。
4. **框中框定高内滚**：外层窗口固定高（`h-[460px]` 量级，移动端可略矮），消息区 `flex-1 overflow-y-auto`，输入栏 pinned 底部。父页面高度不再被对话撑高。
5. **输入栏**：surface-2 底 + 顶 hairline；输入框 + 右侧 accent 图标发送键（↑，`ti-arrow-up` 等价的内联 SVG 或字符）。空输入禁用（沿用现有 disabled 行为 + 全局 cursor 规则）。

### 不变
- 代理拓扑、`useAdkRuntime`、`createGatewayAdkStream`、Turnstile、降级 fallback、双语 dict、availability 探测——全部不动。
- `.agent-md` prose 样式保留（assistant 气泡内用）。

### 测试
- 现有 `agent-section.test.tsx`（降级路径）继续绿。
- 新增/调整断言：气泡有左右对齐 class、预置 chips 存在、容器固定高。视觉细节靠 agent-browser 实测。

---

## C — 4 张架构图重设计（数据驱动 + Framer motion）

### 问题
当前 4 张图是从老 Astro 移植的手绘静态 SVG，仅加了 CSS 描边动画。视觉粗糙、未用上已安装的 `motion`（Framer Motion），且缺乏「数据沿链路流动」的真动效。

### 设计（mockup 已通过；动效强度 = 持续脉冲流动）
新建数据驱动原语 + 把 4 张图改成数据：

1. **`components/diagrams/flow-diagram.tsx`（新原语，`"use client"`）**：
   - 入参：`title`、`nodes`（`{id, label, sub?, x, y, w?, h?, accent?}[]`，**显式坐标**，非自动布局）、`edges`（`{from, to, dashed?}[]`）、`viewBox`。
   - 渲染：SVG 容器（surface-1 底，rx）；每个 node 渲染精修卡片（surface-2 底 + hairline 边 + mono label + 可选 subtitle；`accent:true` 的「签名节点」用 accent 边 + 暖色微底）；edges 渲染为 hairline 连线 + 箭头/方向。
   - **Framer motion 动效**：
     - 进场：`whileInView`（`viewport={{ once:true, amount:0.3 }}`）+ 父 `variants` `staggerChildren`，节点按 `nodes` 顺序（=流向）逐个 fade+scale 浮现。
     - 持续脉冲：每条 edge 上一颗 accent 小圆点，沿该 edge 的路径用 motion 循环移动（`animate` offsetDistance / 或沿两端点插值 cx/cy，`repeat:Infinity`，慢速、低透明、单点）。
   - **reduced-motion**：`useReducedMotion()` → 跳过进场动画与脉冲，渲染完整静态图。
   - 图例（可选，小）：`● data flowing` / `▢ signature node`。
2. **`components/diagrams/diagrams-data.ts`（新数据）**：4 张图的 node/edge/viewBox 定义，**内容/链路忠于现有 4 张图的真实架构**（Mediary Scout 双排采集状态机、adk-agent 网关+ADK+工具、enterprise-workflow、content-pipeline），只换皮+动效。脱敏红线不变（私有项目只描述系统形态）。
3. **替换**：`adk-agent-diagram.tsx` / `mediary-scout-diagram.tsx` / `enterprise-flow-diagram.tsx` / `content-pipeline-diagram.tsx` 改为「读数据 + 渲染 `<FlowDiagram .../>`」的薄包装（或直接在 `registry.tsx` 用数据渲染）。`AnimatedDiagram`（旧 CSS 描边 wrapper）退役/删除——动效改由 FlowDiagram 内部 motion 承担。
4. **与 D（zoom）协同**：`DiagramZoom` 继续包在外层；灯箱内放大的也是同一 `FlowDiagram`（motion 在大尺寸下重新进场+流动）。
5. **节点配色**：沿用站点 token（surface-2 节点 / hairline 边 / 一个 accent 签名节点）；每图 accent 节点选「最能代表该项目工艺亮点」的那个（如 mediary=Sandbox agent、adk-agent=FastAPI Gateway）。

### 约束
- 显式坐标，不做通用图布局引擎（YAGNI）。
- 动效克制：单脉冲、慢速、低透明；进场 once。
- SSR 安全：`"use client"` + `whileInView`，无 hydration 重复（注意 Next 16 的 layout 去重历史，已有 e2e 守卫）。

### 测试
- 单元：`FlowDiagram` 给定 nodes/edges 渲染出对应数量的节点卡 + 连线；`accent` 节点带 accent 标记；reduced-motion mock 下不渲染脉冲。
- 数据完整性：4 张图数据的 node id 唯一、edge 两端 id 存在。
- 视觉/动效靠 agent-browser 实测（进场 + 脉冲 + zoom）。
- 脱敏：e2e 现有红线断言覆盖详情页。

---

## 交付
- B、C 可一并实现、一次部署。
- 顺序：先 B（小、独立），再 C（大）。各自 TDD + agent-browser 实测 + 部署后生产验证。
- 收尾后剩余 Phase 3：SEO/OG 图、sitemap/robots、真 README（独立 sub-project）。
