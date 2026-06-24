"use client";

import type { ReasoningMessagePartComponent } from "@assistant-ui/react";

/** Streamed chain-of-thought, shown as a muted italic aside before the answer. */
export const AgentReasoning: ReasoningMessagePartComponent = ({ text }) => {
  if (!text) return null;
  return (
    <div className="mb-2 border-l border-hairline pl-3 text-[12.5px] italic leading-relaxed text-ink-subtle">
      {text}
    </div>
  );
};
