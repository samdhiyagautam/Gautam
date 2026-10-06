'use client';

import { CAREER_JOURNEY } from '@/lib/constants';
import { ChevronDown } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import type { Profile } from '@/types';

export function About({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="01 — Profile"
          title="About me"
          align="left"
          lede="Business understanding first, then data, AI, and technology — in that order."
        />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
            <div className="prose prose-muted max-w-none space-y-4">
              {profile.about.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed text-balance">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-xl font-semibold mb-4">Career Journey</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                {CAREER_JOURNEY.map((step) => (
                  <div key={step.role} className="relative pl-14 pb-8 last:pb-0">
                    <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary z-10">
                      {step.isCurrent ? (
                        <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-sm text-primary font-medium mb-1">
                        <span>{step.period}</span>
                        {step.isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Current</span>}
                      </div>
                      <h4 className="font-semibold">{step.role}</h4>
                      <p className="text-muted-foreground text-sm">{step.company}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}