"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession, isSupabaseConfigured } from "@/hooks/use-session";
import { LayoutDashboard, User, Briefcase, Code, FolderKanban, FileText, Settings, Search, LogOut, Menu, ChevronLeft, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const isAuthPage = pathname.startsWith("/admin/auth");
  const authConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isLoading && !session && !isAuthPage) {
      router.push(`/admin/auth?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, isLoading, isAuthPage, pathname, router]);

  // Auth page renders outside the shell so unauthenticated users can sign in.
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Loading admin" />
      </div>
    );
  }

  if (!session) {
    return null; // Redirect handled by useEffect.
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(sidebarCollapsed && "justify-center")}
          >
            {sidebarCollapsed ? <ChevronLeft className="h-5 w-5 rotate-180" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = getIcon(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  sidebarCollapsed && "justify-center"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <span className="h-5 w-5" aria-hidden="true">🌐</span>
            {!sidebarCollapsed && <span>View Site</span>}
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={cn("flex-1 flex flex-col min-w-0 lg:ml-64", sidebarCollapsed && "lg:ml-16")}>
        <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {session.user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium hidden sm:block">
                  {session.user?.email || "Admin"}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/api/auth/signout" className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </a>
            </Button>
          </div>
        </header>

        {!authConfigured && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm" role="status">
            <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <p className="text-muted-foreground">
              Supabase is not configured. Admin data is shown from local content and changes are not persisted.
              Add <code className="rounded bg-background px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="rounded bg-background px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable auth and persistence.
            </p>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function getIcon(href: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    "/admin": LayoutDashboard,
    "/admin/profile": User,
    "/admin/experience": Briefcase,
    "/admin/skills": Code,
    "/admin/projects": FolderKanban,
    "/admin/resume": FileText,
    "/admin/seo": Search,
    "/admin/settings": Settings,
  };
  return icons[href] || LayoutDashboard;
}
