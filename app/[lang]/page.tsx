import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { projects } from "@/lib/content/projects";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { HowIWork } from "@/components/home/how-i-work";
import { NowSection } from "@/components/home/now-section";
import { LinksSection } from "@/components/home/links-section";
import { AgentCta } from "@/components/home/agent-cta";

export default async function LangHome({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main>
      <div className="mx-auto max-w-3xl px-6">
        <Hero dict={dict} />
      </div>

      <SelectedWork projects={projects} lang={lang} eyebrow={dict.work.eyebrow} />

      <div className="mx-auto max-w-3xl px-6">
        <HowIWork dict={dict} />
        <AgentCta dict={dict} lang={lang} />
        <NowSection dict={dict} />
        <LinksSection dict={dict} />
      </div>
    </main>
  );
}
