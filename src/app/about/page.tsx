import { Metadata } from "next";
import { About } from "@/components/portfolio/about";
import { getPublishedProfile } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my professional background and approach",
};

export default async function AboutPage() {
  const profile = await getPublishedProfile();
  return <About profile={profile} />;
}
