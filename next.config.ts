import type { NextConfig } from "next";

// Supabase project host for CSP allowlists, derived from env so no extra
// wildcard is needed. Empty when Supabase is not configured (local dev).
function supabaseHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

const host = supabaseHost();
const connectSrc = ["'self'", ...(host ? [`https://${host}`, `wss://${host}`] : [])].join(" ");
// img-src needs data: (inline SVG grain) plus the Supabase storage host.
const imgSrc = ["'self'", "data:", ...(host ? [`https://${host}`] : [])].join(" ");

const csp = [
  "default-src 'self'",
  // Next.js hydration + Tailwind v4 inject inline <script>/<style> tags, so
  // 'unsafe-inline' is required. No remote scripts are allowlisted.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc}`,
  `connect-src ${connectSrc}`,
  "font-src 'self' data:",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Exact project host only when configured — no wildcard, no unused hosts.
      ...(host
        ? [
            {
              protocol: "https" as const,
              hostname: host,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "X-Frame-Options", value: "DENY" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/resume.pdf",
      headers: [
        // Short cache with revalidation so a newly published resume goes
        // live quickly; no forced download so "View in Browser" works
        // (the Download button already uses the download attribute).
        { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
      ],
    },
  ],
};

export default nextConfig;
