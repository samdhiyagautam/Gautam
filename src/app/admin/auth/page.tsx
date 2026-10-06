"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Loader2, AlertCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { safeNextPath } from "@/lib/safe-redirect";

const AUTH_ERRORS: Record<string, string> = {
  "unconfigured": "Auth backend is not configured. Set Supabase env vars to enable sign-in.",
  "exchange-failed": "Could not complete sign-in. The link may have expired — request a new one.",
  "missing-code": "No sign-in code was provided. Request a new magic link.",
  "forbidden": "This email is not authorized for admin access. Contact the site owner.",
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

function AdminAuthForm() {
  const searchParams = useSearchParams();
  // Validate the post-login destination: same-origin paths only.
  const callbackUrl = safeNextPath(searchParams.get("callbackUrl"));
  const errorParam = searchParams.get("error");
  const error = errorParam ? (AUTH_ERRORS[errorParam] ?? "Sign-in failed. Please try again.") : null;

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const authConfigured = isSupabaseConfigured();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: callbackUrl }),
      });

      if (response.ok) {
        setLinkSent(true);
        toast.success("Magic link sent! Check your email.");
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Failed to send magic link");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Admin Sign In</CardTitle>
          <CardDescription>Passwordless sign-in for the portfolio owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!authConfigured && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm" role="status">
              <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span className="text-muted-foreground">
                Auth backend is not configured. Set <code className="rounded bg-background px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="rounded bg-background px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable sign-in.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {linkSent ? (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-center space-y-2">
              <p className="font-medium">Check your inbox</p>
              <p className="text-muted-foreground">
                A sign-in link is on its way to {email}. It expires in 60 minutes.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setLinkSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magicEmail">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="magicEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Magic Link"
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Only allowlisted admin emails can sign in.{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Back to site
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading sign in" />
        </div>
      }
    >
      <AdminAuthForm />
    </Suspense>
  );
}
