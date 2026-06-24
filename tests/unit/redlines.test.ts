import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REDLINE = [
  "blackwhitematch",
  "bwwm",
  "interracial",
  "sogo",
  "mailcow",
  "successfulmatch",
  "postiz",
  "media.dirtyfancy.sbs",
];

describe("README redline compliance", () => {
  it("leaks no redline terms", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8").toLowerCase();
    for (const term of REDLINE) {
      expect(readme, `leaked ${term}`).not.toContain(term);
    }
  });

  it("is not the create-next-app boilerplate", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    expect(readme).not.toContain("bootstrapped with");
  });
});
