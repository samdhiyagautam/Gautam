import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Save, Search, Globe, Image, Link2, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO",
  description: "Manage SEO settings",
};

const DEFAULT_SEO = {
  pageTitle: "[ADD YOUR NAME] | Assistant Manager | Data Analytics | AI-Enabled Business Solutions",
  metaDescription: "Assistant Manager with 2+ years of experience combining business understanding, data analytics, AI-assisted workflows, and modern technology to solve practical problems.",
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "[ADD YOUR NAME]",
    jobTitle: "Assistant Manager",
    worksFor: {
      "@type": "Organization",
      name: "Dhuri Na Venture Private Limited",
    },
    knowsAbout: ["Data Analytics", "Business Intelligence", "Python", "SQL", "Power BI", "Next.js", "React", "AI Automation"],
    url: "https://[ADD YOUR DOMAIN]",
    sameAs: [
      "https://linkedin.com/in/[ADD YOUR LINKEDIN]",
      "https://github.com/[ADD YOUR GITHUB]",
    ],
  },
};

export default async function AdminSEO() {
  // Auth is enforced by the admin layout.
  return (
    <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
            <p className="text-muted-foreground">Manage search engine optimization settings</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <span>← Dashboard</span>
            </Link>
          </Button>
        </div>

        <form className="space-y-6" id="seo-form">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <CardTitle>General SEO</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageTitle">Page Title *</Label>
                <Input id="pageTitle" name="pageTitle" defaultValue={DEFAULT_SEO.pageTitle} required />
                <p className="text-xs text-muted-foreground">Main title shown in browser tabs and search results (50-60 chars recommended)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description *</Label>
                <Textarea id="metaDescription" name="metaDescription" rows={3} defaultValue={DEFAULT_SEO.metaDescription} required />
                <p className="text-xs text-muted-foreground">Description shown in search results (150-160 chars recommended)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Open Graph (Facebook, LinkedIn, etc.)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input id="ogImage" name="ogImage" defaultValue={DEFAULT_SEO.ogImage} placeholder="/og-image.png" />
                <p className="text-xs text-muted-foreground">Recommended: 1200x630px. Place in public/ folder.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterCard">Twitter Card Type</Label>
                <Input id="twitterCard" name="twitterCard" defaultValue={DEFAULT_SEO.twitterCard} placeholder="summary_large_image" />
                <p className="text-xs text-muted-foreground">Options: summary, summary_large_image, app, player</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-primary" />
                <CardTitle>Structured Data (JSON-LD)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="structuredData">Person Schema</Label>
                <Textarea
                  id="structuredData"
                  name="structuredData"
                  rows={15}
                  defaultValue={JSON.stringify(DEFAULT_SEO.structuredData, null, 2)}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">JSON-LD structured data for rich search results. Validate at <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Rich Results Test</a>.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-background">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                  <span>Google Search Preview</span>
                </div>
                <div className="font-medium text-primary" id="preview-title">{DEFAULT_SEO.pageTitle}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">https://[ADD YOUR DOMAIN]/</div>
                <div className="text-sm text-muted-foreground" id="preview-description">{DEFAULT_SEO.metaDescription}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="premium">
              <Save className="h-4 w-4 mr-2" />
              Save SEO Settings
            </Button>
          </div>
        </form>
      </div>
  );
}