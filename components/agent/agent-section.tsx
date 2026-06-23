"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { useAgentAvailability } from "@/lib/agent/use-agent-availability";
import { AgentFallback } from "@/components/agent/agent-fallback";

// Code-split: the panel (and all of assistant-ui) only loads once the gateway
// probe succeeds, so the degraded path stays light and SSR-safe.
const AgentPanel = dynamic(
  () => import("@/components/agent/agent-panel").then((m) => m.AgentPanel),
  { ssr: false },
);

export function AgentSection({ dict }: { dict: Dictionary }) {
  const availability = useAgentAvailability();

  return (
    <section id="agent-panel" className="mt-16 border-t border-hairline pt-10">
      <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
        {dict.agent.eyebrow}
      </p>
      <h2 className="mt-3 text-2xl tracking-tight text-ink">
        {dict.agent.title}
      </h2>
      <div className="mt-6">
        {availability === "available" ? (
          <AgentPanel dict={dict} />
        ) : availability === "unavailable" ? (
          <AgentFallback dict={dict} />
        ) : (
          <p aria-hidden className="text-ink-subtle">
            …
          </p>
        )}
      </div>
    </section>
  );
}
