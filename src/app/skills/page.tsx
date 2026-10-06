import { Metadata } from "next";
import { Skills } from "@/components/portfolio/skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "My technical skills organized by category with proficiency levels",
};

export default function SkillsPage() {
  return <Skills />;
}