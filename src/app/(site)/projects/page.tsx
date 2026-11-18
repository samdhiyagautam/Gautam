import { Metadata } from "next";
import { Projects } from "@/components/portfolio/projects";
import { getPublishedProjects } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Case Studies | Data Analytics Projects",
  description:
    "Three end-to-end data analytics case studies featuring real ball-by-ball IPL analysis, retail sales KPI modeling, and operational executive dashboards using SQL, Python, Power BI, and Excel.",
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
