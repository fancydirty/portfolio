import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function AgentCta({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  return (
    <div className="border-t border-hairline py-8">
      <Link
        href={`/${lang}/work/adk-agent#agent-panel`}
        className="font-mono text-sm text-accent transition-colors hover:text-ink"
      >
        {dict.agent.homeCta}
      </Link>
    </div>
  );
}
