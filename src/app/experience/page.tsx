import { Metadata } from "next";
import { Experience } from "@/components/portfolio/experience";
import { getPublishedExperiences } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Experience",
  description: "My professional experience timeline and key achievements",
};

export default async function ExperiencePage() {
  const experiences = await getPublishedExperiences();
  return (
    <>
      <h1 className="sr-only">Experience — Gautam Samdhiya, Data Analyst</h1>
      <Experience items={experiences} />
    </>
  );
}
