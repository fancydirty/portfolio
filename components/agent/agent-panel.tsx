"use client";

import { useCallback, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAdkRuntime } from "@assistant-ui/react-google-adk";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { createGatewayAdkStream } from "@/lib/agent/gateway-adk-stream";
import { historyToAdkMessages } from "@/lib/agent/history";
import { fetchMe } from "@/lib/agent/me";
import {
  sendSlashCommand,
  type SlashCommand,
} from "@/lib/agent/session-commands";
import { solveTurnstile } from "@/lib/agent/turnstile";
import { AgentThread } from "@/components/agent/agent-thread";

/**
 * Wires the ADK runtime to the same-origin proxy and provides it to the thread.
 * Mounted only after the availability probe succeeds (see AgentSection), and
 * code-split so assistant-ui never ships on the degraded path.
 *
 * `load` rehydrates the visible thread from the server session on mount, so a
 * reload no longer drops history the backend still holds. New/Compact send a
 * session slash command then bump `runtimeEpoch`, remounting the runtime so
 * `load` re-runs against the freshly-swapped session.
 */
export function AgentPanel({ dict }: { dict: Dictionary }) {
  const [runtimeEpoch, setRuntimeEpoch] = useState(0);

  const runtime = useAdkRuntime({
    stream: createGatewayAdkStream({
      api: "/api/agent/chat",
      solveChallenge: () => solveTurnstile(),
    }),
    load: async () => {
      const r = await fetchMe();
      if (!r.ok) return { messages: [] };
      const data = r.data as {
        currentSession?: { messages?: unknown };
      } | null;
      return { messages: historyToAdkMessages(data?.currentSession?.messages) };
    },
  });

  const runCommand = useCallback(async (command: SlashCommand) => {
    await sendSlashCommand(command);
    setRuntimeEpoch((epoch) => epoch + 1);
  }, []);

  return (
    <AssistantRuntimeProvider key={runtimeEpoch} runtime={runtime}>
      <AgentThread
        dict={dict}
        onNewSession={() => runCommand("/new")}
        onCompact={() => runCommand("/compact")}
      />
    </AssistantRuntimeProvider>
  );
}
