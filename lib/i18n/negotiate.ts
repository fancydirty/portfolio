import { defaultLocale, type Locale } from "./config";

/**
 * Pick a locale from an Accept-Language header. Mirrors the proxy's original
 * logic: a header that starts with `zh` (case-insensitive) yields `zh`,
 * everything else falls back to the default locale. Kept intentionally simple —
 * full quality-weight parsing is not worth it for a two-locale site.
 */
export function negotiateLocale(acceptLanguage: string): Locale {
  return acceptLanguage.toLowerCase().startsWith("zh") ? "zh" : defaultLocale;
}
