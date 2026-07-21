"use client";

import { useRef, useState } from "react";
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
 * slides up into place, staggered. Once every line has landed, the masks are
 * released so hover effects inside (scale, magnetic drift) can overflow.
 */
export default function RevealLines({
  lines,
  className,
  lineClassName,
  onMount = false,
  delay = 0,
}: RevealLinesProps) {
  const reduceMotion = useReducedMotion();
  const doneCount = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const masked = !revealed && !reduceMotion;

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
        <div
          key={i}
          className={cn("pb-[0.12em] -mb-[0.12em]", masked ? "overflow-hidden" : "overflow-visible")}
        >
          <motion.div
            variants={reduceMotion ? undefined : lineReveal}
            className={cn(masked && "will-change-transform", lineClassName)}
            onAnimationComplete={() => {
              doneCount.current += 1;
              if (doneCount.current >= lines.length) setRevealed(true);
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
