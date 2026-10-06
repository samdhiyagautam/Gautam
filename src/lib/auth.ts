import { createClient } from "@/lib/supabase/server";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

export async function getServerSession() {
  // No Supabase configured (local dev without credentials) — no session.
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return session;
}

export function isAuthConfigured(): boolean {
  return isSupabaseConfigured();
}
