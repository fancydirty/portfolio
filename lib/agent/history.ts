import type { AdkMessage } from "@assistant-ui/react-google-adk";

/** One message as returned by `GET /api/agent/me` → `currentSession.messages`. */
export type RawHistoryMessage = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
};

/**
 * Map server-side session history into the `AdkMessage[]` shape `useAdkRuntime`'s
 * `load` expects: user → `human`, assistant → `ai`. Ids are prefixed so a
 * rehydrated message never collides with a fresh in-thread one. Empty content
 * and unknown roles are dropped; non-array input yields an empty thread.
 */
export function historyToAdkMessages(messages: unknown): AdkMessage[] {
  if (!Array.isArray(messages)) return [];

  const out: AdkMessage[] = [];
  for (const raw of messages as RawHistoryMessage[]) {
    const content = typeof raw?.content === "string" ? raw.content : "";
    if (!content) continue;
    const id = `h-${raw.id}`;
    if (raw.role === "user") out.push({ id, type: "human", content });
    else if (raw.role === "assistant") out.push({ id, type: "ai", content });
  }
  return out;
}
