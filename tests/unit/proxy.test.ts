import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function request(path: string, acceptLanguage = "en-US"): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`), {
    headers: { "accept-language": acceptLanguage },
  });
}

describe("proxy (Accept-Language redirect)", () => {
  it("does NOT redirect /api routes (the agent proxy must pass through)", () => {
    expect(proxy(request("/api/agent/me"))).toBeUndefined();
    expect(proxy(request("/api/agent/chat"))).toBeUndefined();
  });

  it("leaves already-localized paths alone", () => {
    expect(proxy(request("/en"))).toBeUndefined();
    expect(proxy(request("/zh/work/adk-agent"))).toBeUndefined();
  });

  it("leaves _next and asset paths alone", () => {
    expect(proxy(request("/_next/static/chunk.js"))).toBeUndefined();
    expect(proxy(request("/favicon.ico"))).toBeUndefined();
  });

  it("redirects a bare path by Accept-Language", () => {
    const en = proxy(request("/", "en-US"));
    expect(en?.headers.get("location")).toMatch(/\/en$/);
    const zh = proxy(request("/", "zh-CN"));
    expect(zh?.headers.get("location")).toMatch(/\/zh$/);
  });
});
