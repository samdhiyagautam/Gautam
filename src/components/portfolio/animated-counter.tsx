'use client';

import * as React from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animated counter that counts up to a target number when scrolled into view.
 * - Tabular numbers ensure zero layout shift.
 * - Disables animation when prefers-reduced-motion is active.
 * - Single-play trigger on viewport entry via IntersectionObserver.
 */
export function AnimatedCounter({
  value,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return value;
    }
    return 0;
  });
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      hasAnimated.current = true;
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const startTime = performance.now();
          const startValue = 0;
          const endValue = value;

          const step = (currentTime: number) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Ease-out cubic formula
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * easeOut;
            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(endValue);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.round(displayValue).toLocaleString('en-US');

  return (
    <span ref={containerRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/**
 * Helper to auto-parse strings like "295,732", "1,243", "54.7%", "$8.26M", "2+ Years"
 * and render an animated counter where appropriate.
 */
export function MetricCounter({ text, className = '' }: { text: string; className?: string }) {
  // Check if string contains a percentage: e.g. "54.7%"
  const pctMatch = text.match(/^([\d,.]+)\s*%$/);
  if (pctMatch) {
    const num = parseFloat(pctMatch[1].replace(/,/g, ''));
    const decimals = pctMatch[1].includes('.') ? pctMatch[1].split('.')[1].length : 0;
    return <AnimatedCounter value={num} decimals={decimals} suffix="%" className={className} />;
  }

  // Check if string is an integer with commas: e.g. "295,732" or "1,243"
  const intMatch = text.match(/^([\d,]+)$/);
  if (intMatch && intMatch[1].includes(',')) {
    const num = parseInt(intMatch[1].replace(/,/g, ''), 10);
    return <AnimatedCounter value={num} className={className} />;
  }

  // Check currency: e.g. "$8,262,058"
  const currMatch = text.match(/^\$([\d,]+)$/);
  if (currMatch) {
    const num = parseInt(currMatch[1].replace(/,/g, ''), 10);
    return <AnimatedCounter value={num} prefix="$" className={className} />;
  }

  return <span className={className}>{text}</span>;
}
