'use client';

import { Download, Eye, Printer, Mail, MapPin, Link2, GitBranch, Phone, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from './reveal';
import type { Resume as ResumeData, Experience } from '@/types';

export function Resume({ resume }: { resume: ResumeData | null; experiences: Experience[] }) {
  const resumeUrl = resume?.fileUrl ?? '/resume.pdf';

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="resume" className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header & Quick Action Bar */}
        <Reveal className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            <Award className="h-3.5 w-3.5" />
            <span>ATS-Friendly Data Analyst Resume</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Curriculum Vitae
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Recruiter-ready single-column ATS format. Download the official PDF or review below.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="premium" asChild className="gap-2 shadow-sm">
              <a href={resumeUrl} download="Gautam-Samdhiya-Data-Analyst-Resume.pdf">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
                <span>Open in Tab</span>
              </a>
            </Button>
            <Button size="lg" variant="ghost" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              <span>Print Resume</span>
            </Button>
          </div>
        </Reveal>

        {/* ATS-Friendly One-Page Printable Resume Container */}
        <Reveal delay={80}>
          <article className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 sm:p-12 lg:p-14 shadow-md text-foreground transition-all">
            {/* 1. Header & Contact Information */}
            <header className="border-b border-border pb-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Gautam Samdhiya
                </h1>
                <p className="text-sm sm:text-base font-semibold text-primary">
                  Data Analyst | SQL · Power BI · Excel · Python
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Ranchi, Jharkhand, India
                </span>
                <a href="mailto:gautamsamdhiya2000@gmail.com" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  gautamsamdhiya2000@gmail.com
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Available on request
                </span>
                <a href="https://www.linkedin.com/in/connectwithgautam" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Link2 className="h-3.5 w-3.5 text-primary" />
                  LinkedIn
                </a>
                <a href="https://github.com/samdhiyagautam" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <GitBranch className="h-3.5 w-3.5 text-primary" />
                  GitHub
                </a>
              </div>
            </header>

            {/* 2. Professional Summary */}
            <section className="mt-6 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/80 pb-1">
                Professional Summary
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Data Analyst with 2+ years of professional experience as an Assistant Manager, combining operational business understanding with hands-on data analytics. Proficient in SQL (complex queries, CTEs, window functions), Python (Pandas ETL), Power BI (interactive dashboards, DAX measures), and Microsoft Excel (advanced formulas, Power Query) to build operational dashboards, automate recurring reporting, and turn business requirements into practical data solutions. Experienced in AI-assisted workflows with strict human validation of all analytical outputs.
              </p>
            </section>

            {/* 3. Technical Skills */}
            <section className="mt-6 space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/80 pb-1">
                Technical Skills
              </h2>
              <div className="grid gap-2 text-xs sm:text-sm">
                <div>
                  <strong className="text-foreground">Data Analysis &amp; Statistics:</strong>{' '}
                  <span className="text-muted-foreground">
                    SQL (querying, multi-table joins, aggregations, CTEs, window functions), Python (Pandas, automated ETL pipelines), Microsoft Excel (XLOOKUP, INDEX/MATCH, Power Query, pivot tables), Google Sheets, Statistics Basics (descriptive statistics, distributions, trend evaluation, variance)
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">BI &amp; Visualization:</strong>{' '}
                  <span className="text-muted-foreground">
                    Power BI (dashboard design, DAX calculated measures, star-schema data modeling, scheduled refresh), Looker Studio
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">Databases &amp; Systems:</strong>{' '}
                  <span className="text-muted-foreground">
                    PostgreSQL, SQLite, relational schema design, indexes, constraint optimization
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">Web &amp; Supporting Tools:</strong>{' '}
                  <span className="text-muted-foreground">
                    Next.js, React, Supabase, Git/GitHub, Canva, Figma
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">AI Productivity:</strong>{' '}
                  <span className="text-muted-foreground">
                    Prompt engineering, AI-assisted exploratory data analysis and documentation with manual review
                  </span>
                </div>
              </div>
            </section>

            {/* 4. Professional Experience */}
            <section className="mt-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/80 pb-1">
                Professional Experience
              </h2>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                  <div className="font-bold text-foreground">
                    Assistant Manager — <span className="font-semibold text-primary">Dhurina</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    October 2024 – Present | Ranchi, India
                  </div>
                </div>

                <ul className="space-y-1.5 pl-4 text-xs sm:text-sm text-muted-foreground list-disc">
                  <li>
                    Designed and deployed operational Power BI dashboards with custom DAX measures and automated data refresh, enabling leadership to track departmental KPIs with self-service reporting.
                  </li>
                  <li>
                    Automated recurring cross-departmental reporting pipelines using Python (Pandas) and SQL, eliminating manual spreadsheet consolidation across teams.
                  </li>
                  <li>
                    Engineered standardized SQL queries and analytical views across operational PostgreSQL databases to consolidate fragmented data sources, resolving metric discrepancies across teams.
                  </li>
                  <li>
                    Partnered with departmental stakeholders to translate operational pain points into structured reporting specifications and actionable visual analytics.
                  </li>
                  <li>
                    Developed and maintained internal operations web applications using Next.js, Supabase, and PostgreSQL, supporting daily staff workflow and structured data intake.
                  </li>
                </ul>
              </div>
            </section>

            {/* 5. Key Analytics Projects */}
            <section className="mt-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/80 pb-1">
                Key Analytics Projects
              </h2>

              <div className="space-y-3">
                {/* Project 1 */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs sm:text-sm">
                    <span className="font-bold text-foreground">
                      IPL Cricket Analytics (SQL + Python Pipeline)
                    </span>
                    <a
                      href="https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/ipl-analysis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      GitHub Repository
                    </a>
                  </div>
                  <ul className="space-y-1 pl-4 text-xs sm:text-sm text-muted-foreground list-disc">
                    <li>
                      Analyzed ball-by-ball data of 1,243 IPL matches (295,732 deliveries, 2008–2026) sourced from cricsheet.org: designed 2-table indexed SQLite schema and answered 12 SQL questions (54.7% toss-field advantage, Jaipur 64.7% chase win rate, death-over economy).
                    </li>
                    <li>
                      Built dependency-free Python automated ingestion pipeline (download → SQLite → export) executing in ~4.2 seconds, outputting 12 query CSVs and SVG trend charts.
                    </li>
                  </ul>
                </div>

                {/* Project 2 */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs sm:text-sm">
                    <span className="font-bold text-foreground">
                      Retail Sales Analysis &amp; Customer KPI Modeling (SQL + Power BI + Python)
                    </span>
                    <a
                      href="https://github.com/samdhiyagautam/Gautam/tree/main/demo-projects/retail-sales-analysis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      GitHub Repository
                    </a>
                  </div>
                  <ul className="space-y-1 pl-4 text-xs sm:text-sm text-muted-foreground list-disc">
                    <li>
                      Constructed star-schema analytical model with 11 production SQL queries using CTEs, CASE conditional pivots, and LAG window functions to evaluate customer concentration and MoM growth.
                    </li>
                    <li>
                      Verified Pareto principle (top 20% accounts drove 50.9% (synthetic data) / $4.20M of $8.26M (synthetic data) revenue); analyzed Q4 seasonal revenue spikes ($1.32M in 2024, $1.24M in 2025) and repeat buyer metrics (84.4% (synthetic data)).
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Education & Languages */}
            <section className="mt-6 pt-2 border-t border-border grid sm:grid-cols-2 gap-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Education
                </h2>
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-foreground">Bachelor of Science in Mathematics (B.Sc.)</div>
                  <div className="text-muted-foreground">Ranchi University | 2024</div>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Languages
                </h2>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">English:</strong> Professional Working Proficiency ·{' '}
                  <strong className="text-foreground">Hindi:</strong> Native
                </div>
              </div>
            </section>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
