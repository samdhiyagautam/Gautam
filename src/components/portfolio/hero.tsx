'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, Download, Mail, MapPin, Link2, GitBranch } from 'lucide-react';
import { PROFESSIONAL_SNAPSHOT } from '@/lib/constants';
import type { Profile } from '@/types';

export function Hero({ profile }: { profile: Profile }) {

  return (
    <section className="relative overflow-hidden pt-16" aria-label="Introduction">
      {/* Layered cinematic backdrop: wash + grid + grain + vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-background to-background" aria-hidden="true" />
      <div className="cinematic-grid" aria-hidden="true" />
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-drift absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
      </div>
      <div className="cinematic-grain" aria-hidden="true" />
      <div className="cinematic-vignette" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-14 sm:pt-20 lg:pt-24">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-end">
          <div className="text-center lg:text-left">
            <div className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm" style={{ animationDelay: '0ms' }}>
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
              <span className="uppercase tracking-[0.18em]">Open to new opportunities</span>
              <span aria-hidden="true" className="text-border">/</span>
              <span className="text-foreground">Data Analyst · SQL · Python · Power BI</span>
            </div>

            <h1 className="hero-enter mt-6 text-[2.6rem] sm:text-6xl lg:text-[4.4rem] font-bold tracking-[-0.03em] leading-[1.02] text-balance" style={{ animationDelay: '90ms' }}>
              I turn data, AI
              <br />
              &amp; technology into
              <br />
              <span className="text-muted-foreground">practical solutions.</span>
            </h1>

            <p className="hero-enter mx-auto lg:mx-0 mt-6 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance" style={{ animationDelay: '180ms' }}>
              {profile.heroDescription}
            </p>

            <div className="hero-enter mt-9 flex flex-col sm:flex-row items-center sm:justify-start justify-center gap-3" style={{ animationDelay: '260ms' }}>
              <Button size="xl" asChild variant="premium" className="w-full sm:w-auto">
                <a href="#projects" className="flex items-center gap-2">
                  <span>View my work</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </Button>
              <Button size="xl" variant="outline" asChild className="w-full sm:w-auto">
                <a href="/resume" className="flex items-center gap-2">
                  <Download className="h-5 w-5" aria-hidden="true" />
                  <span>Download resume</span>
                </a>
              </Button>
              <Button size="xl" variant="ghost" asChild className="w-full sm:w-auto group">
                <a href="#contact" className="flex items-center gap-1.5">
                  <span>Contact me</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              </Button>
            </div>

            <div className="hero-enter mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground" style={{ animationDelay: '340ms' }}>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {profile.location}
              </span>
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                <Link2 className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                <GitBranch className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>

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
              <div className="border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Positioning, not achievements — each line maps to a section with proof below.
                </p>
              </div>
            </aside>
          </div>
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
