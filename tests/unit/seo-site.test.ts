import { describe, it, expect } from "vitest";
import { SITE_URL, buildAlternates } from "@/lib/seo/site";

describe("SITE_URL", () => {
  it("is an absolute https URL with no trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});

describe("buildAlternates", () => {
  it("builds canonical + both language alternates for the home path", () => {
    expect(buildAlternates("en", "")).toEqual({
      canonical: "/en",
      languages: { en: "/en", zh: "/zh" },
    });
  });

  it("builds canonical + alternates for a work path", () => {
    expect(buildAlternates("zh", "/work/mediary-scout")).toEqual({
      canonical: "/zh/work/mediary-scout",
      languages: {
        en: "/en/work/mediary-scout",
        zh: "/zh/work/mediary-scout",
      },
    });
  });
});
