import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { locales, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildAlternates } from "@/lib/seo/site";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { seo } = await getDictionary(lang);
  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
    alternates: buildAlternates(lang, ""),
    openGraph: {
      type: "website",
      siteName: "Zhou Le",
      locale: lang === "zh" ? "zh_CN" : "en_US",
      url: `/${lang}`,
      title: seo.homeTitle,
      description: seo.homeDescription,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.theme==='light')document.documentElement.classList.add('light')}catch(e){}",
          }}
        />
      </head>
      <body>
        <SiteNav lang={lang} nav={dict.nav} themeToggle={dict.themeToggle} />
        {children}
        <SiteFooter links={dict.links} />
      </body>
    </html>
  );
}
