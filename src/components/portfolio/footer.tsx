'use client';

import Link from 'next/link';
import { GitBranch, Link2, Mail, Briefcase, Heart } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const profile = {
    name: '[ADD YOUR NAME]',
    email: '[ADD YOUR EMAIL]',
    linkedin: '[ADD YOUR LINKEDIN URL]',
    github: '[ADD YOUR GITHUB URL]',
  };

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4" aria-label="Go to homepage">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight">{profile.name}</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Assistant Manager | Data Analytics | AI-Enabled Business Solutions
              <br />
              I turn business problems into practical solutions using data, AI and modern technology.
            </p>
            <div className="flex items-center space-x-4">
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Link2 className="h-5 w-5" />
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <GitBranch className="h-5 w-5" />
              </a>
              <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2">
                  <Link2 className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2">
                  <GitBranch className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {profile.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center space-x-2">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500" aria-hidden="true" />
            <span>Next.js, React, Supabase, Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}