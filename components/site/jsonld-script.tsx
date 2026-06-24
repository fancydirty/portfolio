/**
 * Renders a JSON-LD `<script>` for a schema.org object. Kept as a component so
 * the layout stays declarative and the JSON is escaped/serialized in one place.
 * The object must be a plain serializable record (no React nodes, no Dates).
 */
export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
