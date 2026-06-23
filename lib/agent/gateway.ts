// Server-only helpers for the agent proxy routes. Never import from a
// "use client" module — the secret must not reach the browser bundle.

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
