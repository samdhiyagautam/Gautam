import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));

  if (!configured) {
    redirect("/admin/auth?error=unconfigured");
  }

  if (!code) {
    redirect("/admin/auth?error=missing-code");
  }

  // Exchange the code first and capture the outcome — redirect() throws
  // NEXT_REDIRECT, so it must be called OUTSIDE the try/catch (see
  // Next.js docs: redirect "should be called outside the try block").
  let exchangeOk = false;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    exchangeOk = !error;
  } catch {
    exchangeOk = false;
  }

  if (!exchangeOk) {
    redirect("/admin/auth?error=exchange-failed");
  }

  redirect(next);
}
