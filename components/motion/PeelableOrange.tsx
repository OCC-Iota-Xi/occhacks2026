"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const SEGMENTS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    x2: 50 + 33 * Math.cos(angle),
    y2: 50 + 33 * Math.sin(angle),
  };
});

const deg = (d: number) => (d * Math.PI) / 180;

/** 120° peel sector of the r=40 disc, starting at `start` degrees. */
function sectorPath(start: number) {
  const end = start + 120;
  const x1 = 50 + 40 * Math.cos(deg(start));
  const y1 = 50 + 40 * Math.sin(deg(start));
  const x2 = 50 + 40 * Math.cos(deg(end));
  const y2 = 50 + 40 * Math.sin(deg(end));
  return `M 50 50 L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`;
}

/* Three wedges: top (holds the stem + leaf), lower-right, lower-left.
   Each flies off along its own mid-angle when torn. */
const PIECES = [-150, -30, 90].map((start) => {
  const mid = deg(start + 60);
  return {
    start,
    path: sectorPath(start),
    exitX: Math.cos(mid) * 260,
    exitY: Math.sin(mid) * 260 + 180,
    exitRotate: start > 0 ? -70 : 70,
  };
});

const PORES: [number, number][][] = [
  [[42, 26], [58, 30], [50, 16]],
  [[68, 52], [60, 66], [74, 62]],
  [[32, 52], [40, 66], [26, 62]],
];

/**
 * A big geometric orange whose peel comes off in three click-drag motions —
 * each wedge tears away past the drag threshold, revealing the segmented
 * flesh. Tap peels too (the reduced-motion path). One-way per session.
 */
export default function PeelableOrange({ className }: { className?: string }) {
  const [peeled, setPeeled] = useState<boolean[]>([false, false, false]);
  const reduceMotion = useReducedMotion();
  const done = peeled.every(Boolean);
  const started = peeled.some(Boolean);

  const peel = (i: number) =>
    setPeeled((prev) => prev.map((p, j) => (j === i ? true : p)));

  return (
    <div className={cn("relative", className)}>
      {/* Flesh underneath */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        style={{ transformOrigin: "center" }}
        animate={done && !reduceMotion ? { scale: [0.94, 1.05, 1] } : undefined}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <circle cx="50" cy="50" r="37" className="fill-accent" />
        <circle cx="50" cy="50" r="37" fill="none" className="stroke-background" strokeWidth="2.5" />
        {SEGMENTS.map((seg, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={seg.x2}
            y2={seg.y2}
            className="stroke-ring/50"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ))}
        <circle cx="50" cy="50" r="3.5" className="fill-ring/60" />
      </motion.svg>

      {/* Peel wedges — each one is its own drag */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
        <AnimatePresence>
          {PIECES.map(
            (piece, i) =>
              !peeled[i] && (
                <motion.g
                  key={piece.start}
                  className="cursor-grab touch-none active:cursor-grabbing"
                  role="button"
                  aria-label="peel a piece of the orange — drag to tear it off"
                  drag={!reduceMotion}
                  dragSnapToOrigin
                  dragMomentum={false}
                  dragElastic={0.5}
                  whileDrag={{ scale: 1.04, rotate: 5 }}
                  onDrag={(_, info) => {
                    if (Math.hypot(info.offset.x, info.offset.y) > 80) peel(i);
                  }}
                  onTap={() => {
                    if (reduceMotion) peel(i);
                  }}
                  exit={{
                    x: piece.exitX,
                    y: piece.exitY,
                    rotate: piece.exitRotate,
                    opacity: 0,
                    transition: { duration: 0.65, ease: [0.35, 0, 0.7, 0.4] },
                  }}
                  style={{ transformOrigin: "50px 50px" }}
                >
                  <path
                    d={piece.path}
                    className="fill-[#fb923c] stroke-background"
                    strokeWidth="1.2"
                  />
                  {PORES[i].map(([cx, cy], j) => (
                    <circle key={j} cx={cx} cy={cy} r="1.3" className="fill-ring/25" />
                  ))}
                  {/* stem + leaf ride on the top wedge */}
                  {i === 0 && (
                    <>
                      <line
                        x1="50"
                        y1="10"
                        x2="50"
                        y2="4"
                        className="stroke-ring"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path d="M50 6 q8 -7 15 -3 q-6 8 -15 3" className="fill-ring/80" />
                    </>
                  )}
                </motion.g>
              )
          )}
        </AnimatePresence>
      </svg>

      {/* Caption */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-9 text-center text-sm text-muted-foreground/80">
        <AnimatePresence mode="wait">
          <motion.span
            key={done ? "done" : started ? "going" : "start"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {done ? "see you in october." : started ? "keep peeling" : "peel me"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
