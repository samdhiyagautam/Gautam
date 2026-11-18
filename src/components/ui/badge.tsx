'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'premium';
}

const badgeVariants = {
  default: 'text-[#080808] dark:text-[#F7F7F5] border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] bg-transparent',
  secondary: 'text-[rgba(8,8,8,0.65)] dark:text-[rgba(247,247,245,0.70)] border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] bg-transparent',
  destructive: 'text-[#F20B18] border border-[#F20B18] bg-transparent',
  outline: 'text-[#080808] dark:text-[#F7F7F5] border border-[rgba(8,8,8,0.25)] dark:border-[rgba(247,247,245,0.25)] bg-transparent',
  premium: 'text-[#080808] dark:text-[#F7F7F5] border border-[#F20B18] bg-transparent',
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2',
          badgeVariants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
