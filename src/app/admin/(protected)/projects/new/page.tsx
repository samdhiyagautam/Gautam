import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata: Metadata = {
  title: "New Project",
  description: "Create a portfolio project",
};

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground">Starts as a draft until you publish it.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/projects">
            <span>← Back</span>
          </Link>
        </Button>
      </div>
      <ProjectForm />
    </div>
  );
}
