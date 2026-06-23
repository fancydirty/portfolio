import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SelectedWork } from "@/components/home/selected-work";
import { projects } from "@/lib/content/projects";

describe("SelectedWork (editorial index)", () => {
  it("renders the eyebrow and a row per project with index numbers + names", () => {
    render(<SelectedWork projects={projects} lang="en" eyebrow="SELECTED WORK" />);
    expect(screen.getByText("SELECTED WORK")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("Mediary Scout")).toBeInTheDocument();
  });
  it("marks the flagship row and is NOT a card/pill layout", () => {
    const { container } = render(<SelectedWork projects={projects} lang="en" eyebrow="SELECTED WORK" />);
    expect(screen.getByText(/flagship/i)).toBeInTheDocument();
    // editorial, not cards: no rounded-card or pill chrome
    expect(container.querySelector('[class*="rounded-xl"],[class*="rounded-2xl"],[class*="rounded-full"]')).toBeNull();
  });
  it("renders zh summaries when lang=zh", () => {
    render(<SelectedWork projects={projects} lang="zh" eyebrow="精选作品" />);
    expect(screen.getByText("精选作品")).toBeInTheDocument();
    expect(screen.getByText("Mediary Scout")).toBeInTheDocument();
  });
  it("links each row to its case-study route", () => {
    render(<SelectedWork projects={projects} lang="en" eyebrow="SELECTED WORK" />);
    const link = screen.getByRole("link", { name: /Mediary Scout/i });
    expect(link).toHaveAttribute("href", "/en/work/mediary-scout");
  });
});
