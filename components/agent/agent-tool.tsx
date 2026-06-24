"use client";

import type {
  ToolCallMessagePartComponent,
  ToolCallMessagePartStatus,
} from "@assistant-ui/react";

function statusBits(status: ToolCallMessagePartStatus): {
  label: string;
  color: string;
} {
  switch (status.type) {
    case "complete":
      return { label: "✓", color: "#5DCAA5" };
    case "incomplete":
      return { label: "failed", color: "#E24B4A" };
    default:
      return { label: "running…", color: "#e0a878" };
  }
}

/** Compact chip showing a tool call + its status, so the agent's work is visible. */
export const AgentToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  status,
}) => {
  const { label, color } = statusBits(status);
  return (
    <span className="my-1 mr-1.5 inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6 2 2 6-6a4 4 0 0 0 5.4-5.4l-2.3 2.3-1.6-1.6 2.3-2.3z" />
      </svg>
      {toolName}
      <span style={{ color }}>{label}</span>
    </span>
  );
};
