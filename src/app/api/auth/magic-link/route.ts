import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Per-IP throttle: 5 magic-link requests per 10 minutes (in-memory,
  // best-effort on serverless — Supabase also enforces its own email limits).
  const ip = clientIp(request);
  const limit = rateLimit(ip, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    const response = NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(limit.retryAfterSeconds));
    return response;
  }

  try {
    const { email, redirectTo } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const configured = !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));

    if (!configured) {
      return NextResponse.json(
        { error: "Auth is not configured. Set Supabase env vars to enable magic links." },
        { status: 503 }
      );
    }

    // Validate the post-login path (open-redirect protection), then build an
    // absolute callback URL — Supabase requires emailRedirectTo to be absolute
    // and allowlisted in the project settings.
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
    const next = safeNextPath(redirectTo);
    const emailRedirectTo = `${siteUrl}/api/auth/callback?next=${encodeURIComponent(next)}`;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        // Never auto-create auth users from this form — the owner allowlists
        // addresses in Supabase Auth first, then in public.admin_users.
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("Magic link request failed:", error.message);
      return NextResponse.json(
        { error: "Could not send the magic link. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
