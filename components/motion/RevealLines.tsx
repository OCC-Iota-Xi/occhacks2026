"use client";

import { motion, useReducedMotion } from "motion/react";
import { lineReveal, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealLinesProps {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  /** Animate on mount instead of when scrolled into view (hero). */
  onMount?: boolean;
  delay?: number;
}

/**
 * Editorial mask reveal: each line sits in an overflow-hidden wrapper and
 * slides up into place, staggered.
 */
export default function RevealLines({
  lines,
  className,
  lineClassName,
  onMount = false,
  delay = 0,
}: RevealLinesProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : stagger}
      initial={reduceMotion ? { opacity: 0 } : "hidden"}
      {...(onMount
        ? { animate: reduceMotion ? { opacity: 1 } : "visible" }
        : {
            whileInView: reduceMotion ? { opacity: 1 } : "visible",
            viewport: viewportOnce,
          })}
      transition={{ delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.div variants={reduceMotion ? undefined : lineReveal} className={cn("will-change-transform", lineClassName)}>
            {line}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
