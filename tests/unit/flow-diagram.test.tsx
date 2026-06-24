import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlowDiagram } from "@/components/diagrams/flow-diagram";
import type { FlowSpec } from "@/components/diagrams/diagrams-data";

const spec: FlowSpec = {
  title: "demo flow",
  viewBox: "0 0 400 120",
  nodes: [
    { id: "a", label: "Alpha", sub: "start", x: 20, y: 40 },
    { id: "b", label: "Beta", sub: "end", x: 220, y: 40, accent: true },
  ],
  edges: [{ from: "a", to: "b" }],
};

test("renders a node card per node and an edge per edge", () => {
  render(<FlowDiagram spec={spec} />);
  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.getByText("Beta")).toBeInTheDocument();
  const root = screen.getByRole("img", { name: /demo flow/i });
  expect(root.querySelectorAll("[data-edge]").length).toBe(1);
});

test("flags exactly the accent (signature) node", () => {
  render(<FlowDiagram spec={spec} />);
  const root = screen.getByRole("img", { name: /demo flow/i });
  expect(root.querySelectorAll("[data-accent='true']").length).toBe(1);
  expect(root.querySelectorAll("[data-accent='false']").length).toBe(1);
});

test("colors come from theme tokens, not dark-only hex (so light mode flips)", () => {
  render(<FlowDiagram spec={spec} />);
  const root = screen.getByRole("img", { name: /demo flow/i });
  const markup = root.outerHTML;
  // The dark-theme hex literals must not be baked in — they can't follow .light.
  for (const darkHex of ["#141416", "#1a1a1d", "#232327", "#ededed", "#6c6c72"]) {
    expect(markup, `hardcoded ${darkHex}`).not.toContain(darkHex);
  }
  // Theme variables must drive the chrome instead.
  for (const token of ["var(--surface-1)", "var(--surface-2)", "var(--hairline)", "var(--ink)"]) {
    expect(markup, `missing ${token}`).toContain(token);
  }
});
