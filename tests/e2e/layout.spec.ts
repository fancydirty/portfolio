import { test, expect } from "@playwright/test";

// Regression guard for the cacheComponents client-nav duplication bug:
// client-side navigation must REPLACE the page, never leave the previous
// page's <main>/<h1> mounted alongside the new one.
// (We assert on <h1>/<main> counts, NOT <header> — a detail page legitimately
//  has 2 <header>: the site nav + the article header.)

test("client-side navigation does not duplicate the page (row → detail)", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);

  await page.getByRole("link", { name: /Mediary Scout/i }).click();
  await page.waitForURL(/\/en\/work\/mediary-scout/);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("client-side language switch does not duplicate the page", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("link", { name: "中" }).click();
  await page.waitForURL(/\/zh/);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
});
