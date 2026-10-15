'use client';

import { Briefcase, BarChart2, Cpu, Code, Puzzle } from 'lucide-react';
import { WHAT_I_BRING } from '@/lib/constants';
import { Reveal } from './reveal';

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
              <Reveal key={item.title} delay={(index % 3) * 90}>
                <article
                  className="cinematic-card group relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="absolute top-0 right-0 m-4 w-12 h-12 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}