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

  assert.match(html, /Agent Product Engineering/i);
  assert.match(html, /production gateway/i);
  assert.match(html, /gateway boundaries/i);
  assert.match(html, /Talk to my web agent/i);
  assert.match(html, /https:\/\/agent\.dirtyfancy\.sbs/i);
  assert.match(html, /Selected Work/i);
  assert.match(html, /INDEX \/\/ SELECTED WORK/i);
  assert.match(html, /\[01\][\s\S]*adk-agent/i);
  assert.match(html, /candidate representative agent/i);
  assert.match(html, /Google ADK/i);
  assert.match(html, /FastAPI business gateway/i);
  assert.match(html, /Open agent/i);
  assert.match(html, /clawd-media-track/i);
  assert.match(html, /private enterprise workflow/i);
  assert.match(html, /private content pipeline/i);
  assert.match(html, /Hi,\s*I am Zhou Le/i);
  assert.match(html, /master'?s degree/i);
  assert.match(html, /UESTC/i);
  assert.match(html, /Portrait of Zhou Le/i);
  assert.match(html, /Focus/i);
  assert.match(html, /Agent product engineering/i);
  assert.match(html, /Background/i);
  assert.match(html, /B\.Eng\.\s+in\s+Software\s+Engineering;\s+M\.A\.\s+in\s+Translation/i);
  assert.match(html, /fancydirty/i);
  assert.match(html, /Codex/i);
  assert.match(html, /Opencode/i);
  assert.match(html, /OpenClaw/i);
  assert.match(html, /ADK/i);
  assert.match(html, /After four systems/i);
  assert.match(html, /Frameworks make demos cheap/i);
  assert.match(html, /The gateway is part of the agent/i);
  assert.match(html, /Latency is product behavior/i);
  assert.match(html, /DOSSIER/i);
  assert.match(html, /What it is/i);
  assert.match(html, /Inputs and outputs/i);
  assert.match(html, /What made it hard/i);
  assert.match(html, /What I decided/i);
  assert.match(html, /What changed/i);
  assert.match(html, /dossier-grid-single/i);

  const zhHtml = readFileSync(path.join(projectRoot, "dist", "zh", "index.html"), "utf8");

  assert.match(zhHtml, /索引 \/\/ 精选作品/i);
  assert.match(zhHtml, /\[01\][\s\S]*adk-agent/i);
  assert.match(zhHtml, /候选人代表 Agent/i);
  assert.match(zhHtml, /FastAPI 业务网关/i);
  assert.match(zhHtml, /和我的 Web Agent 聊聊/i);
  assert.match(zhHtml, /打开 Agent/i);
  assert.match(zhHtml, /Agent 产品工程/i);
  assert.match(zhHtml, /框架让 demo 变便宜/i);
  assert.match(zhHtml, /网关就是 Agent 的产品边界/i);
  assert.match(zhHtml, /延迟不是小问题，是体验本身/i);
});
