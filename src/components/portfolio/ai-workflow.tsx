'use client';

import { Cpu, ShieldCheck, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Reveal } from './reveal';
import { Scroll3D, columnVariant } from './scroll-3d';
import { SectionHeading } from './section-heading';

const AI_ANALYST_POINTS = [
  {
    icon: Cpu,
    title: 'Accelerated Query & Pipeline Drafting',
    description:
      'Scaffold complex SQL queries (CTEs, window functions), test edge-case regex, and draft initial Python data cleaning scripts faster with LLM assistance.',
    badge: 'Efficiency',
  },
  {
    icon: ShieldCheck,
    title: 'Rigorous Human Validation',
    description:
      'Never accept AI output blindly. Every table join, aggregation logic, and DAX calculation is audited and verified against business ground truth.',
    badge: 'Accuracy First',
  },
  {
    icon: FileSpreadsheet,
    title: 'Clear Documentation & Context',
    description:
      'Speed up data dictionaries, SQL annotations, and executive summary drafts so cross-functional stakeholders receive clear, legible context.',
    badge: 'Communication',
  },
];

export function AIWorkflow() {
  return (
    <section id="ai-workflow" className="py-16 sm:py-20 bg-background border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="04 — AI as a Co-Pilot"
          title="How I work with AI"
          lede="AI is a productivity multiplier for drafting and exploration — guided and rigorously verified by human analytical judgment."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {AI_ANALYST_POINTS.map((point, index) => {
            const Icon = point.icon;
            return (
              <Reveal key={point.title} delay={index * 90} className="h-full">
                <Scroll3D variant={columnVariant(index)} className="h-full">
                  <Card className="cinematic-card h-full border border-border/80 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                            {point.badge}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground">{point.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                      </div>
                      <div className="pt-2 text-xs font-medium text-primary flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Tools</span>
                      </div>
                    </CardContent>
                  </Card>
                </Scroll3D>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
