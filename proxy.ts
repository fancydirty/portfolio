import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  if (pathname.startsWith("/_next") || pathname.includes(".")) return;
  const header = req.headers.get("accept-language") ?? "";
  const lang = header.toLowerCase().startsWith("zh") ? "zh" : defaultLocale;
  return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}`, req.url));
}
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
