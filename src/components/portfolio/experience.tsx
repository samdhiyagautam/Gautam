'use client';

import { Calendar, Building2, CheckCircle, Code, Database } from 'lucide-react';
import { Reveal } from './reveal';
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
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-12">
            {items.map((exp, expIndex) => (
              <Reveal key={exp.id} delay={expIndex * 100}>
              <article
                className="relative pl-20"
              >
                <div className="absolute left-0 top-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary z-10">
                  {exp.isCurrent ? (
                    <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  )}
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:border-primary/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-primary">
                      {exp.isCurrent ? 'Current' : formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{exp.designation}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-lg font-semibold mb-2">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                    <span>{exp.company}</span>
                  </div>

                  <p className="text-muted-foreground mb-6">{exp.description}</p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>Key Responsibilities</span>
                      </h4>
                      <ul className="space-y-2 pl-4">
                        {exp.responsibilities.map((resp, i) => (
                          <li key={i} className="relative pl-4 text-muted-foreground before:content-['•'] before:absolute before:left-0 before:text-primary">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {exp.projects.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                          <Code className="h-5 w-5 text-primary" />
                          <span>Key Projects</span>
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {exp.projects.map((proj, i) => (
                            <li key={i} className="relative pl-4 text-muted-foreground before:content-['•'] before:absolute before:left-0 before:text-primary">
                              {proj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center space-x-2">
                        <Database className="h-5 w-5 text-primary" />
                        <span>Technologies</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  const format = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  const start = format(startDate);
  const end = isCurrent ? 'Present' : (endDate ? format(endDate) : '');
  return `${start} - ${end}`;
}
