import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { diagramFor } from "@/components/diagrams/registry";
import { DIAGRAMS } from "@/components/diagrams/diagrams-data";

describe("diagramFor", () => {
  it("returns a diagram for each known id and null for an unknown id", () => {
    for (const id of Object.keys(DIAGRAMS)) {
      expect(diagramFor(id), id).not.toBeNull();
    }
    expect(diagramFor("does-not-exist")).toBeNull();
  });

  const BANNED = [
    /postiz/i,
    /blackwhitematch/i,
    /bwwm/i,
    /bwminsights/i,
    /interracial/i,
    /sogo/i,
    /mailcow/i,
    /successfulmatch/i,
    /s\.utui/i,
  ];

  it("each diagram renders and leaks no banned term", () => {
    for (const id of Object.keys(DIAGRAMS)) {
      const html = renderToStaticMarkup(diagramFor(id) as ReactElement);
      expect(html.length, id).toBeGreaterThan(50);
      for (const re of BANNED) expect(re.test(html), `leak ${re} in ${id}`).toBe(false);
    }
  });
});
