import { redirect } from "next/navigation";

// Static safety-net fallback for `/`. The proxy (proxy.ts) performs the smart
// Accept-Language redirect at the edge; this page only runs if the proxy is
// bypassed or disabled, so it stays a dumb redirect to the default locale and
// stays statically prerenderable (no headers() read, no dynamic rendering).
export default function Root() {
  redirect("/en");
}
