import { NextRequest, NextResponse } from "next/server";

// POST only: a GET sign-out can be triggered by any page (<img src=...>),
// which logs the admin out cross-site. Also require a same-origin request.
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase not configured or session already gone — still leave /admin.
  }

  // 303 turns the POST into a GET on the sign-in page.
  return NextResponse.redirect(new URL("/admin/auth", request.url), 303);
}
