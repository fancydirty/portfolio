import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * Shown when the in-page panel can't reach the gateway. The agent is still
 * reachable on its own page, so the worst case is a link — never an error.
 */
export function AgentFallback({ dict }: { dict: Dictionary }) {
  return (
    <div>
      <h3 className="font-medium text-ink">{dict.agent.fallbackTitle}</h3>
      <p className="mt-2 max-w-prose text-ink-muted">{dict.agent.fallbackBody}</p>
      <a
        href="https://agent.dirtyfancy.sbs"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block font-mono text-xs text-accent transition-colors hover:text-ink"
      >
        {dict.agent.fallbackCta}
      </a>
    </div>
  );
}
