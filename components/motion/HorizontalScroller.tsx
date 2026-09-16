"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A free-scrolling horizontal rail with a progress scrubber underneath, shared
 * by the schedule and the FAQ so both read as the same gesture.
 *
 * Native overflow scrolling rather than a drag handler: it keeps trackpad,
 * touch and keyboard working for free. tabIndex makes the region focusable so
 * arrow keys can scroll it, which a plain overflow container does not get in
 * every browser.
 */
export default function HorizontalScroller({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  /** Names the scrollable region for screen readers and keyboard users. */
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: ref });

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="scroll-soft overflow-x-auto pb-6 focus-visible:outline-none"
      >
        {children}
      </div>

      <div className="mx-auto h-px w-full max-w-md overflow-hidden bg-border">
        <motion.div
          className="h-full w-full origin-left bg-ring"
          style={{ scaleX: scrollXProgress }}
        />
      </div>
    </div>
  );
}
