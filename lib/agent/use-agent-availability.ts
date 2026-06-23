"use client";

import { useEffect, useState } from "react";

export type AgentAvailability = "loading" | "available" | "unavailable";

export function useAgentAvailability(): AgentAvailability {
  const [state, setState] = useState<AgentAvailability>("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/agent/me", {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => {
        setState(res.ok ? "available" : "unavailable");
      })
      .catch((error: unknown) => {
        // Ignore the abort that fires on unmount; only real failures degrade.
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("unavailable");
      });
    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
