import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, BarChart2, Zap, Layout, Image, Star, StarOff } from "lucide-react";
import { PROJECT_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your portfolio projects",
};

const PROJECTS_DATA = [
  {
    id: "1",
    name: "Portfolio Website",
    category: "web-applications",
    isFeatured: true,
    status: "published" as const,
    order: 1,
    githubUrl: "[ADD GITHUB URL]",
    liveDemoUrl: "[ADD LIVE DEMO URL]",
  },
  {
    id: "2",
    name: "Executive Dashboard",
    category: "data-analytics",
    isFeatured: true,
    status: "published" as const,
    order: 2,
    githubUrl: "",
    liveDemoUrl: "",
  },
  {
    id: "3",
    name: "AI-Assisted Reporting Automation",
    category: "ai-automation",
    isFeatured: true,
    status: "published" as const,
    order: 3,
    githubUrl: "[ADD GITHUB URL]",
    liveDemoUrl: "",
  },
  {
    id: "4",
    name: "Operations Portal",
    category: "web-applications",
    isFeatured: true,
    status: "published" as const,
    order: 4,
    githubUrl: "[ADD GITHUB URL]",
    liveDemoUrl: "[ADD LIVE DEMO URL]",
  },
  {
    id: "5",
    name: "Sales Analytics Pipeline",
    category: "data-analytics",
    isFeatured: false,
    status: "published" as const,
    order: 5,
    githubUrl: "[ADD GITHUB URL]",
    liveDemoUrl: "",
  },
  {
    id: "6",
    name: "AI Content Generation Toolkit",
    category: "ai-automation",
    isFeatured: false,
    status: "published" as const,
    order: 6,
    githubUrl: "[ADD GITHUB URL]",
    liveDemoUrl: "",
  },
];

function getCategoryIcon(category: string) {
  const icons = {
    "data-analytics": BarChart2,
    "ai-automation": Zap,
    "web-applications": Layout,
    "creative-technology": Image,
  };
  const Icon = icons[category as keyof typeof icons];
  return Icon ? <Icon className="h-4 w-4 mr-2" /> : <Layout className="h-4 w-4 mr-2" />;
}

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
  // Auth is enforced by the admin layout.
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Links</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PROJECTS_DATA.map((project) => (
                    <tr key={project.id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-4 font-medium">{project.name}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(project.category)}
                          {getCategoryLabel(project.category)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {project.isFeatured ? (
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-5 w-5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={project.status === "published" ? "premium" : "outline"}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{project.order}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {project.githubUrl && project.githubUrl !== "[ADD GITHUB URL]" && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
                                <span className="text-xs">GH</span>
                              </a>
                            </Button>
                          )}
                          {project.liveDemoUrl && project.liveDemoUrl !== "[ADD LIVE DEMO URL]" && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" title="Live Demo">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Fill in GitHub and Live Demo URLs for each project. Use placeholders where information is not yet available.</p>
        </div>
      </div>
  );
}