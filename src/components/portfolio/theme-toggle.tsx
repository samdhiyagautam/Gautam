'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Cycles light → dark → system. Renders a static placeholder until mounted
// so server and client HTML match (no hydration mismatch).
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // SSR-safe mount detection without setState-in-effect: false on server,
  // true on client, so server and client HTML match on first paint.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle color theme" disabled>
        <Sun className="h-5 w-5" aria-hidden="true" />
      </Button>
    );
  }

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const label =
    theme === 'light' ? 'Switch to dark mode' : theme === 'dark' ? 'Switch to system theme' : 'Switch to light mode';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : theme === 'dark' ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Monitor className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
