import { ImageResponse } from "next/og";
import { locales } from "@/lib/i18n/config";
import { projects } from "@/lib/content/projects";
import { ogCard } from "@/lib/seo/og-card";
import { loadOgFonts } from "@/lib/seo/og-fonts";

export const alt = "Selected work — Zhou Le";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    projects.map((p) => ({ lang, slug: p.id })),
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// English-only card (uses summary.en regardless of locale; project names are
// already English). See the home route for the CJK rationale.
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  const fonts = await loadOgFonts();
  return new ImageResponse(
    ogCard({
      eyebrow: "SELECTED WORK",
      title: project?.name ?? "Zhou Le",
      subtitle: project ? truncate(project.summary.en, 120) : "",
    }),
    { ...size, fonts },
  );
}
