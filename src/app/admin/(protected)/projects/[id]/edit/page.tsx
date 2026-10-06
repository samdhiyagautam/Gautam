import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/admin/project-form";
import { getAdminProject } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Edit Project",
  description: "Edit a portfolio project",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getAdminProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/projects">
            <span>← Back</span>
          </Link>
        </Button>
      </div>
      <ProjectForm initial={project} />
    </div>
  );
}
