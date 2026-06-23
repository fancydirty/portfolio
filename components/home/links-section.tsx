import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  dict: Dictionary;
};

type LinkRow = {
  label: string;
  href: string;
  external: boolean;
};

export function LinksSection({ dict }: Props) {
  const { links } = dict;

  const rows: LinkRow[] = [
    { label: "GitHub", href: links.github, external: true },
    ...(links.email
      ? [{ label: links.email, href: `mailto:${links.email}`, external: false }]
      : []),
    ...links.items.map((item) => ({
      label: item.label,
      href: item.href,
      external: true,
    })),
  ];

  return (
    <section id="links" className="border-t border-hairline py-16">
      <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
        {links.eyebrow}
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.href}>
            <a
              href={row.href}
              {...(row.external
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className="text-ink-muted transition-colors hover:text-ink"
            >
              {row.label}
              {row.external ? <span className="text-ink-subtle"> ↗</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
