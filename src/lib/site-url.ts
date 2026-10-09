/**
 * Canonical public origin of the site (no trailing slash).
 * Order: explicit NEXT_PUBLIC_SITE_URL, then Vercel's production domain
 * (so previews of a misconfigured deploy never advertise localhost),
 * then localhost for local development.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
