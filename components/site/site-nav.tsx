import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  lang: Locale;
  nav: Dictionary["nav"];
  themeToggle: Dictionary["themeToggle"];
};

export function SiteNav({ lang, nav, themeToggle }: Props) {
  const other: Locale = lang === "en" ? "zh" : "en";
  const sections: { href: string; label: string }[] = [
    { href: "#work", label: nav.work },
    { href: "#how", label: nav.howIWork },
    { href: "#now", label: nav.now },
    { href: "#links", label: nav.links },
  ];

  return (
    <header className="border-b border-hairline">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-6 px-6 py-5">
        <Link href={`/${lang}`} className="text-sm font-semibold text-ink">
          周乐 · Zhou Le
        </Link>
        <ul className="hidden items-center gap-5 sm:flex">
          {sections.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                className="font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <Link
            href={`/${other}`}
            className="font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
          >
            {other === "zh" ? "中" : "EN"}
          </Link>
          <ThemeToggle labels={themeToggle} />
        </div>
      </nav>
    </header>
  );
}
