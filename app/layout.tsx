import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Zhou Le — Agent Product Engineering",
  description:
    "I build agents you don't have to babysit — they act on evidence, not vibes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
