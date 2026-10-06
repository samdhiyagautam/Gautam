import { redirect } from "next/navigation";

export async function GET() {
  // Sign-out is handled client-side when Supabase is configured.
  // Without Supabase there is no session to clear — go back to sign-in.
  redirect("/admin/auth");
}
