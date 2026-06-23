import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  dict: Dictionary;
};

export function HowIWork({ dict }: Props) {
  return (
    <section id="how" className="border-t border-hairline py-16">
      <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle">
        {dict.howIWork.eyebrow}
      </p>

      <div className="mt-8 border-b border-hairline">
        {dict.howIWork.items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 border-t border-hairline py-6"
          >
            <h3 className="font-medium text-ink">{item.title}</h3>
            <p className="max-w-prose text-ink-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
