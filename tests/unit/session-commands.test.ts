import { describe, it, expect, vi, afterEach } from "vitest";
import { sendSlashCommand } from "@/lib/agent/session-commands";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchOk() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    body: null,
  } as unknown as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("sendSlashCommand", () => {
  it("POSTs the command as a text part to the chat proxy", async () => {
    const fetchMock = mockFetchOk();
    await sendSlashCommand("/new");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/agent/chat");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(JSON.parse(init.body as string)).toEqual({
      parts: [{ text: "/new" }],
    });
  });

  it("sends /compact when asked", async () => {
    const fetchMock = mockFetchOk();
    await sendSlashCommand("/compact");
    const init = fetchMock.mock.calls[0]![1];
    expect(JSON.parse(init.body as string)).toEqual({
      parts: [{ text: "/compact" }],
    });
  });

  it("resolves even if the request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    await expect(sendSlashCommand("/new")).resolves.toBeUndefined();
  });
});
