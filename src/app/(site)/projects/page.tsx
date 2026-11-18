import { Metadata } from "next";
import { Projects } from "@/components/portfolio/projects";
import { getPublishedProjects } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects demonstrating practical problem-solving across data, AI, and web development",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return (
    <>
      <h1 className="sr-only">Projects — Gautam Samdhiya, Data Analyst</h1>
      <Projects projects={projects} />
    </>
  );
}
