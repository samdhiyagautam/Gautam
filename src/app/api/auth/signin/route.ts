import { NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generic failure: identical for unknown email vs wrong password, so the
// endpoint cannot be used to enumerate admin addresses. Details go to
// server logs only.
const GENERIC_FAILURE = "Invalid email or password.";

export async function POST(request: NextRequest) {
  // Per-IP throttle: 5 attempts per 10 minutes (in-memory, best-effort on
  // serverless — Supabase also enforces its own auth rate limits).
  const ip = clientIp(request);
  const ipLimit = rateLimit(`signin:ip:${ip}`, 5, 10 * 60 * 1000);
  if (!ipLimit.allowed) {
    const response = NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(ipLimit.retryAfterSeconds));
    return response;
  }

  try {
    const { email, password, redirectTo } = await request.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Per-email throttle, keyed by IP + address so one attacker cannot
    // starve the owner's login budget from many IPs.
    const emailLimit = rateLimit(`signin:email:${ip}:${normalizedEmail}`, 5, 10 * 60 * 1000);
    if (!emailLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many attempts. Please try again later." },
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
        { error: "Auth is not configured. Set Supabase env vars to enable sign-in." },
        { status: 503 }
      );
    }

    const next = safeNextPath(redirectTo);

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Password sign-in only — accounts are created by the owner in the
    // Supabase dashboard, never self-registered from this form.
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error("Password sign-in failed:", error.message);
      return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401 });
    }

    // Allowlist check: a valid password alone is not enough.
    const { isAdminEmail } = await import("@/lib/auth");
    const { data } = await supabase.auth.getUser();
    const allowed = await isAdminEmail(data.user?.email ?? null);
    if (!allowed) {
      await supabase.auth.signOut();
      console.error("Sign-in denied: email not on admin allowlist.");
      return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401 });
    }

    return NextResponse.json({ success: true, redirectTo: next });
  } catch (error) {
    console.error("Password sign-in failed:", error);
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 500 });
  }
}
