// Escapes `<` before serializing JSON-LD for a <script> tag. Without this, a
// value containing "</script><script>...</script>" (e.g. an admin-editable
// product name or description) breaks out of the JSON-LD block and injects
// arbitrary HTML/script into every page that renders it.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
