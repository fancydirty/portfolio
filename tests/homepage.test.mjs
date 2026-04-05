import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

test("homepage presents the portfolio framing and selected work", () => {
  execFileSync("npm", ["run", "build"], {
    cwd: projectRoot,
    stdio: "pipe",
    env: {
      ...process.env,
      PATH: `/usr/local/bin:${process.env.PATH ?? ""}`,
    },
  });

  const html = readFileSync(path.join(projectRoot, "dist", "index.html"), "utf8");

  assert.match(html, /practical agent workflows/i);
  assert.match(html, /Selected Work/i);
  assert.match(html, /INDEX \/\/ SELECTED WORK/i);
  assert.match(html, /clawd-media-track/i);
  assert.match(html, /private enterprise workflow/i);
  assert.match(html, /private content pipeline/i);
  assert.match(html, /Hi,\s*I am Zhou Le/i);
  assert.match(html, /master'?s degree/i);
  assert.match(html, /UESTC/i);
  assert.match(html, /github\.com\/fancydirty\.png\?size=160/i);
  assert.match(html, /Focus/i);
  assert.match(html, /Agent workflows/i);
  assert.match(html, /Background/i);
  assert.match(html, /B\.Eng\.\s+in\s+Software\s+Engineering;\s+M\.A\.\s+in\s+Translation/i);
  assert.match(html, /fancydirty/i);
  assert.match(html, /Codex/i);
  assert.match(html, /Opencode/i);
  assert.match(html, /OpenClaw/i);
  assert.match(html, /specific person,\s*team,\s*or\s*workflow/i);
  assert.match(html, /DOSSIER/i);
  assert.match(html, /What it is/i);
  assert.match(html, /Inputs and outputs/i);
  assert.match(html, /What made it hard/i);
  assert.match(html, /What I decided/i);
  assert.match(html, /What changed/i);
  assert.match(html, /dossier-grid-single/i);
});
