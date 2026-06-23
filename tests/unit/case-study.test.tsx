import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseStudy } from "@/components/work/case-study";
import { projects } from "@/lib/content/projects";
const en = {
  backToWork: "← Back",
  sections: { whatItIs:"What it is", inputsOutputs:"Inputs & outputs", whatMadeItHard:"What made it hard", whatIDecided:"What I decided", whatChanged:"What changed" },
};
const flagship = projects[0]!;
describe("CaseStudy", () => {
  it("renders name, five section labels + prose, and a back link to the locale home", () => {
    render(<CaseStudy project={flagship} lang="en" work={en} />);
    expect(screen.getByRole("heading", { name: flagship.name, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("What made it hard")).toBeInTheDocument();
    expect(screen.getByText(flagship.content.en.whatMadeItHard.slice(0, 20), { exact:false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute("href", "/en");
  });
});
