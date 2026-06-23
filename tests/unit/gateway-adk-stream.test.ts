import { afterEach, describe, expect, it, vi } from "vitest";
import type { AdkEvent, AdkMessage } from "@assistant-ui/react-google-adk";
import { createGatewayAdkStream } from "@/lib/agent/gateway-adk-stream";

afterEach(() => vi.restoreAllMocks());

const HUMAN: AdkMessage[] = [{ id: "1", type: "human", content: "hi" }];

function sseResponse(frames: string[], init?: ResponseInit): Response {
  const body = frames.map((f) => `${f}\n\n`).join("");
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
    ...init,
  });
}

async function collect(
  gen: AsyncGenerator<AdkEvent> | Promise<AsyncGenerator<AdkEvent>>,
): Promise<AdkEvent[]> {
  const events: AdkEvent[] = [];
  for await (const e of await gen) events.push(e);
  return events;
}

function runConfig() {
  return {
    abortSignal: new AbortController().signal,
    initialize: async () => ({ remoteId: "r", externalId: undefined }),
  };
}

describe("createGatewayAdkStream", () => {
  it("posts the latest human turn as parts and yields parsed SSE events", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse([
        'data: {"id":"a","content":{"role":"model","parts":[{"text":"he"}]}}',
        'data: {"id":"b","content":{"role":"model","parts":[{"text":"llo"}]}}',
      ]),
    );
    const stream = createGatewayAdkStream({ api: "/api/agent/chat" });
    const events = await collect(stream(HUMAN, runConfig()));

    expect(events).toHaveLength(2);
    expect(events[0]!.content?.parts?.[0]?.text).toBe("he");
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      parts: [{ text: "hi" }],
    });
  });

  it("solves a Turnstile 403 and re-posts with the token in the body", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "turnstile_required" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        sseResponse(['data: {"id":"a","content":{"role":"model","parts":[{"text":"ok"}]}}']),
      );

    const solveChallenge = vi.fn().mockResolvedValue("tok_123");
    const stream = createGatewayAdkStream({ api: "/api/agent/chat", solveChallenge });
    const events = await collect(stream(HUMAN, runConfig()));

    expect(solveChallenge).toHaveBeenCalledOnce();
    expect(events).toHaveLength(1);
    const [, secondInit] = fetchMock.mock.calls[1]!;
    expect(JSON.parse((secondInit as RequestInit).body as string)).toEqual({
      parts: [{ text: "hi" }],
      turnstileToken: "tok_123",
    });
  });

  it("throws the gateway error message on a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "rate limited" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      }),
    );
    const stream = createGatewayAdkStream({ api: "/api/agent/chat" });
    await expect(collect(stream(HUMAN, runConfig()))).rejects.toThrow("rate limited");
  });

  it("flushes a final frame that has no trailing blank line", async () => {
    // No trailing \n\n on the last frame — must still be yielded.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        'data: {"id":"a","content":{"role":"model","parts":[{"text":"x"}]}}\n\n' +
          'data: {"id":"b","content":{"role":"model","parts":[{"text":"y"}]}}',
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );
    const stream = createGatewayAdkStream({ api: "/api/agent/chat" });
    const events = await collect(stream(HUMAN, runConfig()));
    expect(events).toHaveLength(2);
    expect(events[1]!.content?.parts?.[0]?.text).toBe("y");
  });

  it("parses frames delimited by CRLF blank lines", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        'data: {"id":"a","content":{"role":"model","parts":[{"text":"crlf"}]}}\r\n\r\n',
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );
    const stream = createGatewayAdkStream({ api: "/api/agent/chat" });
    const events = await collect(stream(HUMAN, runConfig()));
    expect(events).toHaveLength(1);
    expect(events[0]!.content?.parts?.[0]?.text).toBe("crlf");
  });

  it("calls onComplete after a clean stream", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      sseResponse(['data: {"id":"a","content":{"role":"model","parts":[{"text":"x"}]}}']),
    );
    const onComplete = vi.fn();
    const stream = createGatewayAdkStream({ api: "/api/agent/chat", onComplete });
    await collect(stream(HUMAN, runConfig()));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
