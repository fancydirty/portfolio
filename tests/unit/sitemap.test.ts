import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { projects } from "@/lib/content/projects";

describe("sitemap", () => {
  const entries = sitemap();

  it("has one entry per page per locale (home + projects)", () => {
    expect(entries).toHaveLength((projects.length + 1) * 2);
  });

  it("uses absolute https URLs under the production origin", () => {
    for (const e of entries) {
      expect(e.url).toMatch(/^https:\/\/portfolio\.dirtyfancy\.sbs\/(en|zh)/);
    }
  });

  it("includes the flagship project for both locales with language alternates", () => {
    const ms = entries.filter((e) => e.url.endsWith("/work/mediary-scout"));
    expect(ms).toHaveLength(2);
    expect(ms[0]!.alternates?.languages).toMatchObject({
      en: "https://portfolio.dirtyfancy.sbs/en/work/mediary-scout",
      zh: "https://portfolio.dirtyfancy.sbs/zh/work/mediary-scout",
    });
  });
});
