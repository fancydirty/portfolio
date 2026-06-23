import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";

describe("AnimatedDiagram", () => {
  it("renders its title (a11y label) + children svg", () => {
    const { getByRole, container } = render(
      <AnimatedDiagram title="Test flow">
        <svg viewBox="0 0 20 20">
          <path data-flow d="M0 0 L10 10" />
        </svg>
      </AnimatedDiagram>,
    );
    expect(getByRole("img", { name: "Test flow" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelector("path[data-flow]")).toBeTruthy();
  });
});
