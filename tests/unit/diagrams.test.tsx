import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { AnimatedDiagram } from "@/components/diagrams/animated-diagram";
import { MediaryScoutDiagram } from "@/components/diagrams/mediary-scout-diagram";
import { AdkAgentDiagram } from "@/components/diagrams/adk-agent-diagram";
import { EnterpriseFlowDiagram } from "@/components/diagrams/enterprise-flow-diagram";
import { ContentPipelineDiagram } from "@/components/diagrams/content-pipeline-diagram";

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

describe("ported diagrams", () => {
  const BANNED = [/postiz/i, /blackwhitematch/i, /bwwm/i, /bwminsights/i, /interracial/i, /sogo/i, /mailcow/i, /successfulmatch/i, /88vip/i, /s\.utui/i, /wechat/i, /code review/i];
  it("each diagram renders and leaks no banned term", () => {
    for (const D of [MediaryScoutDiagram, AdkAgentDiagram, EnterpriseFlowDiagram, ContentPipelineDiagram]) {
      const html = renderToStaticMarkup(<D />);
      expect(html.length).toBeGreaterThan(50);
      for (const re of BANNED) expect(re.test(html), `leak ${re}`).toBe(false);
    }
  });
});
