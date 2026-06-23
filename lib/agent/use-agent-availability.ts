"use client";

import { useEffect, useState } from "react";

export type AgentAvailability = "loading" | "available" | "unavailable";

export function useAgentAvailability(): AgentAvailability {
  const [state, setState] = useState<AgentAvailability>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/me", { cache: "no-store", credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        setState(res.ok ? "available" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
