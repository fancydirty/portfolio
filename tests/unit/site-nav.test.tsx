import { afterEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/site/site-nav";
import enDict from "@/lib/i18n/dictionaries/en";

const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => mockPathname() }));

afterEach(() => vi.clearAllMocks());

test("shows the home section anchors on the home page", () => {
  mockPathname.mockReturnValue("/en");
  render(<SiteNav lang="en" nav={enDict.nav} themeToggle={enDict.themeToggle} />);
  expect(screen.getByRole("link", { name: enDict.nav.now })).toHaveAttribute(
    "href",
    "#now",
  );
});

test("hides the dead section anchors on a detail page, keeps logo + lang", () => {
  mockPathname.mockReturnValue("/en/work/adk-agent");
  render(<SiteNav lang="en" nav={enDict.nav} themeToggle={enDict.themeToggle} />);
  // No #now / #work etc. anchors that would do nothing on a detail page.
  expect(screen.queryByRole("link", { name: enDict.nav.now })).toBeNull();
  expect(screen.queryByRole("link", { name: enDict.nav.work })).toBeNull();
  // Brand (→ home) and language switch remain.
  expect(screen.getByRole("link", { name: /Zhou Le/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "中" })).toHaveAttribute("href", "/zh");
});
