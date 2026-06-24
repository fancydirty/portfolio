import { afterEach, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DiagramZoom } from "@/components/diagrams/diagram-zoom";

afterEach(() => {
  document.body.style.overflow = "";
});

test("opens a lightbox dialog on click and closes on Escape", () => {
  render(
    <DiagramZoom label="adk-agent system">
      <svg data-testid="diag" />
    </DiagramZoom>,
  );
  expect(screen.queryByRole("dialog")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: /enlarge adk-agent system/i }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("closes when the backdrop is clicked", () => {
  render(
    <DiagramZoom label="adk-agent system">
      <svg data-testid="diag" />
    </DiagramZoom>,
  );
  fireEvent.click(screen.getByRole("button", { name: /enlarge/i }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(dialog);
  expect(screen.queryByRole("dialog")).toBeNull();
});
