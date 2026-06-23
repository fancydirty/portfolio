import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zhou Le — Agent Product Engineering",
  description: "I build agent workflows that survive the edge between demo and product.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
