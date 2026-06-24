"use client";

export type MeResult = { ok: boolean; data: unknown };

// Module-level in-flight cache. Two callers in the same tick (the availability
// probe and the runtime `load`) share one network request; the cache clears the
// moment it settles so a later remount (after /new or /compact) refetches.
let inFlight: Promise<MeResult> | null = null;

export async function fetchMe(): Promise<MeResult> {
  if (inFlight) return inFlight;
  const p = (async (): Promise<MeResult> => {
    try {
      const res = await fetch("/api/agent/me", {
        cache: "no-store",
        credentials: "include",
      });
      const data = res.ok ? await res.json().catch(() => null) : null;
      return { ok: res.ok, data };
    } catch {
      return { ok: false, data: null };
    } finally {
      inFlight = null;
    }
  })();
  inFlight = p;
  return p;
}

/** Test-only: clear the in-flight cache between tests. */
export function __resetMeCacheForTests(): void {
  inFlight = null;
}
