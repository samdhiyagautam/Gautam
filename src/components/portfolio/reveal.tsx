"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "rise" | "fade" | "scale";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  variant?: RevealVariant;
}

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "rise",
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "reveal",
        variant === "rise" && "reveal-rise",
        variant === "fade" && "reveal-fade",
        variant === "scale" && "reveal-scale",
        visible && "is-visible",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
