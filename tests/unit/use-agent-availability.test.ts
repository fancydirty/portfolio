import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAgentAvailability } from "@/lib/agent/use-agent-availability";

afterEach(() => vi.restoreAllMocks());

describe("useAgentAvailability", () => {
  it("reports available when /api/agent/me is ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    const { result } = renderHook(() => useAgentAvailability());
    expect(result.current).toBe("loading");
    await waitFor(() => expect(result.current).toBe("available"));
  });

  it("reports unavailable when the probe fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useAgentAvailability());
    await waitFor(() => expect(result.current).toBe("unavailable"));
  });

  it("reports unavailable on a non-2xx probe", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("x", { status: 502 }),
    );
    const { result } = renderHook(() => useAgentAvailability());
    await waitFor(() => expect(result.current).toBe("unavailable"));
  });
});
