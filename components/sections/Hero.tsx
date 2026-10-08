"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import CtaButtons from "@/components/CtaButtons";
import Countdown from "@/components/Countdown";
import HeroAstronaut from "@/components/HeroAstronaut";
import { PRESENTING_SPONSOR } from "@/lib/sponsors";
import { useApplicationsClosed } from "@/lib/use-applications-closed";

/**
 * The original space pirate hero: left-aligned OCCHacks title with the gold
 * gradient sweep, date line, and the clipped cyber CTAs. The backdrop is the
 * global WebGL particle field rendered in the root layout.
 */
export default function Hero({ closed: initialClosed }: { closed: boolean }) {
  const reduceMotion = useReducedMotion();
  const closed = useApplicationsClosed(initialClosed);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden min-h-screen flex flex-col justify-center gap-6 pt-24 sm:pt-28 lg:justify-between lg:gap-0 lg:pt-0"
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

          {/* Event details, with the presenting sponsor alongside once the row fits */}
          <div
            className={`mb-6 flex flex-col gap-2 pl-1 text-left font-body text-base tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-lg md:mb-8 md:text-xl ${
              closed
                ? "xl:flex-row xl:items-center xl:gap-3 xl:whitespace-nowrap"
                : "2xl:flex-row 2xl:items-center 2xl:gap-3 2xl:whitespace-nowrap"
            }`}
          >
            <p className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 sm:whitespace-nowrap">
              <span>
                October 10-11th, 2026 @{" "}
                <a
                  href="https://orangecoastcollege.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-2"
                >
                  Orange Coast College
                </a>
              </span>
              {!closed && (
                <>
                  <span aria-hidden className="hidden text-white/40 sm:inline">|</span>
                  <span>Apply by Monday, October 5th, 11:59pm</span>
                </>
              )}
            </p>
            <span aria-hidden className={`hidden text-white/40 ${closed ? "xl:inline" : "2xl:inline"}`}>|</span>
            <a
              href={PRESENTING_SPONSOR.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <span>Presented by</span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Image
                  src={PRESENTING_SPONSOR.logo}
                  alt=""
                  width={PRESENTING_SPONSOR.width}
                  height={PRESENTING_SPONSOR.height}
                  loading="eager"
                  className="h-9 w-auto object-contain md:h-10"
                />
                <span className="underline-offset-2 group-hover:underline">{PRESENTING_SPONSOR.name}</span>
              </span>
            </a>
          </div>

          {/* Application deadline countdown, then the closed notice in its place */}
          {closed ? (
            <p className="inline-flex rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 font-header text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:px-6 sm:text-2xl md:text-3xl">
              Applications are closed
            </p>
          ) : (
            <Countdown />
          )}

          {/* CTA Buttons — shared with the join section */}
          <div className="mt-8 md:mt-10">
            <CtaButtons location="hero" closed={closed} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
