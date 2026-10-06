/**
 * Allow only same-origin paths: must start with "/" but not "//" or "/\".
 * Prevents open-redirect attacks via `next` / `redirectTo` parameters.
 */
export function safeNextPath(value: unknown, fallback = "/admin"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value;
}
