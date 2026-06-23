import { afterEach, describe, expect, it, vi } from "vitest";
import { gatewayUrl, gatewayHeaders } from "@/lib/agent/gateway";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("gatewayUrl", () => {
  it("returns GATEWAY_URL without a trailing slash", () => {
    vi.stubEnv("GATEWAY_URL", "https://api.dirtyfancy.sbs/");
    expect(gatewayUrl()).toBe("https://api.dirtyfancy.sbs");
  });

  it("throws when GATEWAY_URL is unset", () => {
    vi.stubEnv("GATEWAY_URL", "");
    expect(() => gatewayUrl()).toThrow(/GATEWAY_URL/);
  });
});

describe("gatewayHeaders", () => {
  it("injects x-gateway-secret when the secret is set", () => {
    vi.stubEnv("GATEWAY_PROXY_SECRET", "s3cret");
    expect(gatewayHeaders()["x-gateway-secret"]).toBe("s3cret");
  });

  it("omits x-gateway-secret when the secret is unset", () => {
    vi.stubEnv("GATEWAY_PROXY_SECRET", "");
    expect(gatewayHeaders()["x-gateway-secret"]).toBeUndefined();
  });

  it("merges a provided base", () => {
    vi.stubEnv("GATEWAY_PROXY_SECRET", "s3cret");
    const h = gatewayHeaders({ Accept: "text/event-stream" });
    expect(h.Accept).toBe("text/event-stream");
    expect(h["x-gateway-secret"]).toBe("s3cret");
  });
});
