import { gatewayHeaders, gatewayUrl } from "@/lib/agent/gateway";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const headers = gatewayHeaders();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const upstream = await fetch(`${gatewayUrl()}/api/me`, {
    method: "GET",
    headers,
  });

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) responseHeaders.set("set-cookie", setCookie);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
