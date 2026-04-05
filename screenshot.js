import { chromium } from "playwright";

const baseUrl = process.env.URL || "http://localhost:4322";

async function capture() {
  const browser = await chromium.launch();
  const contexts = [
    { name: "desktop", width: 1280, height: 720 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const ctx of contexts) {
    const page = await browser.newPage({ viewport: { width: ctx.width, height: ctx.height } });

    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `screenshot-${ctx.name}-en.png`, fullPage: true });

    await page.goto(`${baseUrl}/zh/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `screenshot-${ctx.name}-zh.png`, fullPage: true });

    await page.close();
  }

  await browser.close();
  console.log("Screenshots captured.");
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
