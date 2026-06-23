"use client";

import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";

/**
 * Minimal markdown renderer for assistant message text. Uses the assistant-ui
 * markdown primitive with no extra plugins to keep the bundle lean; inherits
 * prose styling from the surrounding editorial container.
 */
export function MarkdownText() {
  return <MarkdownTextPrimitive />;
}
