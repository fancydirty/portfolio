import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import { JsonLdScript } from "@/components/site/jsonld-script";

test("escapes </script> sequences to prevent tag breakout", () => {
  const { container } = render(
    <JsonLdScript data={{ x: "</script><b>hi</b>" }} />,
  );
  const script = container.querySelector(
    'script[type="application/ld+json"]',
  ) as HTMLScriptElement;
  const raw = script.textContent ?? "";
  // No literal </script> may appear in the embedded JSON.
  expect(raw).not.toContain("</script>");
  expect(raw).not.toContain("<b>");
  // The JSON must still round-trip to the original value.
  const parsed = JSON.parse(raw) as { x: string };
  expect(parsed.x).toBe("</script><b>hi</b>");
});

test("escapes & and U+2028/2029 for safe HTML embedding", () => {
  const { container } = render(
    <JsonLdScript data={{ a: "x & y", b: "line\u2028break" }} />,
  );
  const script = container.querySelector(
    'script[type="application/ld+json"]',
  ) as HTMLScriptElement;
  const raw = script.textContent ?? "";
  expect(raw).not.toContain(" & ");
  expect(raw).not.toContain("\u2028");
  const parsed = JSON.parse(raw) as { a: string; b: string };
  expect(parsed.a).toBe("x & y");
  expect(parsed.b).toBe("line\u2028break");
});
