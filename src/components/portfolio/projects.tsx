'use client';

import { GitBranch, ExternalLink, BarChart2, Zap, Layout, Image, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

export interface Project {
  id: string;
  name: string;
  category: 'data-analytics' | 'ai-automation' | 'web-applications' | 'creative-technology';
  problem: string;
  approach: string;
  solution: string;
  role: string;
  technologies: string[];
  keyFeatures: string[];
  outcome: string;
  githubUrl: string;
  liveDemoUrl: string;
  caseStudyUrl: string;
  thumbnail: string;
  screenshots: string[];
  isFeatured: boolean;
  status: 'draft' | 'published';
  order: number;
}

export const PROJECTS_DATA: Project[] = [
  {
    id: '1',
    name: 'Portfolio Website',
    category: 'web-applications',
    problem: 'Need a professional, recruiter-first portfolio to showcase skills, experience, and projects with a self-managed CMS.',
    approach: 'Built a full-stack Next.js application with Supabase backend, featuring an admin panel for content management without code changes.',
    solution: 'Modern portfolio with hero, about, experience, skills, projects, resume, and contact sections. Admin dashboard with draft/preview/publish workflow.',
    role: 'Full-Stack Developer',
    technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Radix UI'],
    keyFeatures: [
      'Secure admin panel with Supabase Auth',
      'Draft → Preview → Publish workflow',
      'Project/Experience/Skills/Profile management',
      'Resume upload and versioning',
      'SEO management',
      'Responsive, accessible design',
    ],
    outcome: 'Full-stack portfolio with a self-managed content system. GitHub workflow in place; production build verified and deployment-ready.',
    githubUrl: '[ADD GITHUB URL]',
    liveDemoUrl: '[ADD LIVE DEMO URL]',
    caseStudyUrl: '[ADD CASE STUDY URL]',
    thumbnail: '[ADD THUMBNAIL URL]',
    screenshots: [],
    isFeatured: true,
    status: 'published' as const,
    order: 1,
  },
  {
    id: '2',
    name: 'Executive Dashboard',
    category: 'data-analytics',
    problem: 'Leadership lacked real-time visibility into key business metrics across departments.',
    approach: 'Designed and built a Power BI dashboard connected to multiple data sources with automated refresh.',
    solution: 'Interactive dashboard with KPI tracking, drill-through capabilities, and role-based access.',
    role: 'Data Analyst / BI Developer',
    technologies: ['Power BI', 'DAX', 'Power Query', 'SQL', 'PostgreSQL'],
    keyFeatures: [
      'Real-time KPI monitoring',
      'Department-level drill-down',
      'Automated data refresh',
      'Role-based security',
      'Mobile-responsive layout',
    ],
    outcome: 'Interactive dashboard design with KPI tracking, drill-through capabilities, and role-based access for leadership visibility.',
    githubUrl: '',
    liveDemoUrl: '',
    caseStudyUrl: '[ADD CASE STUDY URL]',
    thumbnail: '[ADD THUMBNAIL URL]',
    screenshots: [],
    isFeatured: true,
    status: 'published' as const,
    order: 2,
  },
  {
    id: '3',
    name: 'AI-Assisted Reporting Automation',
    category: 'ai-automation',
    problem: 'Monthly business reports required 20+ hours of manual data compilation and formatting.',
    approach: 'Built an AI-powered pipeline using Python and LLMs to automate data extraction, analysis, and report generation.',
    solution: 'Automated workflow that pulls data, generates insights, and produces formatted reports with human review checkpoints.',
    role: 'Data Analyst / AI Automation Engineer',
    technologies: ['Python', 'OpenAI API', 'LangChain', 'Pandas', 'SQL', 'Power Automate'],
    keyFeatures: [
      'Automated data extraction from multiple sources',
      'AI-generated executive summaries',
      'Anomaly detection and flagging',
      'Human-in-the-loop validation',
      'Scheduled delivery via email/Teams',
    ],
    outcome: 'Automated workflow that pulls data, generates insights, and produces formatted reports with human review checkpoints.',
    githubUrl: '[ADD GITHUB URL]',
    liveDemoUrl: '',
    caseStudyUrl: '[ADD CASE STUDY URL]',
    thumbnail: '[ADD THUMBNAIL URL]',
    screenshots: [],
    isFeatured: true,
    status: 'published' as const,
    order: 3,
  },
  {
    id: '4',
    name: 'Operations Portal',
    category: 'web-applications',
    problem: 'Internal teams used disconnected spreadsheets and manual processes for daily operations.',
    approach: 'Developed a centralized Next.js web application with Supabase backend for workflow management.',
    solution: 'Multi-role application with task management, data entry forms, approval workflows, and reporting.',
    role: 'Full-Stack Developer',
    technologies: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Radix UI'],
    keyFeatures: [
      'Role-based access control',
      'Dynamic form builder',
      'Approval workflow engine',
      'Real-time notifications',
      'Audit logging',
      'Export to Excel/PDF',
    ],
    outcome: 'Centralized application with task management, data entry forms, approval workflows, and reporting for daily operations.',
    githubUrl: '[ADD GITHUB URL]',
    liveDemoUrl: '[ADD LIVE DEMO URL]',
    caseStudyUrl: '[ADD CASE STUDY URL]',
    thumbnail: '[ADD THUMBNAIL URL]',
    screenshots: [],
    isFeatured: true,
    status: 'published' as const,
    order: 4,
  },
  {
    id: '5',
    name: 'Sales Analytics Pipeline',
    category: 'data-analytics',
    problem: 'Sales data scattered across CRM, ERP, and spreadsheets made trend analysis difficult.',
    approach: 'Built an automated ETL pipeline using Python and SQL to consolidate data into a unified warehouse.',
    solution: 'Scheduled data pipeline with data quality checks, transformation logic, and Power BI integration.',
    role: 'Data Engineer / Analyst',
    technologies: ['Python', 'SQL', 'Pandas', 'PostgreSQL', 'Power BI', 'Airflow'],
    keyFeatures: [
      'Automated daily ETL',
      'Data quality validation',
      'Incremental loading',
      'Error alerting',
      'Historical snapshots',
      'Self-service analytics layer',
    ],
    outcome: 'Unified data pipeline with quality checks, transformation logic, and Power BI integration for trend analysis.',
    githubUrl: '[ADD GITHUB URL]',
    liveDemoUrl: '',
    caseStudyUrl: '[ADD CASE STUDY URL]',
    thumbnail: '[ADD THUMBNAIL URL]',
    screenshots: [],
    isFeatured: false,
    status: 'published' as const,
    order: 5,
  },
  {
    id: '6',
    name: 'AI Content Generation Toolkit',
    category: 'ai-automation',
    problem: 'Content creation for marketing, documentation, and training was time-consuming and inconsistent.',
    approach: 'Developed a set of structured prompts and workflows using LLMs for various content types.',
    solution: 'Reusable prompt library with templates for technical docs, marketing copy, training materials, and code documentation.',
    role: 'AI Workflow Designer',
    technologies: ['Prompt Engineering', 'Claude/GPT-4', 'Notion', 'Python', 'Markdown'],
    keyFeatures: [
      'Structured prompt templates',
      'Consistent output formatting',
      'Version-controlled prompts',
      'Integration with Notion',
      'Quality scoring rubric',
    ],
    outcome: 'Reusable prompt library with templates for technical docs, marketing copy, training materials, and code documentation.',
    githubUrl: '[ADD GITHUB URL]',
    liveDemoUrl: '',
    caseStudyUrl: '[ADD CASE STUDY URL]',
    thumbnail: '[ADD THUMBNAIL URL]',
    screenshots: [],
    isFeatured: false,
    status: 'published' as const,
    order: 6,
  },
];

const CATEGORY_ICONS = {
  'data-analytics': BarChart2,
  'ai-automation': Zap,
  'web-applications': Layout,
  'creative-technology': Image,
};

const CATEGORY_LABELS = {
  'data-analytics': 'Data Analytics',
  'ai-automation': 'AI & Automation',
  'web-applications': 'Web Applications',
  'creative-technology': 'Creative Technology',
};

export function Projects() {
  const featuredProjects = PROJECTS_DATA.filter(p => p.isFeatured && p.status === 'published');
  const otherProjects = PROJECTS_DATA.filter(p => !p.isFeatured && p.status === 'published');

  return (
    <section id="projects" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="03 — Selected work"
          title="Featured projects"
          lede="Each project follows the same arc: problem, approach, solution, outcome. Evidence first."
        />

        <div className="space-y-14">
          <div>
            <Reveal className="mb-6 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core projects</span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 90}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </div>

          {otherProjects.length > 0 && (
            <div>
              <Reveal className="mb-6 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">More work</span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project, i) => (
                  <Reveal key={project.id} delay={(i % 3) * 90}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <Reveal className="text-center pt-8 border-t border-border">
            <Button variant="outline" size="lg" asChild className="group">
              <a href="#contact" className="inline-flex items-center gap-2">
                <span>Discuss a project</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: typeof PROJECTS_DATA[0] }) {
  const Icon = CATEGORY_ICONS[project.category as keyof typeof CATEGORY_ICONS];

  return (
    <Card className="cinematic-card h-full overflow-hidden group">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="cinematic-media absolute inset-0">
          {project.thumbnail && project.thumbnail !== '[ADD THUMBNAIL URL]' ? (
            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Icon className="h-16 w-16 text-primary/30" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {CATEGORY_LABELS[project.category as keyof typeof CATEGORY_LABELS]}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{project.problem}</p>
        
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 5).map((tech, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-muted/50">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 5 && (
            <Badge variant="outline" className="text-xs bg-muted/50">
              +{project.technologies.length - 5} more
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t border-border">
          {project.githubUrl && project.githubUrl !== '[ADD GITHUB URL]' && (
            <Button variant="ghost" size="sm" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                <GitBranch className="h-4 w-4" />
                <span>Code</span>
              </a>
            </Button>
          )}
          {project.liveDemoUrl && project.liveDemoUrl !== '[ADD LIVE DEMO URL]' && (
            <Button variant="ghost" size="sm" asChild>
              <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                <ExternalLink className="h-4 w-4" />
                <span>Live</span>
              </a>
            </Button>
          )}
          {project.caseStudyUrl && project.caseStudyUrl !== '[ADD CASE STUDY URL]' && (
            <Button variant="ghost" size="sm" asChild>
              <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                <span>Case Study</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}