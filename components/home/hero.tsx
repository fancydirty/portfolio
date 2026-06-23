import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Props = {
  dict: Dictionary;
};

export function Hero({ dict }: Props) {
  return (
    <section className="py-20 md:py-28">
      <h1 className="max-w-[20ch] text-4xl tracking-tight text-ink md:text-6xl">
        {dict.hero.line}
      </h1>
      <p className="mt-8 max-w-prose text-ink-muted">{dict.hero.sub}</p>
      <p className="mt-6 font-mono text-sm text-ink-subtle">
        {`// ${dict.hero.status}`}
      </p>
    </section>
  );
}
