'use client';

import { Database, Layers } from 'lucide-react';
import { PROFICIENCY_LEVELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { Scroll3D } from './scroll-3d';
import { SectionHeading } from './section-heading';
import type { Skill } from '@/types';

const PROFICIENCY_STYLES: Record<Skill['proficiency'], string> = {
  core: 'border border-[#F20B18] text-[#080808] dark:text-[#F7F7F5] bg-transparent font-bold',
  applied: 'border border-[rgba(8,8,8,0.3)] dark:border-[rgba(247,247,245,0.3)] text-foreground bg-transparent',
  'working-knowledge': 'border border-[rgba(8,8,8,0.2)] dark:border-[rgba(247,247,245,0.2)] text-foreground bg-transparent',
  familiar: 'border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] text-muted-foreground bg-transparent',
};

const PRIORITY_TOOLS = ['sql', 'excel', 'power bi', 'dax', 'python', 'pandas', 'statistics basics', 'statistics', 'power query'];

export function Skills({ skills: allSkills }: { skills: Skill[] }) {
  const dataAnalyticsSkills = allSkills
    .filter((s) => s.category === 'data-analytics')
    .sort((a, b) => {
      const aIdx = PRIORITY_TOOLS.indexOf(a.name.toLowerCase());
      const bIdx = PRIORITY_TOOLS.indexOf(b.name.toLowerCase());
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.order - b.order;
    });

  const additionalSkills = allSkills.filter((s) => s.category !== 'data-analytics');
  const webSkills = additionalSkills.filter((s) => s.category === 'web-development');
  const aiSkills = additionalSkills.filter((s) => s.category === 'ai-automation');
  const creativeSkills = additionalSkills.filter((s) => s.category === 'creative-technology');

  return (
    <section id="skills" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Skills — practical stack"
          title="Skills & expertise"
          lede="Core data analytics toolkit first, supported by software execution and automation."
        />

        <div className="space-y-12">
          {/* Primary Section: Data & Analytics */}
          <Reveal>
            <Scroll3D variant="tilt" intensity={0.6}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(8,8,8,0.05)] dark:bg-[rgba(247,247,245,0.08)] text-[#F20B18]">
                  <Database className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Data &amp; Analytics</h3>
                  <p className="text-sm text-muted-foreground">Primary focus: SQL, Excel, Power BI, DAX, Python, Pandas</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataAnalyticsSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="cinematic-card group bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] rounded-xl p-4 transition-all hover:border-t-2 hover:border-t-[#F20B18]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-lg tracking-tight">{skill.name}</h4>
                      <Badge variant="outline" className={cn(PROFICIENCY_STYLES[skill.proficiency])}>
                        {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1).replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{skill.description}</p>
                  </div>
                ))}
              </div>
            </Scroll3D>
          </Reveal>

          {/* Compact Section: Additional Skills */}
          {additionalSkills.length > 0 && (
            <Reveal delay={80}>
              <div className="rounded-2xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] p-6 sm:p-8 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(8,8,8,0.05)] dark:bg-[rgba(247,247,245,0.08)] text-[#F20B18]">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Additional Skills</h3>
                    <p className="text-xs text-muted-foreground">Supporting competencies that enhance analytics delivery and operational integration</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)]">
                  {/* Web Development */}
                  {webSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Web Development</h4>
                      <div className="flex flex-wrap gap-2">
                        {webSkills.map((skill) => (
                          <span key={skill.id} className="rounded-full border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] text-foreground text-xs font-semibold px-3 py-1">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI & Automation */}
                  {aiSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold tracking-wide uppercase text-muted-foreground">AI &amp; Automation</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiSkills.map((skill) => (
                          <span key={skill.id} className="rounded-full border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] text-foreground text-xs font-semibold px-3 py-1">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Creative Technology */}
                  {creativeSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Creative &amp; Design</h4>
                      <div className="flex flex-wrap gap-2">
                        {creativeSkills.map((skill) => (
                          <span key={skill.id} className="rounded-full border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] text-foreground text-xs font-semibold px-3 py-1">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal className="mt-12 rounded-xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proficiency Levels:</span>
            <div className="flex flex-wrap gap-2">
              {PROFICIENCY_LEVELS.map((level) => (
                <span
                  key={level.value}
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs',
                    level.value === 'core'
                      ? 'border border-[#F20B18] text-foreground font-bold'
                      : 'border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] text-foreground font-medium'
                  )}
                >
                  {level.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
