'use client';

import { Database, Code, Cpu, Palette } from 'lucide-react';
import Link from 'next/link';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import type { Skill } from '@/types';


const CATEGORY_ICONS = {
  'data-analytics': Database,
  'web-development': Code,
  'ai-automation': Cpu,
  'creative-technology': Palette,
};

const PROFICIENCY_COLORS: Record<Skill['proficiency'], string> = {
  core: 'bg-primary/10 text-primary border-primary/20',
  applied: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  'working-knowledge': 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  familiar: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

export function Skills({ skills: allSkills }: { skills: Skill[] }) {
  return (
    <section id="skills" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Skills — evidence linked"
          title="Skills & expertise"
          lede="Grouped by craft, labeled by real proficiency. No percentages, no padding."
        />

        <div className="space-y-12">
          {SKILL_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.value as keyof typeof CATEGORY_ICONS];
            const skills = allSkills.filter((s) => s.category === category.value);
            
            return (
              <Reveal key={category.value}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold">{category.label}</h3>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="cinematic-card group bg-card border border-border rounded-xl p-4"
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
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16 rounded-2xl border border-border bg-card p-6">
          <h4 className="font-semibold mb-4">Proficiency Legend</h4>
          <div className="flex flex-wrap gap-3">
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
          <p className="mt-4 text-sm text-muted-foreground">
            Proficiency levels reflect verified practical ability, not self-reported percentages.
            See these skills in context in <Link href="/projects" className="text-primary underline underline-offset-4 hover:opacity-80">selected work</Link>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
