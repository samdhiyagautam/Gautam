'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GitBranch,
  ExternalLink,
  ChevronLeft,
  BarChart2,
  Zap,
  Layout,
  Image,
  CheckCircle,
  CheckCircle2,
  Table,
  FileSpreadsheet,
  AlertCircle,
  Database,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isPlaceholderLink, cn } from '@/lib/utils';
import { Reveal } from './reveal';
import type { Project } from '@/types';

const CATEGORY_ICONS = {
  'data-analytics': BarChart2,
  'ai-automation': Zap,
  'web-applications': Layout,
  'creative-technology': Image,
} as const;

const CATEGORY_LABELS = {
  'data-analytics': 'Data Analytics',
  'ai-automation': 'AI & Automation',
  'web-applications': 'Web Applications',
  'creative-technology': 'Creative Technology',
} as const;

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
}

/** Convert YouTube watch/shorts/share URLs to a privacy-enhanced embed URL. */
function toYouTubeEmbed(url: string): string | null {
  if (!url || isPlaceholderLink(url)) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

interface TimelineStep {
  num: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

/**
 * Connected vertical timeline that fills with a gradient rail as the user scrolls.
 * Respects prefers-reduced-motion by rendering full height without animation.
 */
function CaseStudyTimeline({ steps }: { steps: TimelineStep[] }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [fillHeight, setFillHeight] = React.useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 100;
    }
    return 0;
  });

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let frameId: number | null = null;

    const handleScroll = () => {
      frameId = null;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startTrigger = windowHeight * 0.75;
      const progress = Math.min(Math.max((startTrigger - rect.top) / (rect.height || 1), 0), 1);

      setFillHeight(progress * 100);
    };

    const onScroll = () => {
      if (frameId === null) {
        frameId = requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    handleScroll();

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-12 pl-6 sm:pl-10">
      {/* Background Track Rail */}
      <div
        className="absolute left-[11px] sm:left-[17px] top-6 bottom-6 w-0.5 bg-border rounded-full"
        aria-hidden="true"
      />
      {/* Glowing Fill Line */}
      <div
        className="absolute left-[11px] sm:left-[17px] top-6 w-0.5 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-2)] origin-top rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_var(--accent)]"
        style={{ height: `${fillHeight}%` }}
        aria-hidden="true"
      />

      {steps.map((step, idx) => {
        const threshold = (idx / Math.max(steps.length - 1, 1)) * 95;
        const isPassed = fillHeight >= threshold;
        const IconComponent = step.icon;

        return (
          <div key={step.num} className="relative group">
            {/* Milestone Node Badge */}
            <div
              className={cn(
                'absolute -left-6 sm:-left-10 top-3 flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 bg-card text-xs font-mono font-bold transition-all duration-300 z-10',
                isPassed
                  ? 'border-[var(--accent)] text-[var(--accent)] shadow-[0_0_12px_rgba(45,212,191,0.35)] scale-105'
                  : 'border-border text-muted-foreground'
              )}
              aria-hidden="true"
            >
              <span className="hidden sm:inline">{step.num}</span>
              <IconComponent className="h-3 w-3 sm:hidden" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="text-[var(--accent)] font-mono">{step.num}</span>
                <span>/</span>
                <span>{step.label}</span>
              </div>
              {step.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Shared Problem → Approach → Solution → Outcome layout with interactive timeline. */
export function ProjectDetailView({ project }: { project: Project }) {
  const Icon = CATEGORY_ICONS[project.category as keyof typeof CATEGORY_ICONS] ?? Layout;
  const youTubeEmbed = toYouTubeEmbed(project.videoUrl);

  // Vertical timeline steps: Problem -> Data -> Approach -> Insights -> Result
  const steps: TimelineStep[] = [
    {
      num: '01',
      label: 'Problem',
      icon: AlertCircle,
      content: (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardContent className="p-6 pt-0">
            <h2 className="text-2xl font-bold mb-4">Problem Statement</h2>
            <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
          </CardContent>
        </Card>
      ),
    },
    ...(project.dataUsed || project.datasetUrl
      ? [
          {
            num: '02',
            label: 'Data Used',
            icon: Database,
            content: (
              <Card className="border-border/80 bg-card/90 shadow-sm">
                <CardContent className="p-6 pt-0">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Table className="h-5 w-5 text-primary" />
                    <span>Data Used</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.dataUsed || 'Production operational dataset configured for analytical modeling.'}
                  </p>
                  {project.datasetUrl && !isPlaceholderLink(project.datasetUrl) && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.datasetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          <span>Source Dataset / Reference</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
        ]
      : []),
    {
      num: project.dataUsed || project.datasetUrl ? '03' : '02',
      label: 'Approach',
      icon: Layers,
      content: (
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardContent className="p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4">Approach &amp; Methodology</h2>
              <p className="text-muted-foreground leading-relaxed">{project.approach}</p>
            </CardContent>
          </Card>
          {project.solution && project.solution !== project.approach && (
            <Card className="border-border/80 bg-card/90 shadow-sm">
              <CardContent className="p-6 pt-0">
                <h2 className="text-2xl font-bold mb-4">Solution Architecture</h2>
                <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      num: project.dataUsed || project.datasetUrl ? '04' : '03',
      label: 'Key Insights',
      icon: TrendingUp,
      content: (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardContent className="p-6 pt-0">
            <h2 className="text-2xl font-bold mb-4">Key Insights &amp; Analytical Findings</h2>
            <ul className="space-y-3">
              {(project.keyInsights && project.keyInsights.length > 0 ? project.keyInsights : project.keyFeatures).map(
                (feature: string, i: number) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      ),
    },
    {
      num: project.dataUsed || project.datasetUrl ? '05' : '04',
      label: 'Result',
      icon: CheckCircle2,
      content: (
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-6 pt-0">
            <h2 className="text-2xl font-bold mb-2 text-primary">Result &amp; Business Impact</h2>
            <p className="text-foreground font-medium leading-relaxed">{project.outcome}</p>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:py-20">
      <Reveal>
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className="gap-1">
              <Icon className="h-3 w-3" />
              {getCategoryLabel(project.category)}
            </Badge>
            {project.isFeatured && <Badge variant="premium">Featured</Badge>}
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">{project.name}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">{project.problem}</p>
        </header>
      </Reveal>

      <div className="grid lg:grid-cols-3 gap-8 sm:gap-10">
        <Reveal className="lg:col-span-2 space-y-10" delay={80}>
          {(youTubeEmbed || project.videos.length > 0) && (
            <Card>
              <CardContent className="p-6 pt-0 space-y-4">
                <h2 className="text-2xl font-bold mb-4">Watch</h2>
                {youTubeEmbed && (
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
                    <iframe
                      src={youTubeEmbed}
                      title={`${project.name} — demo video`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {project.videos.map((url) => (
                  <video key={url} controls playsInline preload="none" className="w-full rounded-xl border border-border">
                    <source src={url} />
                    Your browser does not support video playback.
                  </video>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Connected Vertical Timeline */}
          <CaseStudyTimeline steps={steps} />

          {/* Screenshots Gallery with Camera Focus Zoom */}
          {project.screenshots.length > 0 && (
            <Card>
              <CardContent className="p-6 pt-0 space-y-4">
                <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.screenshots.map((url, i) => (
                    <div key={url} className="group/screen relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${project.name} — screenshot ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/screen:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </Reveal>

        <Reveal className="space-y-6" delay={160}>
          <Card className="cinematic-card">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-foreground">Project Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">My Role</p>
                  <p className="text-sm font-medium text-foreground">{project.role}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-muted/50">{tech}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Links</p>
                  <div className="flex flex-col gap-2">
                    {project.githubUrl && !isPlaceholderLink(project.githubUrl) && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4" />
                          <span>View on GitHub</span>
                        </a>
                      </Button>
                    )}
                    {project.liveDemoUrl && !isPlaceholderLink(project.liveDemoUrl) && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4" />
                          <span>Live Demo</span>
                        </a>
                      </Button>
                    )}
                    {project.caseStudyUrl && !isPlaceholderLink(project.caseStudyUrl) && (
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <span>Case Study</span>
                          <ChevronLeft className="h-4 w-4 rotate-180" />
                        </a>
                      </Button>
                    )}
                    {project.datasetUrl && !isPlaceholderLink(project.datasetUrl) && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={project.datasetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <Table className="h-4 w-4" />
                          <span>Open Spreadsheet</span>
                        </a>
                      </Button>
                    )}
                    {project.attachments.map((url, i) => (
                      <Button key={url} variant="ghost" asChild className="w-full justify-start">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span className="truncate">{url.split('/').pop() || `Dataset ${i + 1}`}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Quick Facts</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-foreground">{getCategoryLabel(project.category)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd><Badge variant={project.status === 'published' ? 'premium' : 'outline'}>{project.status}</Badge></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Featured</dt>
                  <dd className="text-foreground">{project.isFeatured ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </main>
  );
}

export function DetailTopNav({ href, label }: { href: string; label: string }) {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <Link href={href} className="inline-flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </div>
    </nav>
  );
}
