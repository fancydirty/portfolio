import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("GATEWAY_URL", "https://api.example.test");
  vi.stubEnv("GATEWAY_PROXY_SECRET", "s3cret");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GET /api/agent/me", () => {
  it("forwards the browser cookie and relays set-cookie", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ userId: "u_x", anonymous: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "sid=abc; Path=/",
        },
      }),
    );
    const { GET } = await import("@/app/api/agent/me/route");
    const req = new Request("http://localhost/api/agent/me", {
      headers: { cookie: "sid=abc" },
    });
    const res = await GET(req);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [calledUrl, init] = fetchMock.mock.calls[0]!;
    expect(calledUrl).toBe("https://api.example.test/api/me");
    expect((init as RequestInit).headers).toMatchObject({
      cookie: "sid=abc",
      "x-gateway-secret": "s3cret",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toBe("sid=abc; Path=/");
  });

  it("relays a non-2xx status from the gateway", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 502 }),
    );
    const { GET } = await import("@/app/api/agent/me/route");
    const res = await GET(new Request("http://localhost/api/agent/me"));
    expect(res.status).toBe(502);
  });

  it("returns a controlled 503 when the gateway env is missing", async () => {
    vi.stubEnv("GATEWAY_URL", "");
    const { GET } = await import("@/app/api/agent/me/route");
    const res = await GET(new Request("http://localhost/api/agent/me"));
    expect(res.status).toBe(503);
  });

  it("returns a controlled 503 when the gateway fetch throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    const { GET } = await import("@/app/api/agent/me/route");
    const res = await GET(new Request("http://localhost/api/agent/me"));
    expect(res.status).toBe(503);
  });
});

describe("POST /api/agent/chat", () => {
  it("forwards the body + cookie and relays x-stream-id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("data: {}\n\n", {
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-stream-id": "str_1",
        },
      }),
    );
    const { POST } = await import("@/app/api/agent/chat/route");
    const req = new Request("http://localhost/api/agent/chat", {
      method: "POST",
      headers: { cookie: "sid=abc", "content-type": "application/json" },
      body: JSON.stringify({ parts: [{ text: "hi" }] }),
    });
    const res = await POST(req);

    const [calledUrl, init] = fetchMock.mock.calls[0]!;
    expect(calledUrl).toBe("https://api.example.test/api/chat");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({
      cookie: "sid=abc",
      "x-gateway-secret": "s3cret",
      Accept: "text/event-stream",
    });
    expect(res.headers.get("x-stream-id")).toBe("str_1");
    expect(res.headers.get("content-type")).toContain("text/event-stream");
  });

  it("returns 400 on malformed JSON without calling the gateway", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const { POST } = await import("@/app/api/agent/chat/route");
    const req = new Request("http://localhost/api/agent/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not valid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
