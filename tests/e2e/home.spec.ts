import { test, expect } from "@playwright/test";
test("EN home shows positioning + editorial index, leaks nothing", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText(/demo and product/i)).toBeVisible();
  await expect(page.getByText("SELECTED WORK")).toBeVisible();
  await expect(page.getByText("Mediary Scout")).toBeVisible();
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const term of ["blackwhitematch","bwwm","interracial","sogo","mailcow","media.dirtyfancy.sbs","successfulmatch","postiz"]) {
    expect(body, `leaked ${term}`).not.toContain(term);
  }
});
test("zh locale renders", async ({ page }) => {
  await page.goto("/zh");
  await expect(page).toHaveURL(/\/zh/);
  await expect(page.getByText("Mediary Scout")).toBeVisible();
});
test("root redirects to a locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|zh)$/);
});
