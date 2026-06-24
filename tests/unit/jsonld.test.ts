import { expect, it } from "vitest";
import { personJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

it("builds a Person JSON-LD object with the expected shape", () => {
  const out = personJsonLd({
    sameAs: ["https://github.com/fancydirty", "https://example.com/me"],
  });
  expect(out["@context"]).toBe("https://schema.org");
  expect(out["@type"]).toBe("Person");
  expect(out.name).toBe("Zhou Le");
  expect(out.alternateName).toBe("周乐");
  expect(out.url).toBe(SITE_URL);
  expect(out.jobTitle).toBe("Agent Product Engineer");
  expect(out.sameAs).toEqual([
    "https://github.com/fancydirty",
    "https://example.com/me",
  ]);
});

it("passes sameAs through verbatim and keeps it an array", () => {
  const out = personJsonLd({ sameAs: [] });
  expect(Array.isArray(out.sameAs)).toBe(true);
  expect(out.sameAs).toEqual([]);
});
