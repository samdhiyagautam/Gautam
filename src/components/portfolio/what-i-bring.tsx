'use client';

import { Briefcase, BarChart2, Cpu, Code, Puzzle } from 'lucide-react';
import { WHAT_I_BRING } from '@/lib/constants';
import { Reveal } from './reveal';
import { Scroll3D, columnVariant } from './scroll-3d';

const ICONS = {
  briefcase: Briefcase,
  'bar-chart-2': BarChart2,
  cpu: Cpu,
  code: Code,
  puzzle: Puzzle,
};

export function WhatIBring() {
  return (
    <section id="what-i-bring" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">WHAT I BRING TO A TEAM</h2>
          <p className="text-lg text-muted-foreground">
            These are the core capabilities I bring to every project and team I work with.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHAT_I_BRING.map((item, index) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <Reveal key={item.title} delay={(index % 3) * 90} className="h-full">
                <Scroll3D variant={columnVariant(index)} className="h-full">
                  <article
                    className="cinematic-card group relative h-full rounded-2xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] p-6 hover:border-t-2 hover:border-t-[#F20B18] transition-all"
                  >
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(8,8,8,0.05)] dark:bg-[rgba(247,247,245,0.08)] text-[#F20B18] mb-4 group-hover:bg-[#F20B18] group-hover:text-[#080808] transition-colors">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </article>
                </Scroll3D>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
