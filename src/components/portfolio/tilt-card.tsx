'use client';

import * as React from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

/**
 * 3D Tilt Card with dynamic radial glow border and red top hover state.
 * - On desktop: subtle 3D tilt (rotateX, rotateY) and restrained spotlight.
 * - On touch/mobile or prefers-reduced-motion: clean standard card layout without tilt.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 4,
  ...props
}: TiltCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glowPos, setGlowPos] = React.useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });

  const isInteractive = React.useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !window.matchMedia('(pointer: coarse)').matches,
    () => false
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`);
    setGlowPos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlowPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`relative group rounded-2xl border border-[rgba(8,8,8,0.12)] dark:border-[rgba(247,247,245,0.12)] hover:border-t-2 hover:border-t-[#F20B18] transition-colors duration-300 ${className}`}
      {...props}
    >
      {/* Interactive Radial Glow Border */}
      {isInteractive && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
          style={{
            opacity: glowPos.opacity,
            background: `radial-gradient(450px circle at ${glowPos.x}px ${glowPos.y}px, rgba(242, 11, 24, 0.22), transparent 60%)`,
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Content Shell */}
      <div className="relative z-10 h-full w-full rounded-2xl bg-[#F7F7F5] dark:bg-[rgba(247,247,245,0.08)]">
        {children}
      </div>
    </div>
  );
}
