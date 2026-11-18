import { Metadata } from "next";
import { Skills } from "@/components/portfolio/skills";
import { getPublishedSkills } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Skills | SQL, Power BI, Excel, Python & DAX",
  description:
    "Data analytics technical skill stack: SQL schema design & queries, Power BI dashboards, DAX measures, Excel Power Query, Python (Pandas) automation, and ETL pipelines.",
};

export default async function SkillsPage() {
  const skills = await getPublishedSkills();
  return (
    <>
      <h1 className="sr-only">Skills — Gautam Samdhiya, Data Analyst</h1>
      <Skills skills={skills} />
    </>
  );
}
