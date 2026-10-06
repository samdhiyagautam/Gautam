import { Metadata } from "next";
import { Resume } from "@/components/portfolio/resume";
import { getPublishedResume } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download or view my professional resume",
};

export default async function ResumePage() {
  const resume = await getPublishedResume();
  return <Resume resume={resume} />;
}
