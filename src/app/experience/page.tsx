import { Metadata } from "next";
import { Experience } from "@/components/portfolio/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "My professional experience timeline and key achievements",
};

export default function ExperiencePage() {
  return <Experience />;
}