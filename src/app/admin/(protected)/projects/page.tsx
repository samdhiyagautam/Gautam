import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Star, StarOff, Eye } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PublishButton } from "@/components/admin/publish-button";
import { deleteProject } from "@/actions/admin";
import { getAllProjects } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your portfolio projects",
};

function getCategoryLabel(category: string) {
  const labels = {
    "data-analytics": "Data Analytics",
    "ai-automation": "AI & Automation",
    "web-applications": "Web Applications",
    "creative-technology": "Creative Technology",
  };
  return labels[category as keyof typeof labels] || category;
}

export default async function AdminProjects() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <span>← Dashboard</span>
            </Link>
          </Button>
          <Button variant="premium" asChild>
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Featured</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      No projects yet. Add your first real project with verifiable proof.
                    </td>
                  </tr>
                )}
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-4 font-medium">{project.name}</td>
                    <td className="p-4">
                      <Badge variant="outline">{getCategoryLabel(project.category)}</Badge>
                    </td>
                    <td className="p-4">
                      {project.isFeatured ? (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" aria-label="Featured" />
                      ) : (
                        <StarOff className="h-5 w-5 text-muted-foreground" aria-label="Not featured" />
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={project.status === "published" ? "premium" : "outline"}>
                        {project.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild aria-label="Edit project">
                          <Link href={`/admin/projects/${project.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild aria-label="Preview project">
                          <Link href={`/admin/projects/${project.id}/preview`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteButton id={project.id} action={deleteProject} label="Delete project" />
                        <PublishButton table="projects" id={project.id} status={project.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
