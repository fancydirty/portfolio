"use client";

import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { MarkdownText } from "@/components/agent/markdown-text";

/**
 * Editorial-skinned chat thread built on assistant-ui headless primitives.
 * No bubbles or shadows — hairline rules, mono role labels, generous space —
 * to match the rest of the site rather than a stock chat widget.
 */
export function AgentThread({ dict }: { dict: Dictionary }) {
  return (
    <ThreadPrimitive.Root className="flex flex-col gap-6">
      <ThreadPrimitive.Viewport className="flex flex-col gap-2">
        <ThreadPrimitive.Empty>
          <p className="max-w-prose text-ink-muted">{dict.agent.intro}</p>
          <div className="mt-6 flex flex-col">
            {dict.agent.presets.map((q) => (
              <ThreadPrimitive.Suggestion
                key={q}
                prompt={q}
                send
                className="border-t border-hairline py-3 text-left text-ink-muted transition-colors first:border-t-0 hover:text-ink"
              >
                {q}
              </ThreadPrimitive.Suggestion>
            ))}
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="border-t border-hairline py-4">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
                  YOU
                </p>
                <div className="mt-1 whitespace-pre-wrap text-ink">
                  <MessagePrimitive.Parts />
                </div>
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="border-t border-hairline py-4">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
                  AGENT
                </p>
                <div className="mt-1 leading-relaxed text-ink-muted">
                  <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
                </div>
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      <ComposerPrimitive.Root className="flex items-end gap-3 border-t border-hairline pt-4">
        <ComposerPrimitive.Input
          rows={1}
          placeholder={dict.agent.inputPlaceholder}
          className="min-h-10 flex-1 resize-none bg-transparent text-ink outline-none placeholder:text-ink-subtle"
        />
        <ComposerPrimitive.Send className="font-mono text-xs text-accent transition-colors hover:text-ink disabled:opacity-40">
          {dict.agent.sendLabel}
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
