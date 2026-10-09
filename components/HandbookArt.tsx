"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { AstronautScene } from "@/components/HeroAstronaut";
import { TrackPlanet, type PlanetVariant } from "@/components/sections/Tracks";
import { cn } from "@/lib/utils";

type Side = "left" | "right";

/**
 * A picture set into the handbook's text, which wraps around it. It belongs to
 * the page and scrolls with it, but not quite in step: over its pass up the
 * screen it's carried `drift` pixels further than the text (or, when negative,
 * held back by that much), so the pictures slide past the words and each other
 * a little. The space the text leaves for it doesn't move, so `drift` has to
 * stay within the margin around it.
 *
 * Left out on phones, where the column has no width to share.
 */
function Afloat({
  side,
  drift,
  className,
  children,
}: {
  side: Side;
  drift: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // 0 as it comes in at the bottom of the screen, 1 as it leaves at the top.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [drift, -drift]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none my-6 hidden sm:block",
        // The wider gap on the left keeps a list's bullets clear of the picture.
        side === "left" ? "float-left mr-14" : "float-right ml-10",
        className
      )}
    >
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * The hero's astronaut and its planet. The scene is drawn 500px square, so
 * this is a window onto it at 45% of full size.
 */
export function HandbookAstronaut({ side, drift }: { side: Side; drift: number }) {
  return (
    <Afloat side={side} drift={drift}>
      <div className="h-[215px] w-[225px]">
        <AstronautScene className="origin-top-left scale-[0.45]" />
      </div>
    </Afloat>
  );
}

/**
 * One of the track planets, with the text following its curve. Saturn's rings
 * reach past its disc, so it gets a wider, square-edged space instead.
 */
export function HandbookPlanet({
  side,
  drift,
  variant,
}: {
  side: Side;
  drift: number;
  variant: PlanetVariant;
}) {
  const ringed = variant === "saturn";

  return (
    <Afloat
      side={side}
      drift={drift}
      className={ringed ? undefined : "[shape-margin:1.5rem] [shape-outside:circle(50%)]"}
    >
      <div className={ringed ? "h-[150px] w-[210px] pl-[30px]" : "size-[150px]"}>
        <div className="origin-top-left scale-[0.83]">
          <TrackPlanet variant={variant} />
        </div>
      </div>
    </Afloat>
  );
}
