import { test, expect } from "@playwright/test";

test("home CTA links to the agent panel anchor", async ({ page }) => {
  await page.goto("/en");
  const cta = page.getByRole("link", {
    name: /^Or talk to my representative agent/i,
  });
  await expect(cta).toHaveAttribute("href", "/en/work/adk-agent#agent-panel");
});

test("adk-agent page always shows the agent section heading", async ({
  page,
}) => {
  await page.goto("/en/work/adk-agent");
  await expect(page.getByText("TALK TO MY AGENT")).toBeVisible();
});

test("panel degrades to a link when the gateway probe fails", async ({
  page,
}) => {
  // Force the unavailable state deterministically, independent of whether a
  // real gateway is configured in this environment.
  await page.route("**/api/agent/me", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/en/work/adk-agent");
  const fallback = page.getByRole("link", { name: /open the agent/i });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute("href", "https://agent.dirtyfancy.sbs");
});

test("agent section leaks no redline terms", async ({ page }) => {
  await page.goto("/en/work/adk-agent");
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const term of [
    "blackwhitematch",
    "bwwm",
    "interracial",
    "sogo",
    "mailcow",
    "successfulmatch",
    "postiz",
  ]) {
    expect(body, `leaked ${term}`).not.toContain(term);
  }
});

test("non-agent project pages do NOT mount the panel", async ({ page }) => {
  await page.goto("/en/work/mediary-scout");
  await expect(page.getByText("TALK TO MY AGENT")).toHaveCount(0);
});
