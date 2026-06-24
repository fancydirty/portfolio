"use client";

export type SlashCommand = "/new" | "/compact";

/**
 * Fire a session slash command (`/new` or `/compact`) at the same-origin chat
 * proxy as a one-shot turn, independent of the assistant-ui thread. The backend
 * swaps the session on receipt; the caller is expected to remount the runtime
 * afterwards so the thread reloads. The SSE body is drained and discarded —
 * we only care that the session changed, not the streamed reply. Never throws:
 * a failed command leaves the existing session intact.
 */
export async function sendSlashCommand(command: SlashCommand): Promise<void> {
  try {
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parts: [{ text: command }] }),
      credentials: "include",
    });
    await response.body?.cancel().catch(() => undefined);
  } catch {
    // Swallow — the session is unchanged and the caller stays usable.
  }
}
