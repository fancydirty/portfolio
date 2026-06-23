import { describe, it, expect } from "vitest";
import { projects } from "@/lib/content/projects";
const BANNED = [/blackwhitematch/i, /bwwm/i, /bwminsights/i, /\binterracial\b/i, /sogo/i,
  /mailcow/i, /media\.dirtyfancy\.sbs/i, /successfulmatch/i, /postiz/i];
describe("projects data", () => {
  it("has the flagship first and 4 entries", () => {
    expect(projects).toHaveLength(4);
    expect(projects[0]!.id).toBe("mediary-scout");
    expect(projects[0]!.flagship).toBe(true);
  });
  it("every project has bilingual five-section content", () => {
    for (const p of projects) for (const lang of ["en","zh"] as const) {
      const c = p.content[lang];
      for (const k of ["whatItIs","inputsOutputs","whatMadeItHard","whatIDecided","whatChanged"] as const)
        expect(c[k].length, `${p.id}.${lang}.${k}`).toBeGreaterThan(20);
    }
  });
  it("leaks no private subject matter and no nonexistent URL", () => {
    const blob = JSON.stringify(projects);
    for (const re of BANNED) expect(re.test(blob), `leaked ${re}`).toBe(false);
  });
  it("flagship links to repo + demo only (not the nonexistent private instance)", () => {
    expect(projects[0]!.links.demo).toBe("https://mediary.dirtyfancy.sbs");
    expect(projects[0]!.links.repo).toContain("github.com/fancydirty/mediary-scout");
  });
});
