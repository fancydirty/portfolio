import type { Locale } from "@/lib/i18n/config";

/** Canonical production origin. No trailing slash. */
export const SITE_URL = "https://portfolio.dirtyfancy.sbs";

/**
 * Build the `alternates` block for `generateMetadata`: a canonical pointing at
 * the current locale, plus `hreflang` links to every locale of the same page.
 * `path` is "" for the home page or "/work/<slug>" for a detail page. URLs are
 * relative — Next resolves them against `metadataBase`.
 */
export function buildAlternates(lang: Locale, path: string) {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      en: `/en${path}`,
      zh: `/zh${path}`,
    },
  };
}
