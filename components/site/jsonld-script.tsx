/**
 * Escape a JSON string for safe embedding inside a `<script>` tag. `JSON.stringify`
 * alone does not escape `<`, `>`, `&`, or the U+2028/2029 line/paragraph
 * separators, any of which can break out of the script context (`</script>` is
 * the obvious danger). Escaping to JSON unicode sequences keeps the output
 * valid JSON (it round-trips through JSON.parse) while neutralizing the HTML
 * breakout vectors.
 */
function htmlEscapeJsonString(str: string): string {
  return str
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Renders a JSON-LD `<script>` for a schema.org object. Kept as a component so
 * the layout stays declarative; serialization + HTML-escaping live here so the
 * rest of the app never has to think about script-context injection. The object
 * must be a plain serializable record (no React nodes, no Dates).
 */
export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: htmlEscapeJsonString(JSON.stringify(data)) }}
    />
  );
}
