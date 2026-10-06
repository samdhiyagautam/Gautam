'use client';

import { Cpu, Brain, Zap, CheckCircle, ArrowRight, GitBranch, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AI_WORKFLOW_STEPS = [
  {
    number: '01',
    title: 'Problem Definition',
    description: 'Understand the business problem, constraints, and success criteria before touching any tool.',
    icon: User,
    details: [
      'Stakeholder interviews',
      'Requirements gathering',
      'Success metrics definition',
      'Feasibility assessment',
    ],
  },
  {
    number: '02',
    title: 'AI-Assisted Research',
    description: 'Use AI to accelerate information gathering, pattern recognition, and initial exploration.',
    icon: Brain,
    details: [
      'Literature review automation',
      'Code/example discovery',
      'Best practice synthesis',
      'Technology comparison',
    ],
  },
  {
    number: '03',
    title: 'Development & Analysis',
    description: 'Build the solution with AI as a co-pilot — coding, querying, modeling, designing.',
    icon: Zap,
    details: [
      'AI pair programming',
      'Automated boilerplate',
      'Query generation',
      'Visualization suggestions',
    ],
  },
  {
    number: '04',
    title: 'Human Validation',
    description: 'Critical review of AI output — verify logic, test edge cases, ensure quality.',
    icon: Shield,
    details: [
      'Code review & testing',
      'Data quality checks',
      'Business logic validation',
      'Security & compliance review',
    ],
  },
  {
    number: '05',
    title: 'Final Solution',
    description: 'Deliver a practical, maintainable solution with documentation and handoff.',
    icon: CheckCircle,
    details: [
      'Production deployment',
      'Documentation',
      'Knowledge transfer',
      'Monitoring setup',
    ],
  },
];

const AI_PRINCIPLES = [
  {
    title: 'AI as Multiplier, Not Replacement',
    description: 'AI accelerates the work; human judgment directs it. I never ship code or analysis I haven\'t personally verified.',
  },
  {
    title: 'Structured Prompting',
    description: 'I use systematic prompt engineering — context, constraints, examples, output format — for consistent, reliable results.',
  },
  {
    title: 'Human-in-the-Loop',
    description: 'Every AI-generated artifact passes through human validation before use. Critical decisions are never fully automated.',
  },
  {
    title: 'Tool Agnostic',
    description: 'I use the best tool for the task — Claude, GPT-4, Cursor, Copilot, local models — based on capability, not loyalty.',
  },
  {
    title: 'Transparent Attribution',
    description: 'In this portfolio, AI-assisted work is clearly labeled. You\'ll know what was AI-accelerated vs. human-crafted.',
  },
  {
    title: 'Continuous Learning',
    description: 'AI capabilities evolve weekly. I continuously evaluate new models, techniques, and tools to improve my workflow.',
  },
];

export function AIWorkflow() {
  return (
    <section id="ai-workflow" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Cpu className="h-4 w-4" />
            <span>HOW I WORK WITH AI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">AI is my productivity multiplier, not my entire skill set.</h2>
          <p className="text-lg text-muted-foreground">
            A practical workflow combining AI acceleration with human judgment and technical expertise.
          </p>
        </div>

        <div className="relative mb-16">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden lg:block" />
          <div className="space-y-8">
            {AI_WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === AI_WORKFLOW_STEPS.length - 1;
              return (
                <div key={step.number} className="relative lg:pl-32 flex">
                  <div className="absolute left-1/2 top-4 -translate-x-1/2 z-10 hidden lg:block">
                    <div className="w-10 h-10 rounded-full border-4 border-background bg-primary flex items-center justify-center text-primary font-bold text-sm">
                      {step.number}
                    </div>
                    {!isLast && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%-2rem)] bg-border" />
                    )}
                  </div>
                  <div className="w-full lg:w-1/2 pr-8 lg:pr-0">
                    <Card className="h-full">
                      <CardContent className="p-6 h-full">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-primary">{step.number}</span>
                              <h3 className="text-xl font-semibold">{step.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{step.description}</p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {step.details.map((detail, i) => (
                                <li key={i} className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-primary/60" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">Core Principles</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AI_PRINCIPLES.map((principle, index) => (
                <Card key={principle.title} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">{principle.title}</h4>
                    <p className="text-muted-foreground text-sm">{principle.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GitBranch className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">AI + Human Judgment + Technical Skills = Practical Solutions</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This portfolio itself demonstrates the workflow: AI accelerated the scaffolding and boilerplate,
              but the architecture, content strategy, design decisions, and code review are entirely human-driven.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}