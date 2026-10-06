'use client';

import { GitBranch, ExternalLink, BarChart2, Zap, Layout, Image, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

import type { Project } from '@/types';

export type { Project };

const CATEGORY_ICONS = {
  'data-analytics': BarChart2,
  'ai-automation': Zap,
  'web-applications': Layout,
  'creative-technology': Image,
};

const CATEGORY_LABELS = {
  'data-analytics': 'Data Analytics',
  'ai-automation': 'AI & Automation',
  'web-applications': 'Web Applications',
  'creative-technology': 'Creative Technology',
};

export function Projects({ projects }: { projects: Project[] }) {
  const featuredProjects = projects.filter(p => p.isFeatured && p.status === 'published');
  const otherProjects = projects.filter(p => !p.isFeatured && p.status === 'published');
  const hasProjects = featuredProjects.length > 0 || otherProjects.length > 0;

  return (
    <section id="projects" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="03 — Selected work"
          title="Featured projects"
          lede="Each project follows the same arc: problem, approach, solution, outcome. Evidence first."
        />

        <div className="space-y-14">
          {!hasProjects && (
            <Reveal className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
              <h3 className="text-xl font-semibold tracking-tight">Case studies in preparation</h3>
              <p className="mt-2 text-muted-foreground">
                Published case studies with verifiable proof (code, dashboards, datasets) will appear here.
                In the meantime, let&apos;s talk about what I can do with your data.
              </p>
              <Button variant="premium" size="lg" asChild className="mt-6">
                <a href="#contact">Contact Me</a>
              </Button>
            </Reveal>
          )}
          {featuredProjects.length > 0 && (
          <div>
            <Reveal className="mb-6 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core projects</span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 90}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </div>
          )}

          {otherProjects.length > 0 && (
            <div>
              <Reveal className="mb-6 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">More work</span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project, i) => (
                  <Reveal key={project.id} delay={(i % 3) * 90}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <Reveal className="text-center pt-8 border-t border-border">
            <Button variant="outline" size="lg" asChild className="group">
              <a href="#contact" className="inline-flex items-center gap-2">
                <span>Discuss a project</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const Icon = CATEGORY_ICONS[project.category as keyof typeof CATEGORY_ICONS];

  return (
    <Card className="cinematic-card h-full overflow-hidden group">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="cinematic-media absolute inset-0">
          {project.thumbnail && project.thumbnail !== '[ADD THUMBNAIL URL]' ? (
            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Icon className="h-16 w-16 text-primary/30" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {CATEGORY_LABELS[project.category as keyof typeof CATEGORY_LABELS]}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{project.problem}</p>
        
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 5).map((tech, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-muted/50">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 5 && (
            <Badge variant="outline" className="text-xs bg-muted/50">
              +{project.technologies.length - 5} more
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t border-border">
          {project.githubUrl && project.githubUrl !== '[ADD GITHUB URL]' && (
            <Button variant="ghost" size="sm" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                <GitBranch className="h-4 w-4" />
                <span>Code</span>
              </a>
            </Button>
          )}
          {project.liveDemoUrl && project.liveDemoUrl !== '[ADD LIVE DEMO URL]' && (
            <Button variant="ghost" size="sm" asChild>
              <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                <ExternalLink className="h-4 w-4" />
                <span>Live</span>
              </a>
            </Button>
          )}
          {project.caseStudyUrl && project.caseStudyUrl !== '[ADD CASE STUDY URL]' && (
            <Button variant="ghost" size="sm" asChild>
              <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                <span>Case Study</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
