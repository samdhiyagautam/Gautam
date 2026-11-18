import { Metadata } from "next";
import { About } from "@/components/portfolio/about";
import { getPublishedProfile } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About | Data Analyst & BI Specialist",
  description:
    "Learn about Gautam Samdhiya's background as an Assistant Manager combining commercial business understanding, hands-on SQL, Power BI, Excel, and Python data modeling.",
};

export default async function AboutPage() {
  const profile = await getPublishedProfile();
  return (
    <>
      <h1 className="sr-only">About — Gautam Samdhiya, Data Analyst</h1>
      <About profile={profile} />
    </>
  );
}
