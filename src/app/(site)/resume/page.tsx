import { Metadata } from "next";
import { Resume } from "@/components/portfolio/resume";
import { getPublishedResume, getPublishedExperiences } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Resume | Gautam Samdhiya — Data Analyst",
  description:
    "Download or view the professional ATS-friendly resume of Gautam Samdhiya: Data Analyst with 2+ years experience in SQL, Power BI, Excel, and Python.",
};

export default async function ResumePage() {
  const [resume, experiences] = await Promise.all([
    getPublishedResume(),
    getPublishedExperiences(),
  ]);
  return (
    <>
      <h1 className="sr-only">Resume — Gautam Samdhiya, Data Analyst</h1>
      <Resume resume={resume} experiences={experiences} />
    </>
  );
}
