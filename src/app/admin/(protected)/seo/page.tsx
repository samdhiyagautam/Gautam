import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeoForm } from "@/components/admin/seo-form";
import { getAdminSeo } from "@/lib/cms";

export const metadata: Metadata = {
  title: "SEO",
  description: "Manage SEO settings",
};

export default async function AdminSEO() {
  const seo = await getAdminSeo();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
          <p className="text-muted-foreground">Search preview, social cards, and metadata.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">
            <span>← Dashboard</span>
          </Link>
        </Button>
      </div>

      <SeoForm initial={seo} />
    </div>
  );
}
