/**
 * Storage-path helpers shared by admin server actions and tests.
 *
 * Pure functions only — no Supabase imports — so they can be unit-tested
 * without a database.
 */

/** The single public bucket all portfolio uploads live in. */
export const BUCKET = "portfolio-assets";

/**
 * Extract the object path inside the bucket from a public URL.
 * Returns null for foreign URLs (external video links, CDN-hosted files,
 * anything not uploaded to the bucket) and for malformed percent-encoding.
 */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  try {
    return decodeURIComponent(url.slice(markerIndex + marker.length).split("?")[0]);
  } catch {
    return null;
  }
}

/** Filesystem-safe object name for uploaded files: lowercase, limited charset. */
export function safeStorageName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "_");
}
