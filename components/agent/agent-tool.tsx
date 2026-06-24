"use client";

import type {
  ToolCallMessagePartComponent,
  ToolCallMessagePartStatus,
} from "@assistant-ui/react";

function statusInfo(status: ToolCallMessagePartStatus): {
  label: string;
  cls: string;
} {
  switch (status.type) {
    case "complete":
      return { label: "✓", cls: "agent-tool-ok" };
    case "incomplete":
      return { label: "failed", cls: "agent-tool-fail" };
    default:
      return { label: "running…", cls: "agent-tool-run" };
  }
}

/** Compact chip showing a tool call + its status, so the agent's work is visible. */
export const AgentToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  status,
}) => {
  const { label, cls } = statusInfo(status);
  return (
    <span className="my-1 mr-1.5 inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={cls}
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6 2 2 6-6a4 4 0 0 0 5.4-5.4l-2.3 2.3-1.6-1.6 2.3-2.3z" />
      </svg>
      {toolName}
      <span className={cls}>{label}</span>
    </span>
  );
};
