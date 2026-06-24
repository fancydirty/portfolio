import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/lib/i18n/config";
import { negotiateLocale } from "@/lib/i18n/negotiate";
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return;
  const lang = negotiateLocale(req.headers.get("accept-language") ?? "");
  return NextResponse.redirect(new URL(`/${lang}${pathname === "/" ? "" : pathname}`, req.url));
}
export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
