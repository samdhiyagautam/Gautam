import Link from "next/link";
import { GitBranch, ExternalLink, ChevronLeft, BarChart2, Zap, Layout, Image, CheckCircle, Table, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isPlaceholderLink } from "@/lib/utils";
import type { Project } from "@/types";

const CATEGORY_ICONS = {
  "data-analytics": BarChart2,
  "ai-automation": Zap,
  "web-applications": Layout,
  "creative-technology": Image,
} as const;

const CATEGORY_LABELS = {
  "data-analytics": "Data Analytics",
  "ai-automation": "AI & Automation",
  "web-applications": "Web Applications",
  "creative-technology": "Creative Technology",
} as const;

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
}

/** Convert YouTube watch/shorts/share URLs to a privacy-enhanced embed URL. */
function toYouTubeEmbed(url: string): string | null {
  if (!url || isPlaceholderLink(url)) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

/** Shared Problem → Approach → Solution → Outcome layout for public and admin preview. */
export function ProjectDetailView({ project }: { project: Project }) {
  const Icon = CATEGORY_ICONS[project.category as keyof typeof CATEGORY_ICONS] ?? Layout;
  const youTubeEmbed = toYouTubeEmbed(project.videoUrl);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {getCategoryLabel(project.category)}
          </Badge>
          {project.isFeatured && (
            <Badge variant="premium">Featured</Badge>
          )}
          <Badge variant="outline">{project.status}</Badge>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">{project.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{project.problem}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {(youTubeEmbed || project.videos.length > 0) && (
            <Card>
              <CardContent className="p-6 pt-0 space-y-4">
                <h2 className="text-2xl font-bold mb-4">Watch</h2>
                {youTubeEmbed && (
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
                    <iframe
                      src={youTubeEmbed}
                      title={`${project.name} — demo video`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {project.videos.map((url) => (
                  <video key={url} controls preload="none" className="w-full rounded-xl border border-border">
                    <source src={url} />
                    Your browser does not support video playback.
                  </video>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4">Problem</h2>
              <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4">Approach</h2>
              <p className="text-muted-foreground leading-relaxed">{project.approach}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4">Solution</h2>
              <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-3">
                {project.keyFeatures.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4">Outcome</h2>
              <p className="text-muted-foreground leading-relaxed">{project.outcome}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold">Project Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">My Role</p>
                  <p>{project.role}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-muted/50">{tech}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Links</p>
                  <div className="flex flex-col gap-2">
                    {project.githubUrl && !isPlaceholderLink(project.githubUrl) && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4" />
                          <span>View on GitHub</span>
                        </a>
                      </Button>
                    )}
                    {project.liveDemoUrl && !isPlaceholderLink(project.liveDemoUrl) && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4" />
                          <span>Live Demo</span>
                        </a>
                      </Button>
                    )}
                    {project.caseStudyUrl && !isPlaceholderLink(project.caseStudyUrl) && (
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <span>Case Study</span>
                          <ChevronLeft className="h-4 w-4 rotate-180" />
                        </a>
                      </Button>
                    )}
                    {project.datasetUrl && !isPlaceholderLink(project.datasetUrl) && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={project.datasetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <Table className="h-4 w-4" />
                          <span>Open Spreadsheet</span>
                        </a>
                      </Button>
                    )}
                    {project.attachments.map((url, i) => (
                      <Button key={url} variant="ghost" asChild className="w-full justify-start">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span className="truncate">{url.split("/").pop() || `Dataset ${i + 1}`}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Quick Facts</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{getCategoryLabel(project.category)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd><Badge variant={project.status === "published" ? "premium" : "outline"}>{project.status}</Badge></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Featured</dt>
                  <dd>{project.isFeatured ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export function DetailTopNav({ href, label }: { href: string; label: string }) {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link href={href} className="inline-flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </div>
    </nav>
  );
}
