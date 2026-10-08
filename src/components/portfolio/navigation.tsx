'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Download, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { ThemeToggle } from './theme-toggle';

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      suppressHydrationWarning
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border shadow-[0_1px_24px_rgb(0_0_0/0.06)]'
          : 'bg-gradient-to-b from-background/70 to-transparent border-b border-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" aria-label="Go to homepage">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Portfolio</span>
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-7">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'relative py-1 text-sm font-medium transition-colors hover:text-foreground',
                  pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-foreground transition-transform duration-300',
                    pathname === item.href ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </Link>
            ))}
            <Button variant="premium" size="sm" asChild>
              <Link href="/resume" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Resume</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <Button variant="premium" size="sm" asChild>
              <Link href="/resume" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Resume</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex flex-col space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-base font-medium transition-colors hover:text-primary px-2 py-2',
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button variant="premium" size="sm" asChild className="w-full mt-2">
                <Link href="/resume" className="flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Resume</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}