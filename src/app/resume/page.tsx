import { Metadata } from "next";
import { Resume } from "@/components/portfolio/resume";
import { getPublishedResume, getPublishedExperiences } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download or view my professional resume",
};

export default async function ResumePage() {
  const [resume, experiences] = await Promise.all([
    getPublishedResume(),
    getPublishedExperiences(),
  ]);
  return <Resume resume={resume} experiences={experiences} />;
}
