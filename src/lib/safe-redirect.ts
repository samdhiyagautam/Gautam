const SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

/**
 * Allow only same-origin paths. Rejects:
 * - non-strings and empty values,
 * - anything not starting with "/",
 * - protocol-relative URLs ("//evil"),
 * - backslashes anywhere ("/\\evil", "/foo\\bar" — browser-dependent parsing),
 * - absolute URIs with a scheme ("javascript:…", "https://…", "/https://…" is
 *   safe as a path but rejected anyway to keep the allowlist obvious).
 * Returns `fallback` for everything rejected.
 */
export function safeNextPath(value: unknown, fallback = "/admin"): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (
    trimmed === "" ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(trimmed) ||
    SCHEME_RE.test(trimmed) ||
    SCHEME_RE.test(trimmed.slice(1))
  ) {
    return fallback;
  }
  return trimmed;
}
