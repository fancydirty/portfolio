import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { projects } from "@/lib/content/projects";
import { SITE_URL } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...projects.map((p) => `/work/${p.id}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: new Date("2026-06-24"),
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          zh: `${SITE_URL}/zh${path}`,
        },
      },
    })),
  );
}
