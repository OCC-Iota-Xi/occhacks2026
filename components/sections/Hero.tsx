"use client";

import { motion, useReducedMotion } from "motion/react";
import RevealLines from "@/components/motion/RevealLines";
import CircularBadge from "@/components/motion/CircularBadge";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const fadeIn = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.5, ease: EASE },
        };

  return (
    <section id="top" className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <motion.div {...fadeIn(0.15)}>
        <CircularBadge text="orange coast college · est. 2024 · 24 hours ·" className="mb-8" />
      </motion.div>

      <RevealLines
        onMount
        delay={0.3}
        className="text-[13vw] leading-[1.04] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        lines={[
          <span key="1">occ hacks is</span>,
          <span key="2">
            a 24-hour{" "}
            <span className="font-serif italic text-[1.06em] text-ring">studio</span>
          </span>,
          <span key="3">on the golden coast.</span>,
        ]}
      />

      <motion.p
        className="mt-8 text-base tabular-nums sm:text-lg"
        {...fadeIn(0.9)}
      >
        Oct 11–12, 2026 · Orange Coast College
      </motion.p>
      <motion.p className="mt-2 text-sm text-muted-foreground" {...fadeIn(1.0)}>
        150+ students, every meal covered, free to attend.
      </motion.p>

      <motion.div className="mt-8 flex items-center gap-6" {...fadeIn(1.1)}>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            asChild
            className="h-auto rounded-full bg-foreground px-7 py-2.5 text-sm text-background hover:bg-foreground/85"
          >
            <a href="#register">register</a>
          </Button>
        </motion.div>
        <a
          href="#tracks"
          className="group text-sm transition-colors hover:text-ring"
        >
          see the tracks{" "}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </a>
      </motion.div>
    </section>
  );
}
