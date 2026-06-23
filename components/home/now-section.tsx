import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  dict: Dictionary;
};

export function NowSection({ dict }: Props) {
  const paragraphs = dict.now.body.split(/\n+/).filter((p) => p.trim().length > 0);

  return (
    <section id="now" className="border-t border-hairline py-16">
      <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
        {dict.now.eyebrow}
      </p>

      <div className="mt-8 flex max-w-prose flex-col gap-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-ink-muted">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
