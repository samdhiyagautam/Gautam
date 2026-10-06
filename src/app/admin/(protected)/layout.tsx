import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

// Server-side authorization gate for every admin page except /admin/auth.
// The parent admin layout provides the shell + client-side session; this
// layer enforces access on the server so protected HTML is never rendered
// for unauthenticated or non-admin visitors.
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
