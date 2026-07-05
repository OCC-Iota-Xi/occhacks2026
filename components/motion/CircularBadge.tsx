"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface CircularBadgeProps {
  text: string;
  className?: string;
}

/** Rotating circular-text stamp — the hero's one ornament. */
export default function CircularBadge({ text, className }: CircularBadgeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={cn("size-24 md:size-28", className)}
      aria-hidden="true"
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={{ duration: 30, ease: "linear", repeat: Infinity }}
    >
      <defs>
        <path id="badge-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
      </defs>
      <circle cx="50" cy="50" r="26" className="fill-accent" />
      <text className="fill-accent-foreground text-[10.5px] tracking-[0.14em] font-sans">
        <textPath href="#badge-circle">{text}</textPath>
      </text>
    </motion.svg>
  );
}
