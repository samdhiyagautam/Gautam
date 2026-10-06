import { Metadata } from "next";
import { Skills } from "@/components/portfolio/skills";
import { getPublishedSkills } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Skills",
  description: "My technical skills organized by category with proficiency levels",
};

export default async function SkillsPage() {
  const skills = await getPublishedSkills();
  return <Skills skills={skills} />;
}
