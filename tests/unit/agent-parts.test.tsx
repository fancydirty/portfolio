import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { AgentReasoning } from "@/components/agent/agent-reasoning";
import { AgentToolFallback } from "@/components/agent/agent-tool";

test("reasoning renders the thought text", () => {
  const props = { text: "let me search the repos" } as unknown as ComponentProps<
    typeof AgentReasoning
  >;
  render(<AgentReasoning {...props} />);
  expect(screen.getByText(/let me search the repos/i)).toBeInTheDocument();
});

test("tool chip shows the tool name and a running status", () => {
  const props = {
    toolName: "search_repos",
    status: { type: "running" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...props} />);
  expect(screen.getByText("search_repos")).toBeInTheDocument();
  expect(screen.getByText(/running/i)).toBeInTheDocument();
});

test("tool chip shows a check on completion", () => {
  const props = {
    toolName: "read_file",
    status: { type: "complete" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...props} />);
  expect(screen.getByText("read_file")).toBeInTheDocument();
  expect(screen.getByText("✓")).toBeInTheDocument();
});

test("tool chip status uses a theme-aware class, not an inline color", () => {
  const complete = {
    toolName: "read_file",
    status: { type: "complete" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...complete} />);
  expect(screen.getByText("✓")).toHaveClass("agent-tool-ok");

  const failed = {
    toolName: "search",
    status: { type: "incomplete" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...failed} />);
  expect(screen.getByText(/failed/i)).toHaveClass("agent-tool-fail");

  const running = {
    toolName: "search",
    status: { type: "running" },
  } as unknown as ComponentProps<typeof AgentToolFallback>;
  render(<AgentToolFallback {...running} />);
  expect(screen.getByText(/running/i)).toHaveClass("agent-tool-run");
});
