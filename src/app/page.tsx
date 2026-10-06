import { Navigation } from "@/components/portfolio/navigation";
import { Hero } from "@/components/portfolio/hero";
import { WhatIBring } from "@/components/portfolio/what-i-bring";
import { About } from "@/components/portfolio/about";
import { Experience } from "@/components/portfolio/experience";
import { Skills } from "@/components/portfolio/skills";
import { Projects } from "@/components/portfolio/projects";
import { AIWorkflow } from "@/components/portfolio/ai-workflow";
import { Resume } from "@/components/portfolio/resume";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";
import {
  getPublishedProfile,
  getPublishedExperiences,
  getPublishedSkills,
  getPublishedProjects,
  getPublishedResume,
  isContactConfigured,
} from "@/lib/cms";

export default async function Home() {
  const [profile, experiences, skills, projects, resume] = await Promise.all([
    getPublishedProfile(),
    getPublishedExperiences(),
    getPublishedSkills(),
    getPublishedProjects(),
    getPublishedResume(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navigation />
      <main className="flex-1" id="main-content">
        <Hero profile={profile} />
        <WhatIBring />
        <About profile={profile} />
        <Experience items={experiences} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <AIWorkflow />
        <Resume resume={resume} experiences={experiences} />
        <Contact profile={profile} deliveryConfigured={isContactConfigured()} />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
