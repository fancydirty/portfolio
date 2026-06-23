import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  lang: Locale;
  links: Dictionary["links"];
};

export function SiteFooter({ links }: Props) {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        <ul className="flex flex-wrap gap-4">
          {links.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${links.email}`}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {links.email}
            </a>
          </li>
        </ul>
        <p className="font-mono text-xs text-ink-subtle">
          Built with Next.js 16 —{" "}
          <a
            href="https://github.com/fancydirty/portfolio"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:text-ink-muted hover:underline"
          >
            source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
