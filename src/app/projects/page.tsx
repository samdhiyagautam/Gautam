import { Metadata } from "next";
import { Projects } from "@/components/portfolio/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects demonstrating practical problem-solving across data, AI, and web development",
};

export default function ProjectsPage() {
  return <Projects />;
}