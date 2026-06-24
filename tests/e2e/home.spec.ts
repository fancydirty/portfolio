import { test, expect } from "@playwright/test";
test("EN home shows positioning + editorial index, leaks nothing", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText(/don't have to babysit/i)).toBeVisible();
  await expect(page.getByText("SELECTED WORK")).toBeVisible();
  await expect(page.getByRole("link", { name: /Mediary Scout/ })).toBeVisible();
  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const term of ["blackwhitematch","bwwm","interracial","sogo","mailcow","media.dirtyfancy.sbs","successfulmatch","postiz"]) {
    expect(body, `leaked ${term}`).not.toContain(term);
  }
});
test("EN home emits canonical, hreflang, and an OG image", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/en$/,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="zh"]'),
  ).toHaveAttribute("href", /\/zh$/);
  const og = await page
    .locator('meta[property="og:image"]')
    .first()
    .getAttribute("content");
  expect(og, "og:image present").toBeTruthy();
});

test("zh locale renders", async ({ page }) => {
  await page.goto("/zh");
  await expect(page).toHaveURL(/\/zh/);
  await expect(page.getByRole("link", { name: /Mediary Scout/ })).toBeVisible();
});
test("root redirects to a locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|zh)$/);
});
test("root honors Accept-Language (zh → /zh, en → /en)", async ({ browser }) => {
  // Chromium controls the Accept-Language header itself, so extraHTTPHeaders
  // won't move it — the context `locale` option is what actually sets it.
  const zhCtx = await browser.newContext({ locale: "zh-CN" });
  const zhPage = await zhCtx.newPage();
  await zhPage.goto("/");
  await expect(zhPage).toHaveURL(/\/zh$/);
  await zhCtx.close();

  const enCtx = await browser.newContext({ locale: "en-US" });
  const enPage = await enCtx.newPage();
  await enPage.goto("/");
  await expect(enPage).toHaveURL(/\/en$/);
  await enCtx.close();
});

test("emits a Person JSON-LD script", async ({ page }) => {
  await page.goto("/en");
  const el = page.locator('script[type="application/ld+json"]').first();
  await expect(el).toBeAttached();
  const raw = await el.textContent();
  const obj = JSON.parse(raw ?? "{}");
  expect(obj["@type"]).toBe("Person");
  expect(obj.name).toBe("Zhou Le");
});
