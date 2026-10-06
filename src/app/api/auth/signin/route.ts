import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

export async function GET() {
  // Legacy server-side entry point — send users to the sign-in page.
  redirect("/admin/auth");
}

export async function POST() {
  // Password sign-in is not implemented — Supabase magic links are the supported method.
  // Return an honest status instead of silently failing.
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Auth is not configured. Set Supabase env vars, then use a magic link." },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { error: "Password sign-in is not enabled. Use a magic link instead." },
    { status: 501 }
  );
}
