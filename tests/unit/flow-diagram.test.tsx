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
