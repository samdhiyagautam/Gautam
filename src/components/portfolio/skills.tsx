'use client';

import { Database, Layers } from 'lucide-react';
import { PROFICIENCY_LEVELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { Scroll3D } from './scroll-3d';
import { SectionHeading } from './section-heading';
import type { Skill } from '@/types';

const PROFICIENCY_COLORS: Record<Skill['proficiency'], string> = {
  core: 'bg-primary/10 text-primary border-primary/20',
  applied: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  'working-knowledge': 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  familiar: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
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
    <section id="skills" className="py-20 sm:py-28 bg-muted/30">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                    className="cinematic-card group bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg tracking-tight">{skill.name}</h4>
                      <Badge variant="outline" className={cn(PROFICIENCY_COLORS[skill.proficiency])}>
                        {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1).replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </div>
                ))}
              </div>
            </Scroll3D>
          </Reveal>

          {/* Compact Section: Additional Skills */}
          {additionalSkills.length > 0 && (
            <Reveal delay={80}>
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Additional Skills</h3>
                    <p className="text-xs text-muted-foreground">Supporting competencies that enhance analytics delivery and operational integration</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-border/60">
                  {/* Web Development */}
                  {webSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Web Development</h4>
                      <div className="flex flex-wrap gap-2">
                        {webSkills.map((skill) => (
                          <Badge key={skill.id} variant="outline" className="bg-muted/40 font-normal text-xs py-1">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI & Automation */}
                  {aiSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">AI &amp; Automation</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiSkills.map((skill) => (
                          <Badge key={skill.id} variant="outline" className="bg-muted/40 font-normal text-xs py-1">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Creative Technology */}
                  {creativeSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Creative &amp; Design</h4>
                      <div className="flex flex-wrap gap-2">
                        {creativeSkills.map((skill) => (
                          <Badge key={skill.id} variant="outline" className="bg-muted/40 font-normal text-xs py-1">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal className="mt-12 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proficiency Levels:</span>
            <div className="flex flex-wrap gap-2">
              {PROFICIENCY_LEVELS.map((level) => (
                <Badge key={level.value} variant="outline" className={cn(
                  level.value === 'core' && 'bg-primary/10 text-primary border-primary/20',
                  level.value === 'applied' && 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
                  level.value === 'working-knowledge' && 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
                  level.value === 'familiar' && 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                )}>
                  {level.label}
                </Badge>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
