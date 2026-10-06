import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));

  if (!configured) {
    redirect("/admin/auth?error=unconfigured");
  }

  if (code) {
    const { createClient } = await import("@/lib/supabase/server");
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        redirect(next);
      }
    } catch {
      redirect("/admin/auth?error=exchange-failed");
    }
  }

  redirect("/admin/auth?error=missing-code");
}
