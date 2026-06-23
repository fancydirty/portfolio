"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAdkRuntime } from "@assistant-ui/react-google-adk";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { createGatewayAdkStream } from "@/lib/agent/gateway-adk-stream";
import { solveTurnstile } from "@/lib/agent/turnstile";
import { AgentThread } from "@/components/agent/agent-thread";

/**
 * Wires the ADK runtime to the same-origin proxy and provides it to the thread.
 * Mounted only after the availability probe succeeds (see AgentSection), and
 * code-split so assistant-ui never ships on the degraded path.
 */
export function AgentPanel({ dict }: { dict: Dictionary }) {
  const runtime = useAdkRuntime({
    stream: createGatewayAdkStream({
      api: "/api/agent/chat",
      solveChallenge: () => solveTurnstile(),
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AgentThread dict={dict} />
    </AssistantRuntimeProvider>
  );
}
