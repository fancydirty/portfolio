"use client";

import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";

/**
 * Markdown renderer for assistant message text. The `.agent-md` class supplies
 * the prose styling (headings, lists, code) that Tailwind Preflight strips —
 * see `app/globals.css`. No remark plugins, to keep the bundle lean.
 */
export function MarkdownText() {
  return <MarkdownTextPrimitive className="agent-md" />;
}
