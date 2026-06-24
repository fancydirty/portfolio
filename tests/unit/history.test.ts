import { describe, it, expect } from "vitest";
import { historyToAdkMessages } from "@/lib/agent/history";

describe("historyToAdkMessages", () => {
  it("maps user → human and assistant → ai with prefixed ids", () => {
    const result = historyToAdkMessages([
      { id: 1, role: "user", content: "hi" },
      { id: 2, role: "assistant", content: "hello" },
    ]);
    expect(result).toEqual([
      { id: "h-1", type: "human", content: "hi" },
      { id: "h-2", type: "ai", content: "hello" },
    ]);
  });

  it("skips empty content and unknown roles", () => {
    const result = historyToAdkMessages([
      { id: 1, role: "user", content: "" },
      { id: 2, role: "system", content: "ignored" } as never,
      { id: 3, role: "assistant", content: "kept" },
    ]);
    expect(result).toEqual([{ id: "h-3", type: "ai", content: "kept" }]);
  });

  it("returns [] for non-array / nullish input", () => {
    expect(historyToAdkMessages(undefined)).toEqual([]);
    expect(historyToAdkMessages(null)).toEqual([]);
  });
});
