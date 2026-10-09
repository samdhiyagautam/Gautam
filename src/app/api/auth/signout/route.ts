import { NextResponse } from "next/server";

// POST-only: signing out changes state, so GET must not trigger it
// (unexported methods return 405 automatically).
export async function POST() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[auth] sign out failed:", error);
  }
  return NextResponse.json({ success: true });
}
