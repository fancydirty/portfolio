import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { projects } from "@/lib/content/projects";
import { CaseStudy } from "@/components/work/case-study";

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.id === slug);
  if (!p || !isLocale(lang)) return {};
  return { title: `${p.name} — Zhou Le`, description: p.summary[lang] };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();
  const dict = await getDictionary(lang);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CaseStudy project={project} lang={lang} work={dict.work} />
    </main>
  );
}
