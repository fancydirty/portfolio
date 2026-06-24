# 聊天会话持久化 · 设计 Spec（含 compaction 接力说明）

**日期**：2026-06-24
**状态**：设计已与作者对齐（历史水合 + New/Compact 控制，作者已同意都做）。**这是 compaction 前的自包含交接文档** —— compact 后接续时，读本 spec + memory `portfolio-rebuild.md` 即可直接进 writing-plans / 实现，无需重新探索。
**所属**：Portfolio Phase 3，验收第 4 轮（单项）。

---

## 问题
重进 adk-agent 详情页后，聊天 UI 历史消失（空 thread），但后端靠匿名 cookie `candidate_user_id` 仍保留着会话——于是 agent 以为用户重复提问。根因：精简面板 (`components/agent/agent-panel.tsx`) 的 `useAdkRuntime` 没传 `load`，`/api/agent/me` 返回的 `currentSession.messages` 只被 `useAgentAvailability` 拿去做了「是否 available」探测、消息被丢弃。

## 已查证的技术事实（接力直接用，勿重新探索）
- **`GET /api/agent/me`** 返回 `{ userId, anonymous, isAdmin, currentSession: { id, messages: [...], historyWindow, ... } }`。每条 message = `{ id, role: "user" | "assistant", content: string, metadata? }`（assistant 历史已被后端 `clean_assistant_history_text` 清成纯正文，无 reasoning/tool 回放）。
- **`useAdkRuntime`**（`@assistant-ui/react-google-adk`）接受 `load?: (threadId) => Promise<{ messages: AdkMessage[] }>`，runtime 挂载时调用它水合 thread。
- **`AdkMessage`** 形状：user → `{ id, type: "human", content }`；assistant → `{ id, type: "ai", content }`（`content` 可为 string）。
- **New / Compact**：后端 `POST /api/chat`（即站内 `/api/agent/chat`）的 `parse_slash_command` 处理文本 `/new`（`app.py:1047`，创建新会话）与 `/compact`（`app.py:1073`，压缩并起带摘要的新会话）。前端发一条文本为 `/new` 或 `/compact` 的消息即可触发；二者都换了 session，需**重挂 runtime 清 thread**。
- **重挂机制**：reference `chat.tsx` 用 `const [runtimeEpoch,setRuntimeEpoch]=useState(0)` + `<AssistantRuntimeProvider key={runtimeEpoch} runtime={runtime}>`——bump epoch 即重建 runtime → 重跑 `load` → thread 刷新。
- 当前 `agent-panel.tsx` 内容见仓库（无 load、无控制）。`/api/agent/chat` 代理已存在并工作。

## 设计

### 1. 历史水合（核心）
- 新建 helper `lib/agent/history.ts`：
  ```ts
  type RawMsg = { id: string | number; role: "user" | "assistant"; content: string };
  export function historyToAdkMessages(messages: RawMsg[]): AdkMessage[]
  // user → { id:`h-${m.id}`, type:"human", content:m.content }
  // assistant → { id:`h-${m.id}`, type:"ai", content:m.content }
  // 跳过空 content / 未知 role
  ```
- `agent-panel.tsx`：给 `useAdkRuntime` 加
  ```ts
  load: async () => {
    try {
      const r = await fetch("/api/agent/me", { cache: "no-store", credentials: "include" });
      if (!r.ok) return { messages: [] };
      const data = await r.json();
      return { messages: historyToAdkMessages(data?.currentSession?.messages ?? []) };
    } catch { return { messages: [] }; }
  }
  ```
- 边界：新访客/空会话/load 失败 → `{ messages: [] }`（空 thread，仍能发新消息）。

### 2. New / Compact 控制
- 在聊天 header（`agent-thread.tsx` 那条 LIVE 状态栏右侧，或 panel 顶部）加两个克制的 mono 小按钮：`New` / `Compact`（图标可选 `ti` 等价内联 SVG；遵循全站 `cursor-pointer` 全局规则）。
- 机制（精简，不引 sessionAdapter）：按钮 → 直接 `POST /api/agent/chat` body `{ parts: [{ text: "/new" }] }`（或 `/compact`），消费/忽略其 SSE → 然后 bump `runtimeEpoch` 重挂 runtime（`load` 重跑：`/new` 后是空会话、`/compact` 后是带摘要的新会话）。
  - `agent-panel.tsx` 持有 `runtimeEpoch` state + `<AssistantRuntimeProvider key={epoch}>`；把 `onNewSession`/`onCompact`（发命令 + bump epoch）下传给 `AgentThread` 的 header。
  - 发命令的小工具：`lib/agent/session-commands.ts` → `sendSlashCommand(cmd: "/new" | "/compact")`（fetch POST，读完流即可）。
- 文案：dict `agent` 段加 `newChat` / `compact`（en: "New" / "Compact"；zh: "新会话" / "压缩"）。i18n deep-key 测试会要求 en/zh 同步。

### 范围
- 只做历史水合 + New/Compact。不引 sessionAdapter / 多会话列表 / 会话切换（YAGNI）。
- 不动代理拓扑、Turnstile、降级、reasoning/tool 渲染、双语骨架。

## 测试
- 单元：`tests/unit/history.test.ts` —— `historyToAdkMessages` 映射 user→human / assistant→ai、跳过空/未知、id 前缀。
- 单元（可选）：`sendSlashCommand` 用 mock fetch 断言 POST body 含 `/new`。
- 真实水合 + New/Compact 效果：作者在真实浏览器验收（agent-browser 在隐藏 throttled tab 不可靠，验静态/结构即可）。

## 文件
| 文件 | 动作 |
|---|---|
| `lib/agent/history.ts` | 新建：`historyToAdkMessages` + `RawMsg`/类型 |
| `lib/agent/session-commands.ts` | 新建：`sendSlashCommand("/new"\|"/compact")` |
| `components/agent/agent-panel.tsx` | 改：加 `load` + `runtimeEpoch` + provider key + 下传 onNewSession/onCompact |
| `components/agent/agent-thread.tsx` | 改：header 加 New/Compact 按钮（接 props） |
| `lib/i18n/dictionaries/en.ts` + `zh.ts` | 改：`agent.newChat` / `agent.compact` |
| `tests/unit/history.test.ts` | 新建 |

## ▶ RESUME HERE（compact 后接力步骤）
1. 读本 spec + memory `portfolio-rebuild.md`（已记全部上下文：代理拓扑、overrides、部署 API、round-1/2/3 全貌）。
2. 进 **writing-plans** 出分步计划（或因范围小直接 TDD 实现本 spec）。
3. 实现顺序：history.ts(+test) → agent-panel load → session-commands → dict keys → agent-thread header 按钮 → wire。
4. 门禁：`npx tsc --noEmit && npx vitest run && npx eslint app components lib && npm run build && (lsof -ti:3000|xargs kill -9 2>/dev/null; npm run test:e2e)` 全绿。
5. 部署：`git push origin master` → 轮询 Vercel（项目 `website` id `prj_ZZSz0G8mlN2L2kwRkjxTnJRx00MA`，team `team_oeVWMFfwtCnrNbQ0AhE1U0ev`；若 git push 自动部署没触发，用 memory 里记的 Git-source 部署 API）。
6. 生产 curl 验证 + 提醒作者真实浏览器验收「重进页面历史还在 + New/Compact 可用」。
7. Phase 3 剩余仍是：SEO/OG 图、sitemap/robots、真 README。
