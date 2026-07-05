import type { Variants } from "motion/react";

/* The whole animation budget for the site lives here. */

export const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

/* Editorial mask reveal: wrap the line in overflow-hidden, slide it up. */
export const lineReveal: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;
