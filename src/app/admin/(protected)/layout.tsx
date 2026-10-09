import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

// Server-side authorization gate for every admin page except /admin/auth.
// The parent admin layout provides the shell + client-side session.
// NOTE: layouts and pages render in parallel and the response may already be
// streaming when this redirect fires, so this check alone does NOT guarantee
// the admin markup is withheld. The real guarantees are: src/proxy.ts (307
// for visitors without a session), requireAdmin() inside every server
// action, and RLS (admin_users / is_admin()) on every table.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/admin/auth");
  }
  return <>{children}</>;
}
