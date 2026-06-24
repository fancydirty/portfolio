import { describe, expect, it } from "vitest";
import { DIAGRAMS } from "@/components/diagrams/diagrams-data";

describe("DIAGRAMS data", () => {
  it("has the 4 expected specs", () => {
    expect(Object.keys(DIAGRAMS).sort()).toEqual(
      ["adk-agent", "content-pipeline", "enterprise-workflow", "mediary-scout"].sort(),
    );
  });

  it("each spec has unique node ids and edges referencing existing nodes", () => {
    for (const [id, spec] of Object.entries(DIAGRAMS)) {
      const ids = spec.nodes.map((n) => n.id);
      expect(new Set(ids).size, `${id} unique ids`).toBe(ids.length);
      for (const e of spec.edges) {
        expect(ids, `${id} edge.from ${e.from}`).toContain(e.from);
        expect(ids, `${id} edge.to ${e.to}`).toContain(e.to);
      }
    }
  });

  it("each spec marks exactly one accent (signature) node", () => {
    for (const [id, spec] of Object.entries(DIAGRAMS)) {
      expect(spec.nodes.filter((n) => n.accent).length, `${id} accent count`).toBe(1);
    }
  });
});
