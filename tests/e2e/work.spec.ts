import { test, expect } from "@playwright/test";

test("home row navigates to case study; detail renders; no leaks", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: /Mediary Scout/i }).click();
  await expect(page).toHaveURL(/\/en\/work\/mediary-scout/);
  await expect(page.getByRole("heading", { name: "Mediary Scout", level: 1 })).toBeVisible();
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const t of ["postiz","blackwhitematch","bwwm","interracial","sogo","mailcow","successfulmatch","wechat","media.dirtyfancy.sbs"]) {
    expect(body, `leak ${t}`).not.toContain(t);
  }
  await page.getByRole("link", { name: /back/i }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("zh detail page renders the case study", async ({ page }) => {
  await page.goto("/zh/work/adk-agent");
  await expect(page.getByRole("heading", { name: "adk-agent", level: 1 })).toBeVisible();
});

test("private project detail leaks nothing", async ({ page }) => {
  await page.goto("/en/work/content-pipeline");
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const t of ["postiz","blackwhitematch","bwwm","interracial","dating","social scheduler"]) {
    if (t === "social scheduler") continue; // allowed generic label
    expect(body, `leak ${t}`).not.toContain(t);
  }
  await expect(page.getByRole("heading", { name: /content pipeline/i })).toBeVisible();
});
