import { afterEach, expect, it, vi } from "vitest";
import { fetchMe, __resetMeCacheForTests } from "@/lib/agent/me";

afterEach(() => {
  vi.restoreAllMocks();
  __resetMeCacheForTests();
});

it("dedupes concurrent calls into a single fetch", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));

  await Promise.all([fetchMe(), fetchMe(), fetchMe()]);

  expect(fetchSpy).toHaveBeenCalledTimes(1);
});

it("refetches after the in-flight promise settles", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));

  await fetchMe();
  await fetchMe();

  expect(fetchSpy).toHaveBeenCalledTimes(2);
});

it("parses ok responses and exposes the data", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ currentSession: { messages: [] } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  const r = await fetchMe();
  expect(r.ok).toBe(true);
  expect(
    (r.data as { currentSession: { messages: [] } }).currentSession.messages,
  ).toEqual([]);
});

it("reports ok=false on a non-2xx response", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("x", { status: 502 }),
  );
  const r = await fetchMe();
  expect(r.ok).toBe(false);
  expect(r.data).toBeNull();
});

it("reports ok=false on a network failure", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  const r = await fetchMe();
  expect(r.ok).toBe(false);
  expect(r.data).toBeNull();
});
