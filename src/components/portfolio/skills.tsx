'use client';

import { Database, Code, Cpu, Palette, BarChart2, Zap, Layout, Image } from 'lucide-react';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

type Proficiency = 'core' | 'applied' | 'working-knowledge' | 'familiar';

interface Skill {
  name: string;
  proficiency: Proficiency;
  description: string;
}

const SKILLS_DATA: Record<string, Skill[]> = {
  'data-analytics': [
    { name: 'Python', proficiency: 'core', description: 'Data analysis, automation, scripting' },
    { name: 'Pandas', proficiency: 'core', description: 'Data manipulation and analysis' },
    { name: 'SQL', proficiency: 'core', description: 'Querying, optimization, data modeling' },
    { name: 'Power BI', proficiency: 'core', description: 'Dashboard development, DAX, data visualization' },
    { name: 'Excel', proficiency: 'core', description: 'Advanced formulas, Power Query, modeling' },
    { name: 'Power Query', proficiency: 'applied', description: 'Data transformation and ETL' },
    { name: 'DAX', proficiency: 'applied', description: 'Data Analysis Expressions for Power BI' },
    { name: 'Google Sheets', proficiency: 'applied', description: 'Collaborative analysis, Apps Script' },
    { name: 'Looker Studio', proficiency: 'working-knowledge', description: 'Dashboard creation and sharing' },
  ],
  'web-development': [
    { name: 'Next.js', proficiency: 'core', description: 'Full-stack React framework, App Router' },
    { name: 'React', proficiency: 'core', description: 'Component architecture, hooks, state management' },
    { name: 'TypeScript', proficiency: 'core', description: 'Type-safe development' },
    { name: 'HTML', proficiency: 'core', description: 'Semantic markup, accessibility' },
    { name: 'CSS', proficiency: 'core', description: 'Modern CSS, animations, layouts' },
    { name: 'Tailwind CSS', proficiency: 'core', description: 'Utility-first styling' },
    { name: 'Supabase', proficiency: 'applied', description: 'Backend-as-a-service, auth, database' },
    { name: 'PostgreSQL', proficiency: 'applied', description: 'Relational database design, queries' },
  ],
  'ai-automation': [
    { name: 'AI-Assisted Development', proficiency: 'core', description: 'Code generation, debugging, architecture' },
    { name: 'Prompt Engineering', proficiency: 'core', description: 'Structured prompting for consistent results' },
    { name: 'AI-Assisted Data Analysis', proficiency: 'applied', description: 'Automated insights, pattern detection' },
    { name: 'AI-Powered Workflows', proficiency: 'applied', description: 'Process automation with LLMs' },
    { name: 'AI Content Generation', proficiency: 'applied', description: 'Technical writing, documentation' },
    { name: 'Workflow Automation', proficiency: 'applied', description: 'End-to-end process automation' },
  ],
  'creative-technology': [
    { name: 'Canva', proficiency: 'core', description: 'Design, presentations, brand assets' },
    { name: 'Figma', proficiency: 'applied', description: 'UI/UX design, prototyping, design systems' },
    { name: 'Photoshop', proficiency: 'working-knowledge', description: 'Image editing, compositing' },
    { name: 'AI Graphic Design', proficiency: 'applied', description: 'Midjourney, DALL-E, generative design' },
    { name: 'AI Video Creation', proficiency: 'working-knowledge', description: 'Runway, Sora, video generation' },
    { name: 'Video Editing', proficiency: 'working-knowledge', description: 'Premiere Pro, DaVinci Resolve' },
  ],
};

const CATEGORY_ICONS = {
  'data-analytics': Database,
  'web-development': Code,
  'ai-automation': Cpu,
  'creative-technology': Palette,
};

const PROFICIENCY_COLORS: Record<Proficiency, string> = {
  core: 'bg-primary/10 text-primary border-primary/20',
  applied: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  'working-knowledge': 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  familiar: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

export function Skills() {
  return (
    <section id="skills" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Skills — evidence linked"
          title="Skills & expertise"
          lede="Grouped by craft, labeled by real proficiency. Each skill connects to project proof."
        />

        <div className="space-y-12">
          {SKILL_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.value as keyof typeof CATEGORY_ICONS];
            const skills = SKILLS_DATA[category.value] || [];
            
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
                      key={skill.name}
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
          </p>
        </Reveal>
      </div>
    </section>
  );
}