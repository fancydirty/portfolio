import { afterEach, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AgentSection } from "@/components/agent/agent-section";
import enDict from "@/lib/i18n/dictionaries/en";

afterEach(() => vi.restoreAllMocks());

test("renders the fallback link when the agent is unavailable", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  render(<AgentSection dict={enDict} />);
  await waitFor(() => {
    const link = screen.getByRole("link", { name: enDict.agent.fallbackCta });
    expect(link).toHaveAttribute("href", "https://agent.dirtyfancy.sbs");
  });
});

test("shows the section eyebrow regardless of availability", () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  render(<AgentSection dict={enDict} />);
  expect(screen.getByText(enDict.agent.eyebrow)).toBeInTheDocument();
});
