import {
  gatewayHeaders,
  gatewayUnavailable,
  gatewayUrl,
  relaySetCookies,
} from "@/lib/agent/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Internet-facing endpoint: fail closed on malformed JSON.
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const headers = gatewayHeaders({
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  });
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl()}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    // Misconfigured env or unreachable gateway — let the client degrade.
    return gatewayUnavailable();
  }

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream",
    "Cache-Control": "no-cache, no-store, no-transform",
    "X-Accel-Buffering": "no",
  });
  relaySetCookies(upstream, responseHeaders);
  const streamId = upstream.headers.get("x-stream-id");
  if (streamId) responseHeaders.set("x-stream-id", streamId);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
