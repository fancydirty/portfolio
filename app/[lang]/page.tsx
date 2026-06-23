import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LangHome({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="mx-auto max-w-3xl px-6">
      <section className="py-16">
        <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {dict.hero.line}
        </h1>
        <p className="mt-6 text-ink-muted">{dict.hero.sub}</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-accent">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-accent"
          />
          {dict.hero.status}
        </p>
      </section>

      <section id="work" className="border-t border-hairline py-12">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-subtle">
          {dict.work.eyebrow}
        </p>
      </section>

      <section id="how" className="border-t border-hairline py-12">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-subtle">
          {dict.howIWork.eyebrow}
        </p>
        <ul className="mt-6 space-y-6">
          {dict.howIWork.items.map((item) => (
            <li key={item.title}>
              <p className="font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="now" className="border-t border-hairline py-12">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-subtle">
          {dict.now.eyebrow}
        </p>
        <p className="mt-4 text-ink-muted">{dict.now.body}</p>
      </section>

      <section id="links" className="border-t border-hairline py-12">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-subtle">
          {dict.links.eyebrow}
        </p>
      </section>
    </main>
  );
}
