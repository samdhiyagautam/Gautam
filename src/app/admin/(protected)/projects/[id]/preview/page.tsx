import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProjectDetailView, DetailTopNav } from "@/components/portfolio/project-detail";
import { getAdminProject } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Preview Project",
  description: "Preview a project exactly as it will appear when published",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

// Draft → Preview: renders the project (any status) in the public layout
// so nothing incomplete is published by accident.
export default async function ProjectPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getAdminProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Preview — {project.name}</h1>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium">{project.status}</span> · Only published projects appear on the public site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/projects">
              <span>← All Projects</span>
            </Link>
          </Button>
          <Button variant="premium" asChild>
            <Link href={`/admin/projects/${project.id}/edit`}>
              <span>Edit</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="min-h-screen bg-background">
          <DetailTopNav href="/admin/projects" label="Back to Projects (preview)" />
          <ProjectDetailView project={project} />
        </div>
      </div>
    </div>
  );
}
