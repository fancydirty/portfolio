import { ImageResponse } from "next/og";
import { locales } from "@/lib/i18n/config";
import { ogCard } from "@/lib/seo/og-card";
import { loadOgFonts } from "@/lib/seo/og-fonts";

export const alt = "Zhou Le — Agent Product Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// English-only card (both locales). The page metadata stays bilingual; only the
// share image is English, to avoid bundling a CJK font into satori.
export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    ogCard({
      eyebrow: "AGENT PRODUCT ENGINEERING",
      title: "Zhou Le",
      subtitle:
        "Agents you don't have to babysit — they act on evidence, not vibes.",
    }),
    { ...size, fonts },
  );
}
