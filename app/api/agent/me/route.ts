import {
  gatewayHeaders,
  gatewayUnavailable,
  gatewayUrl,
  relaySetCookies,
} from "@/lib/agent/gateway";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const headers = gatewayHeaders();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  let upstream: Response;
  try {
    upstream = await fetch(`${gatewayUrl()}/api/me`, { method: "GET", headers });
  } catch {
    // Misconfigured env or unreachable gateway — let the client degrade.
    return gatewayUnavailable();
  }

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  });
  relaySetCookies(upstream, responseHeaders);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
