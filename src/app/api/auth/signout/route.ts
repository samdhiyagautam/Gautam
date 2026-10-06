import { redirect } from "next/navigation";

export async function GET() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase not configured or session already gone — still leave /admin.
  }
  redirect("/admin/auth");
}
