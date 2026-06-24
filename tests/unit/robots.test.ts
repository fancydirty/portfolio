import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  const r = robots();

  it("allows all crawlers at the root", () => {
    expect(r.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });

  it("points at the absolute sitemap URL", () => {
    expect(r.sitemap).toBe("https://portfolio.dirtyfancy.sbs/sitemap.xml");
  });
});
