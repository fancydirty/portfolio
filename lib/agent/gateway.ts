// Server-only helpers for the agent proxy routes. The `server-only` import
// makes an accidental import from a client component a build-time error, so the
// secret can never reach the browser bundle.
import "server-only";

export function gatewayUrl(): string {
  const raw = process.env.GATEWAY_URL;
  if (!raw) {
    throw new Error("GATEWAY_URL is not set");
  }
  return raw.replace(/\/$/, "");
}

export function gatewayHeaders(
  base?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = { ...(base ?? {}) };
  const secret = process.env.GATEWAY_PROXY_SECRET;
  if (secret) {
    headers["x-gateway-secret"] = secret;
  }
  return headers;
}

/**
 * Relay every Set-Cookie header from the gateway, not just the first. A single
 * `Headers.get("set-cookie")` collapses multiple cookies into one malformed
 * value, so prefer `getSetCookie()` (Node 18+) and append each individually.
 */
export function relaySetCookies(from: Response, to: Headers): void {
  const cookies =
    typeof from.headers.getSetCookie === "function"
      ? from.headers.getSetCookie()
      : [from.headers.get("set-cookie")].filter((c): c is string => c !== null);
  for (const cookie of cookies) {
    to.append("set-cookie", cookie);
  }
}

/** JSON 503 used when the gateway is unconfigured or unreachable. */
export function gatewayUnavailable(): Response {
  return new Response(JSON.stringify({ error: "agent_gateway_unavailable" }), {
    status: 503,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
