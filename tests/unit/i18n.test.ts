import { describe, it, expect } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";
describe("dictionaries", () => {
  it("en and zh expose the same keys (deep)", async () => {
    const en = await getDictionary("en");
    const zh = await getDictionary("zh");
    const keys = (o: unknown, p = ""): string[] =>
      Array.isArray(o)
        ? o.flatMap((v, i) => keys(v, `${p}[${i}].`))
        : o && typeof o === "object"
          ? Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => keys(v, `${p}${k}.`))
          : [p];
    expect(keys(en).sort()).toEqual(keys(zh).sort());
    expect(en.hero.line).toBeTruthy();
    expect(zh.hero.line).toBeTruthy();
  });
});
