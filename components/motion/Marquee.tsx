"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds for one full cycle of the content. */
  duration?: number;
}

/** Slow infinite text drift; pauses on hover. Content is rendered twice. */
export default function Marquee({ children, className, duration = 40 }: MarqueeProps) {
  const pct = useMotionValue(0);
  const x = useMotionTemplate`${pct}%`;
  const paused = useRef(false);
  const reduceMotion = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (paused.current || reduceMotion) return;
    let next = pct.get() - (50 / (duration * 1000)) * delta;
    if (next <= -50) next += 50;
    pct.set(next);
  });

  return (
    <div
      className={cn("overflow-hidden whitespace-nowrap", className)}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <motion.div className="inline-flex w-max will-change-transform" style={{ x }}>
        <span className="inline-block">{children}</span>
        <span className="inline-block">{children}</span>
      </motion.div>
    </div>
  );
}
