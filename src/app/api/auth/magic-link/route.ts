import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generic response: identical whether the email exists or not, so the
// endpoint cannot be used to enumerate admin addresses. Real errors are
// logged server-side only.
const GENERIC_SUCCESS = { success: true };

export async function POST(request: NextRequest) {
  // Per-IP throttle: 5 magic-link requests per 10 minutes (in-memory,
  // best-effort on serverless — Supabase also enforces its own email limits).
  const ip = clientIp(request);
  const ipLimit = rateLimit(`magic-link:ip:${ip}`, 5, 10 * 60 * 1000);
  if (!ipLimit.allowed) {
    const response = NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(ipLimit.retryAfterSeconds));
    return response;
  }

  try {
    const { email, redirectTo } = await request.json();

    // Malformed input is rejected plainly — this reveals nothing about
    // whether an address exists.
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Per-email throttle: same budget, keyed by address.
    const emailLimit = rateLimit(`magic-link:email:${normalizedEmail}`, 5, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(emailLimit.retryAfterSeconds));
      return response;
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
      email: normalizedEmail,
      options: {
        emailRedirectTo,
        // Never auto-create auth users from this form — the owner allowlists
        // addresses in Supabase Auth first, then in public.admin_users.
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("Magic link request failed:", error.message);
    }

    // Always respond identically — success, unknown address, and send
    // failures are indistinguishable to the caller.
    return NextResponse.json(GENERIC_SUCCESS);
  } catch (error) {
    console.error("Magic link request failed:", error);
    return NextResponse.json(GENERIC_SUCCESS);
  }
}
