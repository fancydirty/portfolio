"use client";

import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { MarkdownText } from "@/components/agent/markdown-text";

/**
 * Self-contained chat window built on assistant-ui headless primitives.
 * A bordered surface with an internally-scrolling conversation and a pinned
 * composer bar — reads as a distinct chat surface, while the hairline rules and
 * mono role labels keep it in the site's restrained, editorial register.
 */
export function AgentThread({ dict }: { dict: Dictionary }) {
  return (
    <ThreadPrimitive.Root className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface-1">
      <ThreadPrimitive.Viewport className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-5 py-5">
        <ThreadPrimitive.Empty>
          <p className="max-w-prose text-ink-muted">{dict.agent.intro}</p>
          <div className="mt-6 flex flex-col">
            {dict.agent.presets.map((q) => (
              <ThreadPrimitive.Suggestion
                key={q}
                prompt={q}
                send
                className="-mx-2 rounded-md border-t border-hairline px-2 py-3 text-left text-ink-muted transition-colors first:border-t-0 hover:bg-surface-2 hover:text-ink"
              >
                {q}
              </ThreadPrimitive.Suggestion>
            ))}
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="border-t border-hairline py-4 first:border-t-0">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
                  {dict.agent.userRole}
                </p>
                <div className="mt-1 whitespace-pre-wrap text-ink">
                  <MessagePrimitive.Parts />
                </div>
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="border-t border-hairline py-4 first:border-t-0">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
                  {dict.agent.assistantRole}
                </p>
                <div className="mt-1 text-ink-muted">
                  <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
                </div>
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="flex items-end gap-3 border-t border-hairline bg-surface-2 px-4 py-3">
        <ComposerPrimitive.Input
          rows={1}
          placeholder={dict.agent.inputPlaceholder}
          className="max-h-32 min-h-9 flex-1 resize-none bg-transparent text-ink outline-none placeholder:text-ink-subtle"
        />
        <ComposerPrimitive.Send className="font-mono text-xs text-accent transition-colors hover:text-ink disabled:opacity-40">
          {dict.agent.sendLabel}
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
