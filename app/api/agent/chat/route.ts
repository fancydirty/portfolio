import { gatewayHeaders, gatewayUrl } from "@/lib/agent/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const headers = gatewayHeaders({
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  });
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const upstream = await fetch(`${gatewayUrl()}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream",
    "Cache-Control": "no-cache, no-store, no-transform",
    "X-Accel-Buffering": "no",
  });
  const setCookie = upstream.headers.get("set-cookie");
  const streamId = upstream.headers.get("x-stream-id");
  if (setCookie) responseHeaders.set("set-cookie", setCookie);
  if (streamId) responseHeaders.set("x-stream-id", streamId);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
