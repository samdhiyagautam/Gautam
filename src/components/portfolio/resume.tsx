'use client';

import { Download, FileText, Eye, ExternalLink, Clock, Calendar, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Resume as ResumeData, Experience } from '@/types';

export function Resume({ resume, experiences }: { resume: ResumeData | null; experiences: Experience[] }) {
  const resumeExists = resume !== null;
  const resumeUrl = resume?.fileUrl ?? '/resume.pdf';

  return (
    <section id="resume" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Resume</h2>
          <p className="text-lg text-muted-foreground">
            Download or view my professional resume.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Professional Resume</CardTitle>
              <p className="text-muted-foreground">
                {resumeExists 
                  ? 'Current version reflecting my latest experience and skills.' 
                  : '[PLACEHOLDER] Resume not yet uploaded. Add resume.pdf to public folder.'
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {resumeExists ? (
                  <>
                    <Button size="lg" variant="premium" asChild className="w-full sm:w-auto">
                      <a href={resumeUrl} download className="flex items-center space-x-2">
                        <Download className="h-5 w-5" />
                        <span>Download Resume</span>
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <span>View in Browser</span>
                      </a>
                    </Button>
                  </>
                ) : (
                  <Button size="lg" variant="outline" disabled className="w-full sm:w-auto">
                    <span>Add resume.pdf to public/ folder</span>
                  </Button>
                )}
              </div>

              {resumeExists && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{resume?.version ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">Version</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{resume ? new Date(resume.uploadedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</div>
                      <div className="text-xs text-muted-foreground">Last Updated</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="text-2xl font-bold text-primary">PDF</div>
                      <div className="text-xs text-muted-foreground">Format</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!resumeExists && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-destructive">Resume Placeholder</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      To enable the resume download, add your <code className="bg-background px-1 rounded">resume.pdf</code> file to the 
                      <code className="bg-background px-1 rounded">public/</code> folder. The download and view buttons will automatically activate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Professional Highlights</span>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Assistant Manager with 2+ years experience</li>
                  <li className="flex items-center space-x-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Data Analytics: Python, SQL, Power BI, Excel</li>
                  <li className="flex items-center space-x-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Web Development: Next.js, React, Supabase, PostgreSQL</li>
                  <li className="flex items-center space-x-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI-Enabled Workflows: Prompt Engineering, Automation</li>
                  <li className="flex items-center space-x-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Creative Technology: Figma, Canva, AI Design Tools</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Experience Timeline</span>
                </h4>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="flex items-center space-x-3 text-sm">
                      <div className="w-24 text-muted-foreground">
                        {exp.isCurrent ? 'Present' : exp.endDate || exp.startDate}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{exp.designation}</div>
                        <div className="text-muted-foreground">{exp.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Availability</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="premium">Open to Opportunities</Badge>
                  <Badge variant="outline">Full-time</Badge>
                  <Badge variant="outline">Hybrid/Remote</Badge>
                  <Badge variant="outline">Immediate Join</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}