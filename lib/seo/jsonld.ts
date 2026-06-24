import { SITE_URL } from "@/lib/seo/site";

/**
 * Build a schema.org `Person` JSON-LD object for the site owner. `sameAs` is
 * passed in from the locale dictionary so the profile URLs stay in one place.
 */
export function personJsonLd({
  sameAs,
}: {
  sameAs: string[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zhou Le",
    alternateName: "周乐",
    url: SITE_URL,
    jobTitle: "Agent Product Engineer",
    sameAs,
  };
}
