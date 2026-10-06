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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navigation />
      <main className="flex-1" id="main-content">
        <Hero />
        <WhatIBring />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <AIWorkflow />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}