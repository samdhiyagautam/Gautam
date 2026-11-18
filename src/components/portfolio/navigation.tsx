'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { ThemeToggle } from './theme-toggle';
import { ScrollProgress } from './scroll-progress';

const SECTION_IDS = ['about', 'experience', 'projects', 'skills', 'resume', 'contact'] as const;

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>('/');

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Scroll-spy active section detection on the homepage
      if (pathname === '/') {
        if (window.scrollY < 140) {
          setActiveSection('/');
          return;
        }

        const viewportAnchor = window.scrollY + 200;
        let current = '/';

        for (const id of SECTION_IDS) {
          const el = document.getElementById(id);
          if (el) {
            const top = el.offsetTop;
            const bottom = top + el.offsetHeight;
            if (viewportAnchor >= top && viewportAnchor < bottom) {
              current = id;
              break;
            }
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const isItemActive = (href: string) => {
    if (pathname === '/') {
      if (href === '/') return activeSection === '/';
      const sectionKey = href.replace(/^\//, '');
      return activeSection === sectionKey;
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  const getItemHref = (href: string) => {
    if (pathname === '/' && href !== '/') {
      return `#${href.replace(/^\//, '')}`;
    }
    return href;
  };

  const isOverDarkHero = !scrolled && pathname === '/';

  return (
    <>
      <ScrollProgress />
      <header
        suppressHydrationWarning
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#F7F7F5]/90 dark:bg-[#080808]/90 backdrop-blur-md border-b border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] shadow-[0_4px_20px_rgba(8,8,8,0.06)] text-[#080808] dark:text-[#F7F7F5]'
            : isOverDarkHero
            ? 'bg-transparent border-b border-transparent text-[#F7F7F5]'
            : 'bg-transparent border-b border-transparent text-foreground'
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5" aria-label="Gautam Samdhiya homepage">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs tracking-wider shrink-0 transition-transform hover:scale-105',
                  isOverDarkHero
                    ? 'bg-[#F7F7F5] text-[#080808]'
                    : 'bg-[#080808] text-[#F7F7F5] dark:bg-[#F7F7F5] dark:text-[#080808]'
                )}
                aria-hidden="true"
              >
                GS
              </div>
              <span className="hidden sm:inline text-lg sm:text-xl font-bold tracking-tight">
                Gautam Samdhiya
              </span>
              <span className="inline sm:hidden text-base font-bold tracking-tight">
                Gautam S.
              </span>
            </Link>

            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={getItemHref(item.href)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative py-1 text-sm font-medium transition-colors',
                      isOverDarkHero
                        ? active
                          ? 'text-[#F7F7F5] font-semibold'
                          : 'text-[rgba(247,247,245,0.70)] hover:text-[#F7F7F5]'
                        : active
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-[#F20B18] transition-transform duration-300',
                        active ? 'scale-x-100' : 'scale-x-0'
                      )}
                    />
                  </Link>
                );
              })}
              <Button
                variant={isOverDarkHero ? 'inverted' : 'default'}
                size="sm"
                asChild
              >
                <Link href="/resume" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Resume</span>
                </Link>
              </Button>
              <ThemeToggle />
            </div>

            <div className="flex lg:hidden items-center space-x-3">
              <ThemeToggle />
              <Button
                variant={isOverDarkHero ? 'inverted' : 'default'}
                size="sm"
                asChild
              >
                <Link href="/resume" className="flex items-center space-x-1.5 text-xs px-3">
                  <Download className="h-3.5 w-3.5" />
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
            <div
              id="mobile-menu"
              className="menu-drop lg:hidden py-4 border-t border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-[#F7F7F5]/95 dark:bg-[#080808]/95 backdrop-blur-md"
            >
              <div className="flex flex-col space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={getItemHref(item.href)}
                      className={cn(
                        'text-base font-medium transition-colors px-3 py-2 rounded-md',
                        active
                          ? 'text-[#F20B18] font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Button variant="default" size="sm" asChild className="w-full mt-2">
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
    </>
  );
}
