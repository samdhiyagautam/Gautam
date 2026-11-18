'use client';

import { GitBranch, ExternalLink, CheckCircle2, ArrowRight, ArrowUpRight, Database, TrendingUp, Layers } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isPlaceholderLink, cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { Scroll3D } from './scroll-3d';
import { SectionHeading } from './section-heading';
import { FALLBACK_PROJECTS } from '@/lib/constants';
import type { Project } from '@/types';

export function Projects({ projects: initialProjects }: { projects: Project[] }) {
  // Use published projects or fall back to the 3 core data analytics case studies
  const displayProjects =
    initialProjects && initialProjects.length > 0
      ? initialProjects.filter((p) => p.status === 'published')
      : FALLBACK_PROJECTS;

  return (
    <section id="projects" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="03 — Case Studies"
          title="Data Analytics Projects"
          lede="Three end-to-end analytics case studies: business problem, source data, technical execution, and measurable outcomes."
        />

        <div className="space-y-16 mt-12">
          {displayProjects.map((project, index) => (
            <CaseStudyCard key={project.id} project={project} index={index} />
          ))}

          <Reveal className="text-center pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="premium" size="lg" asChild className="group">
                <a href="#contact" className="inline-flex items-center gap-2">
                  <span>Discuss an Analytics Role</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://github.com/samdhiyagautam" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <span>Explore GitHub Repositories</span>
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CaseStudyCard({ project, index }: { project: Project; index: number }) {
  const caseNumber = String(index + 1).padStart(2, '0');
  const insights = project.keyInsights && project.keyInsights.length > 0 ? project.keyInsights : project.keyFeatures;
  const screenshot = project.thumbnail || (project.screenshots && project.screenshots[0]) || '';
  const isConfidential = project.id === 'case-study-operations-kpi-dashboard' || project.role === 'Assistant Manager';
  const hasScreenshot = Boolean(screenshot && !isPlaceholderLink(screenshot));

  return (
    <Reveal delay={index * 100}>
      <Scroll3D variant="tilt" intensity={0.5}>
        <article className="cinematic-card rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 shadow-sm">
          {/* Top Bar / Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {caseNumber}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Case Study</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-background text-xs font-medium">
                {project.role}
              </Badge>
              {isConfidential ? (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  Internal work — data confidential
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  Data Analytics
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className={cn("grid gap-8 lg:gap-10", hasScreenshot ? "lg:grid-cols-12" : "lg:grid-cols-1")}>
              {/* Left Column: Narrative Details */}
              <div className={cn("space-y-6", hasScreenshot ? "lg:col-span-7" : "max-w-4xl")}>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {project.name}
                  </h3>
                </div>

                {/* 1. Problem */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Problem
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {project.problem}
                  </p>
                </div>

                {/* 2. Data Used */}
                <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    Data Used
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {project.dataUsed || 'Production and transactional dataset structured for analytical modeling.'}
                  </p>
                  {project.id === 'case-study-retail-sales-analysis' && (
                    <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Data source: </span>
                      <span>Synthetic Retail Transactions Dataset ([DATASET NAME + URL])</span>
                    </div>
                  )}
                </div>

                {/* 3. Tools */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Tools &amp; Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Approach */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Approach &amp; Methodology
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.approach}
                  </p>
                </div>

                {/* 5. Key Insights */}
                {insights && insights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Result / Impact */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Result &amp; Business Impact
                  </h4>
                  <p className="text-sm sm:text-base font-medium text-foreground leading-snug">
                    {project.outcome}
                  </p>
                </div>

                {/* 7. Action Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {project.githubUrl && !isPlaceholderLink(project.githubUrl) && (
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <span>GitHub Repository</span>
                      </a>
                    </Button>
                  )}
                  {project.liveDemoUrl && !isPlaceholderLink(project.liveDemoUrl) && (
                    <Button variant="premium" size="sm" asChild className="gap-2">
                      <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span>Live Dashboard</span>
                      </a>
                    </Button>
                  )}
                  {project.id && (
                    <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground hover:text-foreground">
                      <Link href={`/projects/${project.id}`}>
                        <span>Full Details</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column: Dashboard Screenshot (rendered only when image exists) */}
              {hasScreenshot && (
                <div className="lg:col-span-5 flex flex-col justify-start">
                  <div className="sticky top-24 space-y-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted/40 shadow-inner group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshot}
                        alt={`${project.name} dashboard screenshot`}
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>

                    {project.screenshots && project.screenshots.length > 1 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {project.screenshots.slice(1, 3).map((shotUrl, i) => (
                          <div key={i} className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shotUrl}
                              alt={`${project.name} secondary visual ${i + 1}`}
                              className="h-full w-full object-contain p-1"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </Scroll3D>
    </Reveal>
  );
}
