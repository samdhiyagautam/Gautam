import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView, DetailTopNav } from "@/components/portfolio/project-detail";
import { getPublishedProject } from "@/lib/cms";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getPublishedProject(resolvedParams.id);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.name,
    description: project.problem,
    openGraph: {
      title: project.name,
      description: project.problem,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const project = await getPublishedProject(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <DetailTopNav href="/projects" label="Back to Projects" />
      <ProjectDetailView project={project} />
    </div>
  );
}
