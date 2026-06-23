"use client";

import type {
  AdkEvent,
  AdkMessage,
  AdkMessageContentPart,
  AdkStreamCallback,
} from "@assistant-ui/react-google-adk";

export type TurnstileChallenge = {
  error: "turnstile_required";
  message?: string;
};

type CreateGatewayAdkStreamOptions = {
  /** Same-origin proxy route, e.g. "/api/agent/chat". */
  api: string;
  /** Resolve a Turnstile token when the gateway demands human verification. */
  solveChallenge?: (challenge: TurnstileChallenge) => Promise<string>;
  /** Called once the stream finishes without an abort. */
  onComplete?: () => void | Promise<void>;
};

/**
 * A focused ADK stream adapter for the portfolio's same-origin proxy.
 *
 * Flow: build the request body from the latest human turn, POST it, handle a
 * Turnstile 403 by solving the challenge and re-POSTing with the token in the
 * body, then parse the `data: {json}` SSE frames into `AdkEvent`s.
 *
 * Deliberately omits the resumable-stream recovery/replay machinery of the
 * source adk-agent frontend — a recruiter quick-chat retries on error instead.
 */
export function createGatewayAdkStream(
  options: CreateGatewayAdkStreamOptions,
): AdkStreamCallback {
  return async function* (messages, config) {
    const body = messagesToBody(messages);
    const signal = config.abortSignal;

    let response = await postChat(options.api, body, signal);

    const challenge = await parseTurnstileChallenge(response);
    if (challenge) {
      if (!options.solveChallenge) {
        throw new Error(challenge.message ?? "Human verification required");
      }
      const token = await options.solveChallenge(challenge);
      response = await postChat(
        options.api,
        { ...body, turnstileToken: token },
        signal,
      );
    }

    if (!response.ok) {
      throw new Error(await errorMessageFromResponse(response));
    }

    yield* parseSseResponse(response, signal);

    if (!signal.aborted) {
      await options.onComplete?.();
    }
  };
}

async function postChat(
  api: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    signal,
  });
}

/**
 * The gateway manages session history server-side via the anonymous cookie, so
 * each turn only needs the latest human message. Falls back to an empty text
 * part if no human message is present.
 */
function messagesToBody(messages: AdkMessage[]): Record<string, unknown> {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message && message.type === "human") {
      return { parts: contentToParts(message.content) };
    }
  }
  return { parts: [{ text: "" }] };
}

function contentToParts(
  content: string | AdkMessageContentPart[],
): Record<string, unknown>[] {
  if (typeof content === "string") return [{ text: content }];

  return content.map((part) => {
    switch (part.type) {
      case "text":
        return { text: part.text };
      case "reasoning":
        return { text: part.text, thought: true };
      case "image":
        return { inlineData: { mimeType: part.mimeType, data: part.data } };
      case "image_url":
        return { fileData: { fileUri: part.url } };
      case "file":
        return {
          inlineData: { mimeType: part.mimeType, data: part.data },
          ...(part.filename ? { filename: part.filename } : {}),
        };
      case "file_url":
        return {
          fileData: {
            fileUri: part.url,
            ...(part.mimeType != null ? { mimeType: part.mimeType } : {}),
          },
        };
      default:
        return { text: "" };
    }
  });
}

async function parseTurnstileChallenge(
  response: Response,
): Promise<TurnstileChallenge | null> {
  if (response.status !== 403) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;

  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    return null;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    (payload as { error: unknown }).error === "turnstile_required"
  ) {
    return payload as TurnstileChallenge;
  }
  return null;
}

async function errorMessageFromResponse(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const payload = (await response.clone().json()) as Record<string, unknown>;
      if (typeof payload.message === "string") return payload.message;
      if (typeof payload.error === "string") return payload.error;
    } catch {
      // fall through to the status-based message
    }
  }
  return `Agent request failed: ${response.status} ${response.statusText}`;
}

/**
 * Reads the `text/event-stream` body and yields each `data:` frame parsed as an
 * `AdkEvent`. Frames are separated by a blank line; a frame may carry multiple
 * `data:` lines which join with newlines before JSON parsing.
 */
async function* parseSseResponse(
  response: Response,
  signal: AbortSignal,
): AsyncGenerator<AdkEvent> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;

      // Normalize CRLF so frame detection works even if a proxy rewrites
      // line endings (SSE frames are delimited by a blank line).
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const event = frameToEvent(frame);
        if (event) yield event;
        boundary = buffer.indexOf("\n\n");
      }
    }

    // Flush any trailing data: a final frame not terminated by a blank line
    // (stream ended mid-boundary) would otherwise be dropped.
    buffer += decoder.decode();
    const tail = frameToEvent(buffer);
    if (tail) yield tail;
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

function frameToEvent(frame: string): AdkEvent | null {
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("data: ")) dataLines.push(line.slice(6));
    else if (line.startsWith("data:")) dataLines.push(line.slice(5));
  }
  if (dataLines.length === 0) return null;

  try {
    return JSON.parse(dataLines.join("\n")) as AdkEvent;
  } catch {
    return null;
  }
}
