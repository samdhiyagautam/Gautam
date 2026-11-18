'use client';

import { Building2, CheckCircle, Code, Database } from 'lucide-react';
import { Reveal } from './reveal';
import { Scroll3D } from './scroll-3d';
import { SectionHeading } from './section-heading';
import type { Experience as ExperienceItem } from '@/types';

export function Experience({ items }: { items: ExperienceItem[] }) {
  return (
    <section id="experience" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="02 — Career"
          title="Experience timeline"
          lede="From foundation to Assistant Manager — business roles with growing data and technology scope."
        />

        <div className="relative">
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-12">
            {items.map((exp, expIndex) => (
              <Reveal key={exp.id} delay={expIndex * 100}>
              <Scroll3D variant={expIndex % 2 === 0 ? 'flip-right' : 'flip-left'} intensity={0.7}>
              <article className="relative pl-14 sm:pl-20">
                <div className="absolute left-0 top-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-border bg-background z-10">
                  {exp.isCurrent ? (
                    <span className="h-3 w-3 rounded-full bg-[#F20B18] animate-pulse" />
                  ) : (
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#F20B18]" />
                  )}
                </div>
                
                <div className="cinematic-card bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] rounded-2xl p-6 sm:p-8 hover:border-t-2 hover:border-t-[#F20B18] transition-all">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-sm font-bold text-foreground">
                      {exp.isCurrent ? 'Current' : formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{displayText(exp.designation, 'Role details available on request')}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xl font-bold mb-3 text-foreground">
                    <Building2 className="h-5 w-5 text-[#F20B18]" />
                    <span>{exp.company}</span>
                  </div>

                  <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
                    {displayText(exp.description, 'Professional history available on request.')}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold mb-3 flex items-center space-x-2 text-foreground">
                        <CheckCircle className="h-4 w-4 text-[#F20B18]" />
                        <span>Key Achievements &amp; Impact</span>
                      </h4>
                      <ul className="space-y-2 pl-4">
                        {realItems(exp.responsibilities, 'Details available on request.').map((resp, i) => (
                          <li key={i} className="relative pl-4 text-xs sm:text-sm text-muted-foreground before:content-['•'] before:absolute before:left-0 before:text-[#F20B18] leading-relaxed">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {realItems(exp.projects).length > 0 && (
                      <div>
                        <h4 className="font-bold mb-3 flex items-center space-x-2 text-foreground">
                          <Code className="h-4 w-4 text-[#F20B18]" />
                          <span>Key Projects</span>
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {realItems(exp.projects).map((proj, i) => (
                            <li key={i} className="relative pl-4 text-xs sm:text-sm text-muted-foreground before:content-['•'] before:absolute before:left-0 before:text-[#F20B18] leading-relaxed">
                              {proj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {realItems(exp.technologies).length > 0 && (
                      <div>
                        <h4 className="font-bold mb-3 flex items-center space-x-2 text-foreground">
                          <Database className="h-4 w-4 text-[#F20B18]" />
                          <span>Technologies</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {realItems(exp.technologies).map((tech, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs font-semibold rounded-full border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] text-foreground bg-transparent"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
              </Scroll3D>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function isPlaceholderText(value: string | null | undefined): boolean {
  return !value || value.includes('[ADD');
}

function displayText(value: string, fallback: string): string {
  return isPlaceholderText(value) ? fallback : (value as string);
}

function realItems(list: string[], fallback?: string): string[] {
  const clean = list.filter((item) => !isPlaceholderText(item));
  if (clean.length > 0) return clean;
  return fallback ? [fallback] : [];
}

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  if (isPlaceholderText(startDate)) return 'Dates available on request';
  const format = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  const start = format(startDate);
  const end = isCurrent ? 'Present' : (endDate && !isPlaceholderText(endDate) ? format(endDate) : '');
  return end ? `${start} - ${end}` : start;
}
