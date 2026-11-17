"use client";

import * as React from "react";

/**
 * Scroll-linked 3D effect.
 *
 * - One shared, passive scroll listener (rAF-throttled) drives every instance.
 * - Styles are written straight to the element (no React re-renders on scroll).
 * - Only elements near the viewport are updated (IntersectionObserver).
 * - Disabled for `prefers-reduced-motion`; softened on small screens.
 * - Works alongside <Reveal>: nest <Scroll3D> inside it (Reveal handles
 *   opacity/entrance, Scroll3D handles the scroll-driven rotation/depth).
 */

export type Scroll3DVariant =
  | "tilt" //        card stands up from the "floor" (rotateX)
  | "flip-left" //   swings in from the left (rotateY)
  | "flip-right" //  swings in from the right (rotateY)
  | "exit" //        recedes into depth as it scrolls away (hero)
  | "exit-right" //  same, with a sideways swing
  | "parallax"; //   moves at a different speed than the page (depth layers)

interface Scroll3DProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Scroll3DVariant;
  /** Multiplier for rotation/depth. 1 = default. */
  intensity?: number;
  /** parallax only: 0.1 (far, slow) … 0.5 (near, fast). */
  speed?: number;
}

/* ───────────── shared scroll scheduler ───────────── */

type Listener = () => void;
const listeners = new Set<Listener>();
let frame = 0;
let attached = false;

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    listeners.forEach((fn) => fn());
  });
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  if (!attached) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    attached = true;
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && attached) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      attached = false;
    }
  };
}

/* ───────────── helpers ───────────── */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
// easeOutCubic — fast start, gentle settle
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Pose {
  rx: number;
  ry: number;
  z: number;
  scale?: number;
}

const ENTER_POSE: Record<"tilt" | "flip-left" | "flip-right", Pose> = {
  tilt: { rx: 20, ry: 0, z: -140, scale: 0.96 },
  "flip-left": { rx: 8, ry: -18, z: -120, scale: 0.97 },
  "flip-right": { rx: 8, ry: 18, z: -120, scale: 0.97 },
};

const EXIT_POSE: Record<"exit" | "exit-right", Pose & { ty: number; fade: number }> = {
  exit: { rx: -12, ry: 0, z: -200, scale: 0.94, ty: 36, fade: 0.55 },
  "exit-right": { rx: -8, ry: -22, z: -180, scale: 0.95, ty: 28, fade: 0.5 },
};

/* ───────────── component ───────────── */

export function Scroll3D({
  children,
  className,
  variant = "tilt",
  intensity = 1,
  speed = 0.2,
  style,
  ...props
}: Scroll3DProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    let inView = false;

    const apply = () => {
      if (!inView) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const k = window.innerWidth < 768 ? 0.55 : 1; // gentler on phones
      const amount = intensity * k;

      if (variant === "parallax") {
        // Pushes the layer down as the page scrolls up, so it appears to move
        // slower than the content (= further away).
        const y = -rect.top * speed * amount;
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        return;
      }

      if (variant === "exit" || variant === "exit-right") {
        const pose = EXIT_POSE[variant];
        // 0 while the element's top is at/below the viewport top, → 1 once
        // it has scrolled ~90% of its own height past the top.
        const x = easeOut(clamp01(-rect.top / (rect.height * 0.9 || 1)));
        if (x < 0.001) {
          el.style.transform = "";
          el.style.opacity = "";
          return;
        }
        el.style.transform =
          `perspective(1200px) translateY(${(pose.ty * x * amount).toFixed(1)}px) ` +
          `translateZ(${(pose.z * x * amount).toFixed(1)}px) ` +
          `rotateX(${(pose.rx * x * amount).toFixed(2)}deg) ` +
          `rotateY(${(pose.ry * x * amount).toFixed(2)}deg) ` +
          `scale(${(1 - (1 - (pose.scale ?? 1)) * x).toFixed(3)})`;
        el.style.opacity = String(1 - pose.fade * x);
        return;
      }

      // Entering variants: 0 when the top edge is at the viewport bottom,
      // 1 when it has travelled ~65% up the screen.
      const p = clamp01((vh - rect.top) / (vh * 0.65));
      const t = 1 - easeOut(p); // 1 = fully "laid back", 0 = flat
      if (t < 0.001) {
        el.style.transform = "";
        return;
      }
      const pose = ENTER_POSE[variant];
      el.style.transform =
        `perspective(1100px) translateZ(${(pose.z * t * amount).toFixed(1)}px) ` +
        `rotateX(${(pose.rx * t * amount).toFixed(2)}deg) ` +
        `rotateY(${(pose.ry * t * amount).toFixed(2)}deg) ` +
        `scale(${(1 - (1 - (pose.scale ?? 1)) * t).toFixed(3)})`;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        el.style.willChange = inView ? "transform" : "auto";
        if (inView) apply();
      },
      // Keep updating slightly outside the viewport so there is no pop-in.
      { rootMargin: "25% 0px 25% 0px" }
    );
    observer.observe(el);

    const unsubscribe = subscribe(apply);
    const onMotionChange = () => {
      if (motion.matches) {
        el.style.transform = "";
        el.style.opacity = "";
      }
    };
    motion.addEventListener("change", onMotionChange);
    apply();

    return () => {
      observer.disconnect();
      unsubscribe();
      motion.removeEventListener("change", onMotionChange);
    };
  }, [variant, intensity, speed]);

  return (
    <div
      ref={ref}
      style={{ transformOrigin: variant.startsWith("exit") ? "50% 0%" : "50% 100%", ...style }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

/** Column-aware variant for 3-column grids: left swings in, middle stands up, right swings in. */
export function columnVariant(index: number, columns = 3): Scroll3DVariant {
  const col = index % columns;
  if (columns === 1) return "tilt";
  if (col === 0) return "flip-left";
  if (col === columns - 1) return "flip-right";
  return "tilt";
}
