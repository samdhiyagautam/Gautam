'use client';

import { GitBranch, ExternalLink, CheckCircle2, ArrowRight, ArrowUpRight, Database, TrendingUp, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { isPlaceholderLink, cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import { TiltCard } from './tilt-card';
import { AnimatedCounter } from './animated-counter';
import { FALLBACK_PROJECTS } from '@/lib/constants';
import type { Project } from '@/types';

export function Projects({ projects: initialProjects }: { projects: Project[] }) {
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
              <Button variant="default" size="lg" asChild className="group">
                <a href="#contact" className="inline-flex items-center gap-2">
                  <span>Discuss an Analytics Role</span>
                  <ArrowRight className="h-5 w-5 text-[#F20B18] group-hover:text-[#080808] transition-all duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
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
      <TiltCard className="cinematic-card rounded-2xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] overflow-hidden transition-all duration-300 hover:border-t-2 hover:border-t-[#F20B18] shadow-sm">
        <article>
          {/* Top Bar / Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F20B18] text-xs font-bold text-[#F20B18]">
                {caseNumber}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Case Study</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] px-2.5 py-0.5 text-xs font-semibold text-foreground">
                {project.role}
              </span>
              {isConfidential ? (
                <span className="rounded-full border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  Internal work — data confidential
                </span>
              ) : (
                <span className="rounded-full border border-[#F20B18] px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  Data Analytics
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className={cn("grid gap-8 lg:gap-10", hasScreenshot ? "lg:grid-cols-12" : "lg:grid-cols-1")}>
              {/* Left Column: Narrative Details */}
              <div className={cn("space-y-6", hasScreenshot ? "lg:col-span-7" : "max-w-4xl")}>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors hover:text-[#F20B18]">
                    <Link href={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                  </h3>
                </div>

                {/* Verified Real Metrics Bar (Animated Counter) */}
                {project.id === 'case-study-ipl-cricket-analytics' && (
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20">
                    <div className="text-center sm:text-left">
                      <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        <AnimatedCounter value={295732} />
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Deliveries</div>
                    </div>
                    <div className="text-center sm:text-left border-x border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] px-3">
                      <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        <AnimatedCounter value={1243} />
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Matches</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        <AnimatedCounter value={54.7} decimals={1} suffix="%" />
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Toss-Field Win %</div>
                    </div>
                  </div>
                )}

                {project.id === 'case-study-retail-sales-analysis' && (
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20">
                    <div className="text-center sm:text-left">
                      <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        <AnimatedCounter value={8262058} prefix="$" />
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Revenue (synthetic data)</div>
                    </div>
                    <div className="text-center sm:text-left border-x border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] px-3">
                      <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        <AnimatedCounter value={84.4} decimals={1} suffix="%" />
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Repeat Buyers (synthetic data)</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
                        <AnimatedCounter value={50.9} decimals={1} suffix="%" />
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Top 20% Share (synthetic data)</div>
                    </div>
                  </div>
                )}

                {/* 1. Problem */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F20B18]" />
                    Problem
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {project.problem}
                  </p>
                </div>

                {/* 2. Data Used */}
                <div className="space-y-1.5 rounded-xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-[#F20B18]" />
                    Data Used
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {project.dataUsed || 'Production and transactional dataset structured for analytical modeling.'}
                  </p>
                  {project.id === 'case-study-retail-sales-analysis' && (
                    <div className="pt-2 border-t border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Data source: </span>
                      <span>Synthetic retail transaction dataset generated by a Python script in this repo (demo-projects/retail-sales-analysis), created for practicing SQL and Power BI.</span>
                    </div>
                  )}
                </div>

                {/* 3. Tools */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-[#F20B18]" />
                    Tools &amp; Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] px-2.5 py-1 text-xs font-semibold text-foreground bg-transparent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Approach */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F20B18]" />
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
                      <TrendingUp className="h-3.5 w-3.5 text-[#F20B18]" />
                      Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-[#F20B18] shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Result / Impact */}
                <div className="rounded-xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20 p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F20B18]" />
                    Result &amp; Business Impact
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                    {project.outcome}
                  </p>
                </div>

                {/* 7. Action Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {project.githubUrl && !isPlaceholderLink(project.githubUrl) && (
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <GitBranch className="h-4 w-4 text-[#F20B18]" />
                        <span>GitHub Repository</span>
                      </a>
                    </Button>
                  )}
                  {project.liveDemoUrl && !isPlaceholderLink(project.liveDemoUrl) && (
                    <Button variant="default" size="sm" asChild className="gap-2">
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

              {/* Right Column: Dashboard Screenshot with Camera Focus Effect */}
              {hasScreenshot && (
                <div className="lg:col-span-5 flex flex-col justify-start">
                  <div className="sticky top-24 space-y-3">
                    <Link href={`/projects/${project.id}`} className="block group/media">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20 shadow-inner">
                        <Image
                          src={screenshot}
                          alt={`${project.name} analytical dashboard screenshot`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 420px"
                          className="object-contain p-2 transition-all duration-700 ease-out group-hover/media:scale-105"
                          priority={index === 0}
                        />
                      </div>
                    </Link>

                    {project.screenshots && project.screenshots.length > 1 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {project.screenshots.slice(1, 3).map((shotUrl, i) => (
                          <div key={i} className="group/submedia relative aspect-video w-full overflow-hidden rounded-lg border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-muted/20">
                            <Image
                              src={shotUrl}
                              alt={`${project.name} secondary visual ${i + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 200px"
                              className="object-contain p-1 transition-transform duration-500 ease-out group-hover/submedia:scale-105"
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
      </TiltCard>
    </Reveal>
  );
}
