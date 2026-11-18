'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#080808] text-[#F7F7F5] border border-transparent hover:bg-[#F20B18] hover:text-[#080808]',
        destructive: 'bg-[#F20B18] text-[#080808] hover:bg-[#080808] hover:text-[#F7F7F5]',
        outline: 'border border-[#080808] bg-transparent text-[#080808] hover:bg-[#080808] hover:text-[#F7F7F5]',
        secondary: 'border border-[#080808] bg-transparent text-[#080808] hover:bg-[#080808] hover:text-[#F7F7F5]',
        ghost: 'hover:bg-[rgba(8,8,8,0.08)] hover:text-[#080808] dark:hover:bg-[rgba(247,247,245,0.08)] dark:hover:text-[#F7F7F5]',
        link: 'underline-offset-4 hover:underline hover:text-[#F20B18]',
        premium: 'bg-[#080808] text-[#F7F7F5] border border-transparent hover:bg-[#F20B18] hover:text-[#080808]',
        inverted: 'bg-[#F7F7F5] text-[#080808] border border-transparent hover:bg-[#F20B18] hover:text-[#080808]',
        'inverted-outline': 'border border-[rgba(247,247,245,0.70)] bg-transparent text-[#F7F7F5] hover:bg-[#F7F7F5] hover:text-[#080808]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
