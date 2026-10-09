import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Shield, Database, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getServerSession, isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
  description: "Read-only system status",
};

// Read-only status page. Every value here is checked live — nothing is
// decorative, and no secret value is ever rendered (only set / not set).
async function checkSupabase(): Promise<{ reachable: boolean; adminCount: number | null }> {
  if (!isAuthConfigured()) return { reachable: false, adminCount: null };
  try {
    const supabase = await createClient();
    const profiles = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const admins = await supabase.from("admin_users").select("email", { count: "exact", head: true });
    return { reachable: !profiles.error, adminCount: admins.error ? null : (admins.count ?? 0) };
  } catch {
    return { reachable: false, adminCount: null };
  }
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="font-medium">{label}</p>
        {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      </div>
      <span
        className={
          ok
            ? "flex items-center gap-1 text-sm text-green-600 dark:text-green-400 shrink-0"
            : "flex items-center gap-1 text-sm text-destructive shrink-0"
        }
      >
        {ok ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
        {ok ? "OK" : "Not set"}
      </span>
    </div>
  );
}

export default async function AdminSettings() {
  const [session, supabase] = await Promise.all([getServerSession(), checkSupabase()]);
  const siteUrlSet = !!process.env.NEXT_PUBLIC_SITE_URL;
  const resendSet = !!process.env.RESEND_API_KEY && !!process.env.CONTACT_TO_EMAIL;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Read-only system status. Site content is edited in Profile, SEO and the other admin sections.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">← Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <div className="py-2">
            <p className="font-medium">Signed in as</p>
            <p className="text-sm text-muted-foreground">{session?.user.email ?? "—"}</p>
          </div>
          <StatusRow
            label="Allowlisted admins"
            ok={(supabase.adminCount ?? 0) > 0}
            detail={
              supabase.adminCount === null
                ? "Could not read admin_users — run the SQL migrations."
                : `${supabase.adminCount} email${supabase.adminCount === 1 ? "" : "s"} in public.admin_users`
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Database & Storage</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <StatusRow
            label="Supabase connection"
            ok={supabase.reachable}
            detail={supabase.reachable ? "Database reachable and tables found." : "Not reachable, or migrations not applied."}
          />
          <div className="py-2">
            <p className="font-medium">Storage bucket</p>
            <p className="text-sm text-muted-foreground">portfolio-assets — resume PDF and images (5 MB limit)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Deployment configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <StatusRow
            label="NEXT_PUBLIC_SITE_URL"
            ok={siteUrlSet}
            detail="Used for magic-link redirects and canonical URLs."
          />
          <StatusRow
            label="Contact form delivery (RESEND_API_KEY + CONTACT_TO_EMAIL)"
            ok={resendSet}
            detail={resendSet ? "Messages are emailed to you." : "Not configured — the form falls back to a mailto link."}
          />
        </CardContent>
      </Card>
    </div>
  );
}
