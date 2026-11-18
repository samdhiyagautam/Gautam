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
    <section id="ai-workflow" className="py-16 sm:py-20 bg-[#080808] text-[#F7F7F5] border-t border-[rgba(247,247,245,0.12)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="04 — AI Tools"
          title="How I work with AI"
          lede="AI is a productivity multiplier for drafting and exploration — guided and rigorously verified by human analytical judgment."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {AI_ANALYST_POINTS.map((point, index) => {
            const Icon = point.icon;
            return (
              <Reveal key={point.title} delay={index * 90} className="h-full">
                <Scroll3D variant={columnVariant(index)} className="h-full">
                  <Card className="cinematic-card h-full border border-[rgba(247,247,245,0.12)] bg-[rgba(247,247,245,0.08)] hover:border-t-2 hover:border-t-[#F20B18] transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(247,247,245,0.08)] text-[#F20B18]">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(247,247,245,0.70)] border border-[rgba(247,247,245,0.25)] px-2.5 py-1 rounded-md">
                            {point.badge}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-[#F7F7F5]">{point.title}</h3>
                        <p className="text-sm text-[rgba(247,247,245,0.70)] leading-relaxed">{point.description}</p>
                      </div>
                      <div className="pt-2 flex items-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#F20B18] text-xs font-semibold text-[#F7F7F5]">
                          <Sparkles className="h-3.5 w-3.5 text-[#F20B18]" />
                          <span>AI Tools</span>
                        </span>
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
