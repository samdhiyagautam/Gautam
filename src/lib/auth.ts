import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export function isAuthConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

/** Authenticated user or null. Uses getUser() (authenticates with the server). */
export async function getServerSession(): Promise<{ user: User } | null> {
  if (!isAuthConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }
    return { user: data.user };
  } catch {
    return null;
  }
}

/**
 * True when the email may administer the portfolio: listed in
 * public.admin_users, or matching ADMIN_EMAIL as a bootstrap fallback
 * (used before the first admin row is seeded).
 */
export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (!error && data) {
      return true;
    }
  } catch {
    // Table may not exist yet — fall through to the ADMIN_EMAIL bootstrap.
  }

  const bootstrap = process.env.ADMIN_EMAIL;
  return !!bootstrap && bootstrap.toLowerCase() === email.toLowerCase();
}

/**
 * Authenticated admin session or null. Non-admins are signed out and denied
 * by the caller (admin layout) — never silently granted access.
 */
export async function requireAdmin(): Promise<{ user: User } | null> {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  const allowed = await isAdminEmail(session.user.email);
  if (!allowed) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Best effort — access is still denied below.
    }
    return null;
  }
  return session;
}
