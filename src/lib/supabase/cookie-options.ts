/**
 * Cookie attributes for the Supabase session, shared by every client
 * (proxy, server components/actions, browser). `Secure` keeps the session
 * cookie off plain-HTTP requests in production; SameSite=Lax keeps it off
 * cross-site POSTs. (HttpOnly is not possible: the browser client reads it.)
 */
export const SUPABASE_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
