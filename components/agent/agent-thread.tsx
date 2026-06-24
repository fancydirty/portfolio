"use client";

import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { MarkdownText } from "@/components/agent/markdown-text";

/**
 * A fixed-height chat window that reads, at a glance, as a live chat: a status
 * header with a pulsing "LIVE" dot, left/right message bubbles, and the opener
 * questions as clickable chips. Built on assistant-ui headless primitives;
 * assistant replies use the `.agent-md` prose styling.
 */
export function AgentThread({ dict }: { dict: Dictionary }) {
  return (
    <ThreadPrimitive.Root className="flex h-[460px] flex-col overflow-hidden rounded-xl border border-hairline bg-surface-1">
      <div className="flex items-center gap-2 border-b border-hairline bg-surface-2 px-4 py-3">
        <span className="agent-live-dot h-2 w-2 rounded-full bg-[#5DCAA5]" />
        <span className="font-mono text-xs text-ink">adk-agent</span>
        <span className="rounded border border-[#0F6E56] px-1.5 py-px font-mono text-[10px] tracking-wider text-[#5DCAA5]">
          LIVE
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-subtle">
          {dict.agent.headerNote}
        </span>
      </div>

      <ThreadPrimitive.Viewport className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <ThreadPrimitive.Empty>
          <div className="max-w-[85%] self-start rounded-xl rounded-bl-[3px] border border-hairline bg-surface-2 px-3.5 py-2.5 leading-relaxed text-ink-muted">
            {dict.agent.intro}
          </div>
          <div className="mt-2">
            <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-ink-subtle">
              {dict.agent.tryAsking}
            </p>
            <div className="flex flex-wrap gap-2">
              {dict.agent.presets.map((q) => (
                <ThreadPrimitive.Suggestion
                  key={q}
                  prompt={q}
                  send
                  className="rounded-full border border-hairline bg-surface-1 px-3 py-1.5 text-left text-[13px] text-ink-muted transition-colors hover:border-accent hover:text-ink"
                >
                  {q}
                </ThreadPrimitive.Suggestion>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="max-w-[82%] self-end whitespace-pre-wrap rounded-xl rounded-br-[3px] border border-[#5a4127] bg-[#3a2a18] px-3.5 py-2.5 text-[#f0d9bf]">
                <MessagePrimitive.Parts />
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="max-w-[88%] self-start rounded-xl rounded-bl-[3px] border border-hairline bg-surface-2 px-3.5 py-2.5 text-ink-muted">
                <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="flex items-end gap-2 border-t border-hairline bg-surface-2 px-3 py-2.5">
        <ComposerPrimitive.Input
          rows={1}
          placeholder={dict.agent.inputPlaceholder}
          className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 text-ink outline-none placeholder:text-ink-subtle"
        />
        <ComposerPrimitive.Send
          aria-label={dict.agent.sendLabel}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
