"use client";

import { motion, useReducedMotion } from "motion/react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import CtaButtons from "@/components/CtaButtons";
import HeroAstronaut from "@/components/HeroAstronaut";

/**
 * The original space pirate hero: left-aligned OCCHacks title with the gold
 * gradient sweep, date line, and the clipped cyber CTAs. The backdrop is the
 * global WebGL particle field rendered in the root layout.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden min-h-screen flex flex-col justify-center gap-6 lg:justify-between lg:gap-0"
    >
      <HeroAstronaut />

      {/* Main content container */}
      <div className="flex items-center px-6 sm:px-12 md:px-24 z-10 lg:flex-1">
        <motion.div
          className="max-w-3xl w-full text-left"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, x: -50, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.7, duration: 1.0, ease: [0.215, 0.61, 0.355, 1] }}
        >
          {/* Main Title (Bruno Ace SC font) */}
          <h1 className="font-header text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] 2xl:text-[8rem] mb-1 md:mb-1 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] tracking-wider leading-none">
            OCC<AnimatedGradientText
              style={{
                backgroundImage:
                  "linear-gradient(to right, #f97316 0%, #ffe259 25%, #ffffff 40%, #ffe259 55%, #f97316 70%, #ea580c 85%, #f97316 100%)",
              }}
            >Hacks</AnimatedGradientText>
          </h1>

          {/* Event Details */}
          <div className="mb-6 md:mb-8 text-left">
            <span className="block pl-1 font-body text-base sm:text-lg md:text-xl tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              October 11-12th, 2026 @{" "}
              <a
                href="https://orangecoastcollege.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-2"
              >
                Orange Coast College
              </a>
            </span>
          </div>

          {/* CTA Buttons — shared with the join section */}
          <CtaButtons />
        </motion.div>
      </div>
    </section>
  );
}
