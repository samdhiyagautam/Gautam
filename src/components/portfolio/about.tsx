'use client';

import { CAREER_JOURNEY } from '@/lib/constants';
import { isPlaceholderLink } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';
import type { Profile } from '@/types';

export function About({ profile }: { profile: Profile }) {
  // Placeholder-proof: steps with unfilled [ADD …] fields never render publicly.
  const journey = CAREER_JOURNEY.filter(
    (step) => ![step.role, step.period, step.description].some((v) => isPlaceholderLink(v))
  );
  return (
    <section id="about" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="01 — Profile"
          title="About me"
          align="left"
          lede="Business understanding first, then data and dashboards."
        />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
            <div className="prose max-w-none space-y-4 text-foreground">
              {profile.about.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-base sm:text-lg leading-relaxed text-balance text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-6">
              {journey.length > 0 && (
                <div className="rounded-2xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)] p-6 sm:p-8">
                  <h3 className="text-xl font-bold mb-6">Career Journey</h3>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                    {journey.map((step) => (
                      <div key={step.role} className="relative pl-12 pb-8 last:pb-0">
                        <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background z-10">
                          {step.isCurrent ? (
                            <span className="h-3 w-3 rounded-full bg-[#F20B18] animate-pulse" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#F20B18]" />
                          )}
                        </div>
                        <div className="rounded-xl border border-[rgba(8,8,8,0.08)] dark:border-[rgba(247,247,245,0.08)] p-4 bg-muted/20">
                          <div className="flex items-center space-x-2 text-sm font-semibold mb-1">
                            <span className="text-foreground">{step.period}</span>
                            {step.isCurrent && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#F20B18] text-foreground font-semibold">
                                Current
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-base text-foreground">{step.role}</h4>
                          <p className="text-muted-foreground text-sm">{step.company}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
