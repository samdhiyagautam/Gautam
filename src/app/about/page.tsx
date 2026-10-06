import { Metadata } from "next";
import { About } from "@/components/portfolio/about";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my professional background and approach",
};

export default function AboutPage() {
  return <About />;
}