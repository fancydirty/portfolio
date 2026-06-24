"use client";

import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/agent/me";

export type AgentAvailability = "loading" | "available" | "unavailable";

export function useAgentAvailability(): AgentAvailability {
  const [state, setState] = useState<AgentAvailability>("loading");

  useEffect(() => {
    let active = true;
    fetchMe().then((r) => {
      if (active) setState(r.ok ? "available" : "unavailable");
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
