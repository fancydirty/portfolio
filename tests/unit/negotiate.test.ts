import { describe, expect, it } from "vitest";
import { negotiateLocale } from "@/lib/i18n/negotiate";

describe("negotiateLocale", () => {
  it("maps a leading zh tag to zh", () => {
    expect(negotiateLocale("zh-CN")).toBe("zh");
    expect(negotiateLocale("zh")).toBe("zh");
    expect(negotiateLocale("zh-HK,en;q=0.8")).toBe("zh");
  });

  it("falls back to the default locale for anything not leading with zh", () => {
    expect(negotiateLocale("en-US")).toBe("en");
    expect(negotiateLocale("en,zh;q=0.6")).toBe("en");
    expect(negotiateLocale("fr-FR")).toBe("en");
  });

  it("handles an empty header", () => {
    expect(negotiateLocale("")).toBe("en");
  });
});
