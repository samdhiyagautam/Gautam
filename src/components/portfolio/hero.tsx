'use client';

import { Button } from '@/components/ui/button';
import { Scroll3D } from './scroll-3d';
import { ArrowRight, Download, Mail, MapPin, Link2, GitBranch } from 'lucide-react';
import { PROFESSIONAL_SNAPSHOT } from '@/lib/constants';
import { isPlaceholderLink } from '@/lib/utils';
import type { Profile } from '@/types';

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function Hero({ profile, hasResume }: { profile: Profile; hasResume: boolean }) {

  return (
    <section className="relative overflow-hidden pt-16" aria-label="Introduction">
      {/* Layered cinematic backdrop: wash + grid + grain + vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-background" aria-hidden="true" />
      <Scroll3D variant="parallax" speed={0.12} className="absolute inset-0" aria-hidden="true">
        <div className="cinematic-grid" />
      </Scroll3D>
      <Scroll3D variant="parallax" speed={0.3} className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-drift absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
      </Scroll3D>
      <div className="cinematic-grain" aria-hidden="true" />
      <div className="cinematic-vignette" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-14 sm:pt-20 lg:pt-24">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-end">
          <Scroll3D variant="exit" className="text-center lg:text-left">
            <div className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm" style={{ animationDelay: '0ms' }}>
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
              <span className="uppercase tracking-[0.18em]">Open to new opportunities</span>
              <span aria-hidden="true" className="text-border">/</span>
              <span className="text-foreground">Data Analyst · SQL · Python · Power BI</span>
            </div>

            <h1 className="hero-enter mt-6 text-[2.4rem] sm:text-5xl lg:text-[4rem] font-bold tracking-[-0.03em] leading-[1.08] text-balance" style={{ animationDelay: '90ms' }}>
              Data Analyst who turns messy operational data into{" "}
              <span className="text-muted-foreground">dashboards and decisions.</span>
            </h1>

            <div className="hero-enter mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm font-medium" style={{ animationDelay: '140ms' }}>
              <span className="text-foreground font-semibold">Top Tools:</span>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-semibold text-primary">
                SQL · Power BI · Excel · Python
              </span>
            </div>

            <p className="hero-enter mx-auto lg:mx-0 mt-5 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed text-balance" style={{ animationDelay: '180ms' }}>
              {profile.heroDescription.replace(/^Data Analyst who turns messy operational data into dashboards and decisions\.?\s*/i, '').trim()}
            </p>

            <div className="hero-enter mt-8 flex flex-col sm:flex-row items-center sm:justify-start justify-center gap-3.5" style={{ animationDelay: '240ms' }}>
              <Button size="xl" asChild variant="premium" className="w-full sm:w-auto">
                <a href="#projects" className="flex items-center gap-2">
                  <span>View projects</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </Button>
              <Button size="xl" variant="outline" asChild className="w-full sm:w-auto">
                <a href={hasResume ? "/resume.pdf" : "/resume"} download="Gautam-Samdhiya-Resume.pdf" className="flex items-center gap-2">
                  <Download className="h-5 w-5" aria-hidden="true" />
                  <span>Download resume</span>
                </a>
              </Button>
            </div>

            <div className="hero-enter mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground" style={{ animationDelay: '340ms' }}>
              {!isPlaceholderLink(profile.location) && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {profile.location}
                </span>
              )}
              {isEmail(profile.email) ? (
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {profile.email}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {profile.email}
                </span>
              )}
              {!isPlaceholderLink(profile.linkedin) && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  LinkedIn
                </a>
              )}
              {!isPlaceholderLink(profile.github) && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <GitBranch className="h-4 w-4" aria-hidden="true" />
                  GitHub
                </a>
              )}
            </div>
          </Scroll3D>

          <Scroll3D variant="exit-right">
          <div className="hero-enter" style={{ animationDelay: '220ms' }}>
            <aside className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm" aria-label="Professional snapshot">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Snapshot</p>
                <p className="text-xs text-muted-foreground">Evidence over claims</p>
              </div>
              <dl className="divide-y divide-border">
                {PROFESSIONAL_SNAPSHOT.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-6 px-6 py-4 transition-colors hover:bg-muted/40">
                    <dt className="text-sm text-muted-foreground">{item.value}</dt>
                    <dd className="text-right text-lg font-semibold tracking-tight">{item.label}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
          </Scroll3D>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10" aria-hidden="true">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em]">Scroll</span>
          <span className="block h-10 w-px overflow-hidden bg-border">
            <span className="scroll-cue-line block h-full w-px bg-foreground/60" />
          </span>
        </div>
      </div>
    </section>
  );
}
